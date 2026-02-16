import { Router, type Request, type Response } from 'express';
import { eq, desc, and, gte, lte, like, or } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db';
import { auditLogs } from '@shared/schemas/admin';
import { users } from '@shared/schemas/user';
import { authenticateToken, requireSuperAdmin, type AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);
router.use(requireSuperAdmin);

// Query schema for filtering audit logs
const auditQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  userId: z.coerce.number().optional(),
  action: z.string().optional(),
  resourceType: z.string().optional(),
  resourceId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  search: z.string().optional(),
});

// Get audit logs with filtering and pagination
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const query = auditQuerySchema.parse(req.query);
    const offset = (query.page - 1) * query.limit;

    // Build where conditions
    const conditions = [];

    if (query.userId) {
      conditions.push(eq(auditLogs.userId, query.userId));
    }

    if (query.action) {
      conditions.push(like(auditLogs.action, `%${query.action}%`));
    }

    if (query.resourceType) {
      conditions.push(eq(auditLogs.resourceType, query.resourceType));
    }

    if (query.resourceId) {
      conditions.push(eq(auditLogs.resourceId, query.resourceId));
    }

    if (query.startDate) {
      conditions.push(gte(auditLogs.createdAt, new Date(query.startDate)));
    }

    if (query.endDate) {
      conditions.push(lte(auditLogs.createdAt, new Date(query.endDate)));
    }

    if (query.search) {
      conditions.push(
        or(
          like(auditLogs.action, `%${query.search}%`),
          like(auditLogs.resourceType, `%${query.search}%`),
          like(auditLogs.resourceId, `%${query.search}%`),
          like(auditLogs.ipAddress, `%${query.search}%`)
        )
      );
    }

    // Get logs with user information
    const logs = await db
      .select({
        id: auditLogs.id,
        userId: auditLogs.userId,
        action: auditLogs.action,
        resourceType: auditLogs.resourceType,
        resourceId: auditLogs.resourceId,
        oldValues: auditLogs.oldValues,
        newValues: auditLogs.newValues,
        ipAddress: auditLogs.ipAddress,
        userAgent: auditLogs.userAgent,
        createdAt: auditLogs.createdAt,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.userId, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(auditLogs.createdAt))
      .limit(query.limit)
      .offset(offset);

    // Get total count for pagination
    const [{ count }] = await db
      .select({ count: auditLogs.id })
      .from(auditLogs)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const totalPages = Math.ceil(Number(count) / query.limit);

    res.json({
      logs,
      pagination: {
        currentPage: query.page,
        totalPages,
        totalItems: Number(count),
        itemsPerPage: query.limit,
        hasNextPage: query.page < totalPages,
        hasPreviousPage: query.page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ message: 'Failed to fetch audit logs' });
  }
});

// Get audit log statistics
router.get('/stats', async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Get total logs count
    const [{ totalLogs }] = await db
      .select({ totalLogs: auditLogs.id })
      .from(auditLogs);

    // Get logs from last 24 hours
    const last24Hours = new Date();
    last24Hours.setHours(last24Hours.getHours() - 24);

    const [{ recentLogs }] = await db
      .select({ recentLogs: auditLogs.id })
      .from(auditLogs)
      .where(gte(auditLogs.createdAt, last24Hours));

    // Get top actions
    const topActions = await db
      .select({
        action: auditLogs.action,
        count: auditLogs.id,
      })
      .from(auditLogs)
      .groupBy(auditLogs.action)
      .orderBy(desc(auditLogs.id))
      .limit(5);

    // Get top resource types
    const topResourceTypes = await db
      .select({
        resourceType: auditLogs.resourceType,
        count: auditLogs.id,
      })
      .from(auditLogs)
      .groupBy(auditLogs.resourceType)
      .orderBy(desc(auditLogs.id))
      .limit(5);

    // Get active users (users who performed actions in last 7 days)
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const activeUsers = await db
      .select({
        userId: auditLogs.userId,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        actionCount: auditLogs.id,
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.userId, users.id))
      .where(gte(auditLogs.createdAt, last7Days))
      .groupBy(auditLogs.userId, users.username, users.firstName, users.lastName)
      .orderBy(desc(auditLogs.id))
      .limit(10);

    res.json({
      totalLogs: Number(totalLogs),
      recentLogs: Number(recentLogs),
      topActions,
      topResourceTypes,
      activeUsers,
    });
  } catch (error) {
    console.error('Error fetching audit stats:', error);
    res.status(500).json({ message: 'Failed to fetch audit statistics' });
  }
});

// Get audit log by ID
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid audit log ID' });
    }

    const [log] = await db
      .select({
        id: auditLogs.id,
        userId: auditLogs.userId,
        action: auditLogs.action,
        resourceType: auditLogs.resourceType,
        resourceId: auditLogs.resourceId,
        oldValues: auditLogs.oldValues,
        newValues: auditLogs.newValues,
        ipAddress: auditLogs.ipAddress,
        userAgent: auditLogs.userAgent,
        createdAt: auditLogs.createdAt,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.userId, users.id))
      .where(eq(auditLogs.id, id));

    if (!log) {
      return res.status(404).json({ message: 'Audit log not found' });
    }

    res.json(log);
  } catch (error) {
    console.error('Error fetching audit log:', error);
    res.status(500).json({ message: 'Failed to fetch audit log' });
  }
});

// Export audit logs
router.get('/export/:format', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { format } = req.params;
    const query = auditQuerySchema.omit({ page: true, limit: true }).parse(req.query);

    if (!['csv', 'json'].includes(format)) {
      return res.status(400).json({ message: 'Invalid export format. Use csv or json.' });
    }

    // Build where conditions (same as main query)
    const conditions = [];

    if (query.userId) {
      conditions.push(eq(auditLogs.userId, query.userId));
    }
    if (query.action) {
      conditions.push(like(auditLogs.action, `%${query.action}%`));
    }
    if (query.resourceType) {
      conditions.push(eq(auditLogs.resourceType, query.resourceType));
    }
    if (query.resourceId) {
      conditions.push(eq(auditLogs.resourceId, query.resourceId));
    }
    if (query.startDate) {
      conditions.push(gte(auditLogs.createdAt, new Date(query.startDate)));
    }
    if (query.endDate) {
      conditions.push(lte(auditLogs.createdAt, new Date(query.endDate)));
    }

    // Get all matching logs (no pagination for export)
    const logs = await db
      .select({
        id: auditLogs.id,
        userId: auditLogs.userId,
        action: auditLogs.action,
        resourceType: auditLogs.resourceType,
        resourceId: auditLogs.resourceId,
        oldValues: auditLogs.oldValues,
        newValues: auditLogs.newValues,
        ipAddress: auditLogs.ipAddress,
        userAgent: auditLogs.userAgent,
        createdAt: auditLogs.createdAt,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.userId, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(auditLogs.createdAt));

    if (format === 'csv') {
      // Generate CSV
      const csvHeaders = [
        'ID', 'User ID', 'Username', 'First Name', 'Last Name', 'Email',
        'Action', 'Resource Type', 'Resource ID', 'Old Values', 'New Values',
        'IP Address', 'User Agent', 'Created At'
      ];

      const csvRows = logs.map(log => [
        log.id,
        log.userId || '',
        log.username || '',
        log.firstName || '',
        log.lastName || '',
        log.email || '',
        log.action,
        log.resourceType,
        log.resourceId || '',
        log.oldValues || '',
        log.newValues || '',
        log.ipAddress || '',
        log.userAgent || '',
        log.createdAt.toISOString()
      ]);

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
        .join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvContent);
    } else {
      // JSON format
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${new Date().toISOString().split('T')[0]}.json"`);
      res.json({
        exportedAt: new Date().toISOString(),
        totalRecords: logs.length,
        filters: query,
        data: logs
      });
    }
  } catch (error) {
    console.error('Error exporting audit logs:', error);
    res.status(500).json({ message: 'Failed to export audit logs' });
  }
});

// Delete old audit logs (cleanup)
router.delete('/cleanup', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { olderThan } = req.query;
    
    if (!olderThan || typeof olderThan !== 'string') {
      return res.status(400).json({ message: 'olderThan parameter required (number of days)' });
    }

    const days = parseInt(olderThan);
    if (isNaN(days) || days < 1) {
      return res.status(400).json({ message: 'olderThan must be a positive number of days' });
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await db
      .delete(auditLogs)
      .where(lte(auditLogs.createdAt, cutoffDate));

    res.json({
      message: `Deleted audit logs older than ${days} days`,
      deletedCount: (result as any).affectedRows || 0,
      cutoffDate: cutoffDate.toISOString()
    });
  } catch (error) {
    console.error('Error cleaning up audit logs:', error);
    res.status(500).json({ message: 'Failed to cleanup audit logs' });
  }
});

export default router;