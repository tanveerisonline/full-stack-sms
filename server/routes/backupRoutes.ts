import { Router, type Request, type Response } from 'express';
import { db } from '../db';
import { authenticateToken, requireSuperAdmin, type AuthenticatedRequest, logAuditEvent } from '../middleware/auth';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import { z } from 'zod';

const execAsync = promisify(exec);
const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);
router.use(requireSuperAdmin);

// Backup directory configuration
const BACKUP_DIR = path.join(process.cwd(), 'backups');
const MAX_BACKUP_AGE_DAYS = 30; // Keep backups for 30 days
const MAX_BACKUP_COUNT = 10; // Keep maximum 10 backups

// Ensure backup directory exists
async function ensureBackupDir() {
  try {
    await fs.access(BACKUP_DIR);
  } catch {
    await fs.mkdir(BACKUP_DIR, { recursive: true });
  }
}

// Validation schemas
const createBackupSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
});

const restoreBackupSchema = z.object({
  filename: z.string().min(1),
  confirmRestore: z.boolean().refine(val => val === true, {
    message: "Must confirm restore operation"
  }),
});

// Create database backup
router.post('/create', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description } = createBackupSchema.parse(req.body);
    
    await ensureBackupDir();
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = name || `backup-${timestamp}`;
    const filename = `${backupName}-${timestamp}.sql`;
    const filepath = path.join(BACKUP_DIR, filename);
    
    // Get database connection details from environment
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      return res.status(500).json({ message: 'Database URL not configured' });
    }

    // Parse database URL
    const dbUrl = new URL(databaseUrl);
    const host = dbUrl.hostname;
    const port = dbUrl.port || '5432';
    const database = dbUrl.pathname.slice(1);
    const username = dbUrl.username;
    const password = dbUrl.password;

    // Create pg_dump command
    const pgDumpCommand = `PGPASSWORD="${password}" pg_dump -h ${host} -p ${port} -U ${username} -d ${database} --verbose --clean --no-owner --no-privileges --format=custom --file="${filepath}"`;
    
    // Execute backup
    await execAsync(pgDumpCommand);
    
    // Get file stats
    const stats = await fs.stat(filepath);
    
    // Create backup metadata
    const metadata = {
      filename,
      name: backupName,
      description: description || '',
      size: stats.size,
      createdAt: new Date().toISOString(),
      createdBy: req.user!.id,
      createdByUsername: req.user!.username,
    };
    
    // Save metadata
    const metadataPath = filepath.replace('.sql', '.json');
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
    
    // Log audit event
    await logAuditEvent(
      req.user!.id,
      'create_backup',
      'database',
      filename,
      { newValues: metadata },
      req.ip,
      req.get('user-agent')
    );
    
    // Clean up old backups
    await cleanupOldBackups();
    
    res.json({
      message: 'Backup created successfully',
      backup: metadata
    });
    
  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({ 
      message: 'Failed to create backup',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// List all backups
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    await ensureBackupDir();
    
    const files = await fs.readdir(BACKUP_DIR);
    const backupFiles = files.filter(file => file.endsWith('.sql'));
    
    const backups = await Promise.all(
      backupFiles.map(async (file) => {
        const metadataPath = path.join(BACKUP_DIR, file.replace('.sql', '.json'));
        try {
          const metadataContent = await fs.readFile(metadataPath, 'utf-8');
          const metadata = JSON.parse(metadataContent);
          
          // Get current file stats
          const sqlPath = path.join(BACKUP_DIR, file);
          const stats = await fs.stat(sqlPath);
          
          return {
            ...metadata,
            size: stats.size,
            lastModified: stats.mtime.toISOString(),
          };
        } catch {
          // If no metadata file, create basic info
          const sqlPath = path.join(BACKUP_DIR, file);
          const stats = await fs.stat(sqlPath);
          
          return {
            filename: file,
            name: file.replace('.sql', ''),
            description: 'No description available',
            size: stats.size,
            createdAt: stats.birthtime.toISOString(),
            lastModified: stats.mtime.toISOString(),
            createdBy: null,
            createdByUsername: 'Unknown',
          };
        }
      })
    );
    
    // Sort by creation date (newest first)
    backups.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    res.json({ backups });
    
  } catch (error) {
    console.error('Error listing backups:', error);
    res.status(500).json({ message: 'Failed to list backups' });
  }
});

// Download backup file
router.get('/download/:filename', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { filename } = req.params;
    
    // Validate filename (security check)
    if (!filename.endsWith('.sql') || filename.includes('..') || filename.includes('/')) {
      return res.status(400).json({ message: 'Invalid filename' });
    }
    
    const filepath = path.join(BACKUP_DIR, filename);
    
    // Check if file exists
    try {
      await fs.access(filepath);
    } catch {
      return res.status(404).json({ message: 'Backup file not found' });
    }
    
    // Log audit event
    await logAuditEvent(
      req.user!.id,
      'download_backup',
      'database',
      filename,
      { filename },
      req.ip,
      req.get('user-agent')
    );
    
    // Send file
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    
    const fileContent = await fs.readFile(filepath);
    res.send(fileContent);
    
  } catch (error) {
    console.error('Error downloading backup:', error);
    res.status(500).json({ message: 'Failed to download backup' });
  }
});

// Restore database from backup
router.post('/restore', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { filename, confirmRestore } = restoreBackupSchema.parse(req.body);
    
    // Validate filename (security check)
    if (!filename.endsWith('.sql') || filename.includes('..') || filename.includes('/')) {
      return res.status(400).json({ message: 'Invalid filename' });
    }
    
    const filepath = path.join(BACKUP_DIR, filename);
    
    // Check if backup file exists
    try {
      await fs.access(filepath);
    } catch {
      return res.status(404).json({ message: 'Backup file not found' });
    }
    
    // Get database connection details
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      return res.status(500).json({ message: 'Database URL not configured' });
    }

    // Parse database URL
    const dbUrl = new URL(databaseUrl);
    const host = dbUrl.hostname;
    const port = dbUrl.port || '5432';
    const database = dbUrl.pathname.slice(1);
    const username = dbUrl.username;
    const password = dbUrl.password;

    // Create a pre-restore backup first
    const preRestoreTimestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const preRestoreFilename = `pre-restore-${preRestoreTimestamp}.sql`;
    const preRestoreFilepath = path.join(BACKUP_DIR, preRestoreFilename);
    
    const preRestoreDumpCommand = `PGPASSWORD="${password}" pg_dump -h ${host} -p ${port} -U ${username} -d ${database} --verbose --clean --no-owner --no-privileges --format=custom --file="${preRestoreFilepath}"`;
    
    await execAsync(preRestoreDumpCommand);
    
    // Create metadata for pre-restore backup
    const preRestoreStats = await fs.stat(preRestoreFilepath);
    const preRestoreMetadata = {
      filename: preRestoreFilename,
      name: `Pre-restore backup ${preRestoreTimestamp}`,
      description: `Automatic backup created before restoring from ${filename}`,
      size: preRestoreStats.size,
      createdAt: new Date().toISOString(),
      createdBy: req.user!.id,
      createdByUsername: req.user!.username,
      isPreRestore: true,
    };
    
    const preRestoreMetadataPath = preRestoreFilepath.replace('.sql', '.json');
    await fs.writeFile(preRestoreMetadataPath, JSON.stringify(preRestoreMetadata, null, 2));
    
    // Restore from backup
    const pgRestoreCommand = `PGPASSWORD="${password}" pg_restore -h ${host} -p ${port} -U ${username} -d ${database} --clean --if-exists --verbose "${filepath}"`;
    
    await execAsync(pgRestoreCommand);
    
    // Log audit event
    await logAuditEvent(
      req.user!.id,
      'restore_backup',
      'database',
      filename,
      { 
        restoredFrom: filename,
        preRestoreBackup: preRestoreFilename,
      },
      req.ip,
      req.get('user-agent')
    );
    
    res.json({
      message: 'Database restored successfully',
      restoredFrom: filename,
      preRestoreBackup: preRestoreFilename,
    });
    
  } catch (error) {
    console.error('Error restoring backup:', error);
    res.status(500).json({ 
      message: 'Failed to restore backup',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete backup
router.delete('/:filename', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { filename } = req.params;
    
    // Validate filename (security check)
    if (!filename.endsWith('.sql') || filename.includes('..') || filename.includes('/')) {
      return res.status(400).json({ message: 'Invalid filename' });
    }
    
    const filepath = path.join(BACKUP_DIR, filename);
    const metadataPath = filepath.replace('.sql', '.json');
    
    // Check if backup file exists
    try {
      await fs.access(filepath);
    } catch {
      return res.status(404).json({ message: 'Backup file not found' });
    }
    
    // Delete backup file and metadata
    await fs.unlink(filepath);
    
    try {
      await fs.unlink(metadataPath);
    } catch {
      // Metadata file might not exist
    }
    
    // Log audit event
    await logAuditEvent(
      req.user!.id,
      'delete_backup',
      'database',
      filename,
      { deletedFile: filename },
      req.ip,
      req.get('user-agent')
    );
    
    res.json({ message: 'Backup deleted successfully' });
    
  } catch (error) {
    console.error('Error deleting backup:', error);
    res.status(500).json({ message: 'Failed to delete backup' });
  }
});

// Get backup system status
router.get('/status', async (req: AuthenticatedRequest, res: Response) => {
  try {
    await ensureBackupDir();
    
    const files = await fs.readdir(BACKUP_DIR);
    const backupFiles = files.filter(file => file.endsWith('.sql'));
    
    let totalSize = 0;
    for (const file of backupFiles) {
      const filepath = path.join(BACKUP_DIR, file);
      const stats = await fs.stat(filepath);
      totalSize += stats.size;
    }
    
    // Check if pg_dump is available
    let pgDumpAvailable = false;
    try {
      await execAsync('pg_dump --version');
      pgDumpAvailable = true;
    } catch {
      pgDumpAvailable = false;
    }
    
    // Check if pg_restore is available
    let pgRestoreAvailable = false;
    try {
      await execAsync('pg_restore --version');
      pgRestoreAvailable = true;
    } catch {
      pgRestoreAvailable = false;
    }
    
    // Check database connectivity
    let databaseConnected = false;
    try {
      await db.execute('SELECT 1');
      databaseConnected = true;
    } catch {
      databaseConnected = false;
    }
    
    res.json({
      status: 'operational',
      backupCount: backupFiles.length,
      totalSize,
      backupDirectory: BACKUP_DIR,
      pgDumpAvailable,
      pgRestoreAvailable,
      databaseConnected,
      maxBackupAge: MAX_BACKUP_AGE_DAYS,
      maxBackupCount: MAX_BACKUP_COUNT,
    });
    
  } catch (error) {
    console.error('Error getting backup status:', error);
    res.status(500).json({ message: 'Failed to get backup status' });
  }
});

// Auto cleanup old backups
async function cleanupOldBackups() {
  try {
    await ensureBackupDir();
    
    const files = await fs.readdir(BACKUP_DIR);
    const backupFiles = files.filter(file => file.endsWith('.sql'));
    
    // Get file stats and sort by age
    const fileStats = await Promise.all(
      backupFiles.map(async (file) => {
        const filepath = path.join(BACKUP_DIR, file);
        const stats = await fs.stat(filepath);
        return {
          filename: file,
          filepath,
          createdAt: stats.birthtime,
          size: stats.size,
        };
      })
    );
    
    // Sort by creation time (oldest first)
    fileStats.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    
    const now = new Date();
    const cutoffDate = new Date(now.getTime() - (MAX_BACKUP_AGE_DAYS * 24 * 60 * 60 * 1000));
    
    // Delete old backups (by age)
    for (const file of fileStats) {
      if (file.createdAt < cutoffDate) {
        try {
          await fs.unlink(file.filepath);
          // Also delete metadata
          const metadataPath = file.filepath.replace('.sql', '.json');
          try {
            await fs.unlink(metadataPath);
          } catch {
            // Metadata might not exist
          }
          console.log(`Cleaned up old backup: ${file.filename}`);
        } catch (error) {
          console.error(`Failed to cleanup backup ${file.filename}:`, error);
        }
      }
    }
    
    // Delete excess backups (by count)
    if (fileStats.length > MAX_BACKUP_COUNT) {
      const excessFiles = fileStats.slice(0, fileStats.length - MAX_BACKUP_COUNT);
      for (const file of excessFiles) {
        try {
          await fs.unlink(file.filepath);
          // Also delete metadata
          const metadataPath = file.filepath.replace('.sql', '.json');
          try {
            await fs.unlink(metadataPath);
          } catch {
            // Metadata might not exist
          }
          console.log(`Cleaned up excess backup: ${file.filename}`);
        } catch (error) {
          console.error(`Failed to cleanup backup ${file.filename}:`, error);
        }
      }
    }
    
  } catch (error) {
    console.error('Error during backup cleanup:', error);
  }
}

// Cleanup endpoint
router.post('/cleanup', async (req: AuthenticatedRequest, res: Response) => {
  try {
    await cleanupOldBackups();
    
    // Log audit event
    await logAuditEvent(
      req.user!.id,
      'cleanup_backups',
      'database',
      null,
      { action: 'manual_cleanup' },
      req.ip,
      req.get('user-agent')
    );
    
    res.json({ message: 'Backup cleanup completed successfully' });
    
  } catch (error) {
    console.error('Error during manual cleanup:', error);
    res.status(500).json({ message: 'Failed to cleanup backups' });
  }
});

export default router;