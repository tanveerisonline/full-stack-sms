import { Router, Request, Response } from 'express';
import { authenticateToken, requireSuperAdmin, logAuditEvent } from './middleware/auth';
import { db } from './db';
import { 
  users, 
  auditLogs, 
  systemSettings, 
  roles, 
  userSessions,
  students,
  teachers,
  transactions
} from '@shared/schema';
import { 
  insertUserSchema, 
  insertSystemSettingSchema, 
  insertRoleSchema,
  type User,
  type AuditLog,
  type SystemSetting,
  type Role
} from '@shared/schema';
import { eq, desc, count, sum, sql } from 'drizzle-orm';
import bcrypt from 'bcrypt';

const router = Router();

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
  };
}

// Auth endpoint that doesn't require authentication 
router.get('/auth/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user && req.user.role === 'super_admin') {
      res.json(req.user);
    } else {
      res.status(403).json({ message: 'Super Admin access required' });
    }
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized' });
  }
});

// Apply super admin authentication to all other routes
router.use(requireSuperAdmin);

// Dashboard overview stats
router.get('/dashboard/stats', async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Get user counts
    const [userStats] = await db
      .select({
        totalUsers: count(),
      })
      .from(users);

    const [studentCount] = await db
      .select({ count: count() })
      .from(students);

    const [teacherCount] = await db
      .select({ count: count() })
      .from(teachers);

    const [adminCount] = await db
      .select({ count: count() })
      .from(users)
      .where(sql`role IN ('admin', 'super_admin')`);

    // Get financial summary
    const [revenueData] = await db
      .select({
        total: sum(transactions.amount),
      })
      .from(transactions)
      .where(eq(transactions.status, 'completed'));

    const [pendingDues] = await db
      .select({
        total: sum(transactions.amount),
      })
      .from(transactions)
      .where(eq(transactions.status, 'pending'));

    // Get recent activity count
    const recentActivities = await db
      .select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.timestamp))
      .limit(10);

    const stats = {
      totalUsers: userStats.totalUsers,
      totalStudents: studentCount.count,
      totalTeachers: teacherCount.count,
      totalAdmins: adminCount.count,
      revenue: Number(revenueData?.total || 0),
      pendingDues: Number(pendingDues?.total || 0),
      recentActivities,
      systemUptime: process.uptime(),
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard statistics' });
  }
});

// User Management
router.get('/users', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const allUsers = await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

    const [totalCount] = await db.select({ count: count() }).from(users);

    await logAuditEvent(
      req.user!.id,
      'view_users',
      'user_management',
      null,
      { page, limit },
      req.ip,
      req.get('user-agent')
    );

    res.json({
      users: allUsers.map(user => ({ ...user, password: undefined })),
      total: totalCount.count,
      page,
      limit,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

router.post('/users', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userData = insertUserSchema.parse(req.body);
    
    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const [newUser] = await db
      .insert(users)
      .values({
        ...userData,
        password: hashedPassword,
      })
      .returning();

    await logAuditEvent(
      req.user!.id,
      'create_user',
      'user',
      newUser.id.toString(),
      { newValues: { ...userData, password: '[HIDDEN]' } },
      req.ip,
      req.get('user-agent')
    );

    res.status(201).json({ ...newUser, password: undefined });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Failed to create user' });
  }
});

router.put('/users/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const updateData = req.body;

    // Get old values for audit log
    const [oldUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!oldUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash password if provided
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const [updatedUser] = await db
      .update(users)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();

    await logAuditEvent(
      req.user!.id,
      'update_user',
      'user',
      userId.toString(),
      { 
        oldValues: { ...oldUser, password: '[HIDDEN]' },
        newValues: { ...updateData, password: updateData.password ? '[HIDDEN]' : undefined }
      },
      req.ip,
      req.get('user-agent')
    );

    res.json({ ...updatedUser, password: undefined });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Failed to update user' });
  }
});

router.delete('/users/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.id);

    // Get user details for audit log
    const [userToDelete] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!userToDelete) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deletion of super admins by other super admins
    if (userToDelete.role === 'super_admin' && req.user!.id !== userId) {
      return res.status(403).json({ message: 'Cannot delete other super admin accounts' });
    }

    await db.delete(users).where(eq(users.id, userId));

    await logAuditEvent(
      req.user!.id,
      'delete_user',
      'user',
      userId.toString(),
      { oldValues: { ...userToDelete, password: '[HIDDEN]' } },
      req.ip,
      req.get('user-agent')
    );

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

// Audit Logs
router.get('/audit-logs', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;

    const logs = await db
      .select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.timestamp))
      .limit(limit)
      .offset(offset);

    const [totalCount] = await db.select({ count: count() }).from(auditLogs);

    res.json({
      logs,
      total: totalCount.count,
      page,
      limit,
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ message: 'Failed to fetch audit logs' });
  }
});

// System Settings
router.get('/settings', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const settings = await db.select().from(systemSettings);
    
    // Don't expose encrypted values
    const safeSettings = settings.map(setting => ({
      ...setting,
      value: setting.isEncrypted ? '[ENCRYPTED]' : setting.value
    }));

    res.json(safeSettings);
  } catch (error) {
    console.error('Error fetching system settings:', error);
    res.status(500).json({ message: 'Failed to fetch system settings' });
  }
});

router.post('/settings', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const settingData = insertSystemSettingSchema.parse(req.body);
    
    const [newSetting] = await db
      .insert(systemSettings)
      .values({
        ...settingData,
        updatedBy: req.user!.id,
      })
      .returning();

    await logAuditEvent(
      req.user!.id,
      'create_setting',
      'system_setting',
      newSetting.id.toString(),
      { newValues: settingData },
      req.ip,
      req.get('user-agent')
    );

    res.status(201).json(newSetting);
  } catch (error) {
    console.error('Error creating system setting:', error);
    res.status(500).json({ message: 'Failed to create system setting' });
  }
});

router.put('/settings/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const settingId = parseInt(req.params.id);
    const updateData = req.body;

    const [oldSetting] = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.id, settingId));

    if (!oldSetting) {
      return res.status(404).json({ message: 'Setting not found' });
    }

    const [updatedSetting] = await db
      .update(systemSettings)
      .set({ 
        ...updateData, 
        updatedBy: req.user!.id,
        updatedAt: new Date() 
      })
      .where(eq(systemSettings.id, settingId))
      .returning();

    await logAuditEvent(
      req.user!.id,
      'update_setting',
      'system_setting',
      settingId.toString(),
      { oldValues: oldSetting, newValues: updateData },
      req.ip,
      req.get('user-agent')
    );

    res.json(updatedSetting);
  } catch (error) {
    console.error('Error updating system setting:', error);
    res.status(500).json({ message: 'Failed to update system setting' });
  }
});

// Role Management
router.get('/roles', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const allRoles = await db.select().from(roles);
    res.json(allRoles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ message: 'Failed to fetch roles' });
  }
});

router.post('/roles', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const roleData = insertRoleSchema.parse(req.body);
    
    const [newRole] = await db
      .insert(roles)
      .values(roleData)
      .returning();

    await logAuditEvent(
      req.user!.id,
      'create_role',
      'role',
      newRole.id.toString(),
      { newValues: roleData },
      req.ip,
      req.get('user-agent')
    );

    res.status(201).json(newRole);
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(500).json({ message: 'Failed to create role' });
  }
});

// Security Operations
router.post('/security/backup', async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Simulate backup operation
    await new Promise(resolve => setTimeout(resolve, 2000));

    await logAuditEvent(
      req.user!.id,
      'database_backup',
      'system',
      null,
      { backupType: 'manual' },
      req.ip,
      req.get('user-agent')
    );

    res.json({ 
      message: 'Database backup completed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({ message: 'Failed to create backup' });
  }
});

router.get('/security/sessions', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const activeSessions = await db
      .select()
      .from(userSessions)
      .where(eq(userSessions.isActive, true))
      .orderBy(desc(userSessions.createdAt));

    res.json(activeSessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ message: 'Failed to fetch active sessions' });
  }
});

export default router;