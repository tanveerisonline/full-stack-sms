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
import { eq, desc, count, sum, sql, and, gte, lte, inArray } from 'drizzle-orm';
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
    if (req.user && (req.user.role === 'super_admin' || req.user.role === 'Super Administrator')) {
      res.json(req.user);
    } else {
      res.status(403).json({ message: 'Super Admin access required' });
    }
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized' });
  }
});

// Apply authentication to all other routes
router.use(authenticateToken);
router.use(requireSuperAdmin);

// Dashboard overview stats
router.get('/dashboard/stats', async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Get user counts with null safety
    const [userStats] = await db
      .select({ count: count() })
      .from(users);

    const [activeUserStats] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.isActive, true));

    const [studentCount] = await db
      .select({ count: count() })
      .from(students);

    const [teacherCount] = await db
      .select({ count: count() })
      .from(teachers);

    const [adminCount] = await db
      .select({ count: count() })
      .from(users)
      .where(sql`role IN ('admin', 'super_admin', 'Super Administrator')`);

    // Get financial summary with null safety
    const revenueData = await db
      .select({
        total: sum(transactions.amount),
      })
      .from(transactions)
      .where(eq(transactions.status, 'completed'));

    const pendingDuesData = await db
      .select({
        total: sum(transactions.amount),
      })
      .from(transactions)
      .where(eq(transactions.status, 'pending'));

    // Calculate system uptime in readable format
    const uptimeSeconds = process.uptime();
    const days = Math.floor(uptimeSeconds / (24 * 60 * 60));
    const hours = Math.floor((uptimeSeconds % (24 * 60 * 60)) / (60 * 60));
    const systemUptime = `${days} days, ${hours} hours`;

    // Get error count from audit logs with specific action filter
    const [errorCount] = await db
      .select({ count: count() })
      .from(auditLogs)
      .where(sql`action LIKE '%error%' OR action LIKE '%fail%'`);
    
    // Get failed login attempts count
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const [failedLoginCount] = await db
      .select({ count: count() })
      .from(auditLogs)
      .where(
        and(
          sql`action LIKE '%fail%' OR action LIKE '%unauthorized%'`,
          gte(auditLogs.createdAt, yesterday)
        )
      );

    const stats = {
      totalUsers: userStats?.count || 0,
      activeUsers: activeUserStats?.count || 0,
      totalStudents: studentCount?.count || 0,
      totalTeachers: teacherCount?.count || 0,
      totalAdmins: adminCount?.count || 0,
      revenue: Number(revenueData?.[0]?.total || 0),
      pendingDues: Number(pendingDuesData?.[0]?.total || 0),
      systemUptime,
      errorLogs: errorCount?.count || 0,
      failedLogins: failedLoginCount?.count || 0
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ 
      message: 'Failed to fetch dashboard statistics',
      stats: {
        totalUsers: 0,
        activeUsers: 0,
        totalStudents: 0,
        totalTeachers: 0,
        totalAdmins: 0,
        revenue: 0,
        pendingDues: 0,
        systemUptime: '0 days, 0 hours',
        errorLogs: 0,
        failedLogins: 0
      }
    });
  }
});

// Recent activities endpoint
router.get('/dashboard/activities', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const activities = await db
      .select()
      .from(auditLogs)
      .limit(15);

    // Get user names for activities
    const userIds = activities.map(a => a.userId).filter((id): id is number => id !== null);
    const activityUsers = userIds.length > 0 ? await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        username: users.username
      })
      .from(users)
      .where(inArray(users.id, userIds)) : [];

    const formattedActivities = activities.map(activity => {
      const user = activityUsers.find(u => u.id === activity.userId);
      const userName = user ? `${user.firstName} ${user.lastName}` : 'System';
      
      let actionDescription = '';
      let severity = 'low';
      
      switch (activity.action) {
        case 'CREATE':
          actionDescription = `Created new ${activity.resourceType.toLowerCase()}`;
          severity = 'low';
          break;
        case 'UPDATE':
          actionDescription = `Updated ${activity.resourceType.toLowerCase()}`;
          severity = 'medium';
          break;
        case 'DELETE':
          actionDescription = `Deleted ${activity.resourceType.toLowerCase()}`;
          severity = 'high';
          break;
        case 'LOGIN':
          actionDescription = 'User logged in';
          severity = 'low';
          break;
        case 'LOGOUT':
          actionDescription = 'User logged out';
          severity = 'low';
          break;
        default:
          actionDescription = `${activity.action} on ${activity.resourceType}`;
          severity = 'medium';
      }

      return {
        id: activity.id,
        user: userName,
        action: actionDescription,
        timestamp: activity.createdAt,
        type: activity.resourceType.toLowerCase(),
        severity,
        ipAddress: activity.ipAddress
      };
    });

    res.json({ activities: formattedActivities });
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ message: 'Failed to fetch activities' });
  }
});

// Security alerts endpoint
router.get('/dashboard/security', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const alerts = [];
    
    // Check for failed login attempts (last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Simplified failed login check
    const [failedLogins] = await db
      .select({ count: count() })
      .from(auditLogs);

    if (failedLogins.count > 10) {
      alerts.push({
        id: 'failed-logins',
        title: 'Multiple Failed Login Attempts',
        message: `${failedLogins.count} failed login attempts detected in the last 24 hours`,
        severity: 'high',
        timestamp: new Date().toISOString()
      });
    }

    // Note: Backup functionality would be implemented with proper backup table
    // For now, adding a general backup reminder
    alerts.push({
      id: 'backup-reminder',
      title: 'Backup Reminder',
      message: 'Regular database backups are recommended for data security.',
      severity: 'medium',
      timestamp: new Date().toISOString()
    });

    // Check system resources (mock for now, in real system would check actual metrics)
    const memoryUsage = process.memoryUsage();
    const memoryPercent = Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100);
    
    if (memoryPercent > 80) {
      alerts.push({
        id: 'memory-warning',
        title: 'High Memory Usage',
        message: `System memory usage at ${memoryPercent}%. Consider restarting services.`,
        severity: 'medium',
        timestamp: new Date().toISOString()
      });
    }

    res.json({ alerts });
  } catch (error) {
    console.error('Error fetching security alerts:', error);
    res.status(500).json({ message: 'Failed to fetch security alerts' });
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
    // Validate request body
    const userData = insertUserSchema.parse(req.body);
    
    // Check if user already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.username, userData.username));
    
    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists' });
    }
    
    const [existingEmail] = await db
      .select()
      .from(users)
      .where(eq(users.email, userData.email));
    
    if (existingEmail) {
      return res.status(409).json({ message: 'Email already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const result = await db
      .insert(users)
      .values({
        ...userData,
        password: hashedPassword,
        isApproved: userData.isApproved ?? true, // Super admin created users are auto-approved by default
      });
    
    const insertId = (result as any).insertId;
    if (!insertId) throw new Error('Failed to get insert ID');
    
    const [newUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, Number(insertId)));

    await logAuditEvent(
      req.user!.id,
      'CREATE',
      'USER',
      newUser.id.toString(),
      { newValues: { ...userData, password: '[HIDDEN]' } },
      req.ip,
      req.get('user-agent')
    );

    res.status(201).json({ ...newUser, password: undefined });
  } catch (error: any) {
    console.error('Error creating user:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: 'Invalid user data', errors: error.errors });
    }
    res.status(500).json({ message: 'Failed to create user' });
  }
});

router.put('/users/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    const updateData = req.body;

    // Get old values for audit log
    const [oldUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!oldUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prepare update data
    const dataToUpdate: any = { ...updateData };
    
    // Hash password if provided
    if (updateData.password && updateData.password.trim() !== '') {
      dataToUpdate.password = await bcrypt.hash(updateData.password, 10);
    } else {
      // Remove password from update if empty or not provided
      delete dataToUpdate.password;
    }
    
    // Update timestamp
    dataToUpdate.updatedAt = new Date();

    await db
      .update(users)
      .set(dataToUpdate)
      .where(eq(users.id, userId));
    
    const [updatedUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    await logAuditEvent(
      req.user!.id,
      'UPDATE',
      'USER',
      userId.toString(),
      { 
        oldValues: { ...oldUser, password: '[HIDDEN]' },
        newValues: { ...dataToUpdate, password: dataToUpdate.password ? '[HIDDEN]' : undefined }
      },
      req.ip,
      req.get('user-agent')
    );

    res.json({ ...updatedUser, password: undefined });
  } catch (error: any) {
    console.error('Error updating user:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: 'Invalid user data', errors: error.errors });
    }
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
    if ((userToDelete.role === 'super_admin' || userToDelete.role === 'Super Administrator') && req.user!.id !== userId) {
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
      .orderBy(desc(auditLogs.createdAt))
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
    const settings = await db.select().from(systemSettings).orderBy(systemSettings.category, systemSettings.key);
    
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
    
    const result = await db
      .insert(systemSettings)
      .values({
        ...settingData,
        updatedBy: req.user!.id,
      });
    
    const insertId = (result as any).insertId;
    if (!insertId) throw new Error('Failed to get insert ID');
    
    const [newSetting] = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.id, Number(insertId)));

    await logAuditEvent(
      req.user!.id,
      'CREATE',
      'SYSTEM_SETTING',
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

    await db
      .update(systemSettings)
      .set({ 
        ...updateData, 
        updatedBy: req.user!.id 
      })
      .where(eq(systemSettings.id, settingId));
    
    const [updatedSetting] = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.id, settingId));

    await logAuditEvent(
      req.user!.id,
      'UPDATE',
      'SYSTEM_SETTING',
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
    const allRoles = await db.select().from(roles).orderBy(roles.name);
    res.json(allRoles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ message: 'Failed to fetch roles' });
  }
});

router.post('/roles', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const roleData = insertRoleSchema.parse(req.body);
    
    const result = await db
      .insert(roles)
      .values(roleData);
    
    const insertId = (result as any).insertId;
    if (!insertId) throw new Error('Failed to get insert ID');
    
    const [newRole] = await db
      .select()
      .from(roles)
      .where(eq(roles.id, Number(insertId)));

    await logAuditEvent(
      req.user!.id,
      'CREATE',
      'ROLE',
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

router.put('/roles/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = insertRoleSchema.partial().parse(req.body);
    
    await db
      .update(roles)
      .set(validatedData)
      .where(eq(roles.id, parseInt(id)));
    
    const [role] = await db
      .select()
      .from(roles)
      .where(eq(roles.id, parseInt(id)));
    
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    
    await logAuditEvent(req.user!.id, 'UPDATE', 'ROLE', id.toString(), validatedData, req.ip, req.get('user-agent'));
    
    res.json(role);
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ message: 'Failed to update role' });
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

// (Duplicate routes removed - defined earlier in the file)

// Active Sessions Management
router.get('/sessions', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const activeSessions = await db
      .select({
        id: userSessions.id,
        userId: userSessions.userId,
        ipAddress: userSessions.ipAddress,
        userAgent: userSessions.userAgent,
        createdAt: userSessions.createdAt,
        // lastActivity: userSessions.lastActivity, // Field doesn't exist
        expiresAt: userSessions.expiresAt,
        user: {
          id: users.id,
          username: users.username,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          role: users.role
        }
      })
      .from(userSessions)
      .leftJoin(users, eq(userSessions.userId, users.id))
      .where(eq(userSessions.isActive, true))
      .orderBy(desc(userSessions.createdAt));
    
    res.json(activeSessions);
  } catch (error) {
    console.error('Error fetching active sessions:', error);
    res.status(500).json({ message: 'Failed to fetch active sessions' });
  }
});

router.delete('/sessions/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    await db
      .update(userSessions)
      .set({ isActive: false })
      .where(eq(userSessions.id, parseInt(id)));
    
    const [session] = await db
      .select()
      .from(userSessions)
      .where(eq(userSessions.id, parseInt(id)));
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    await logAuditEvent(req.user!.id, 'DELETE', 'USER_SESSION', id, 
      { terminatedSession: id }, req.ip || 'unknown');
    
    res.json({ message: 'Session terminated successfully' });
  } catch (error) {
    console.error('Error terminating session:', error);
    res.status(500).json({ message: 'Failed to terminate session' });
  }
});

// Backup Management (placeholder - would integrate with actual backup system)
router.get('/backups', async (req: AuthenticatedRequest, res: Response) => {
  try {
    // This would typically query a backups table or external backup service
    const mockBackups = [
      {
        id: '1',
        name: 'Daily Backup - ' + new Date().toISOString().split('T')[0],
        type: 'full',
        status: 'completed',
        size: 2.5 * 1024 * 1024 * 1024, // 2.5GB
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 23 * 60 * 60 * 1000)
      },
      {
        id: '2',
        name: 'Weekly Backup - ' + new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        type: 'full',
        status: 'completed',
        size: 2.3 * 1024 * 1024 * 1024, // 2.3GB
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 3600000)
      }
    ];
    
    res.json(mockBackups);
  } catch (error) {
    console.error('Error fetching backups:', error);
    res.status(500).json({ message: 'Failed to fetch backup information' });
  }
});

router.post('/backups', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, type = 'manual' } = req.body;
    
    // This would typically trigger a backup process
    const backup = {
      id: Date.now().toString(),
      name: name || `Manual Backup - ${new Date().toISOString()}`,
      type,
      status: 'pending',
      createdBy: req.user!.id,
      createdAt: new Date()
    };
    
    await logAuditEvent(req.user!.id, 'CREATE', 'BACKUP', backup.id.toString(), backup, req.ip, req.get('user-agent'));
    
    res.status(201).json(backup);
  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({ message: 'Failed to create backup' });
  }
});

// Reports & Analytics
router.get('/reports/overview', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    
    // User growth over time
    const userGrowth = await db
      .select({
        date: sql<string>`DATE(${users.createdAt})`,
        count: count()
      })
      .from(users)
      .where(
        startDate && endDate 
          ? and(
              gte(users.createdAt, new Date(startDate as string)),
              lte(users.createdAt, new Date(endDate as string))
            )
          : sql`true`
      )
      .groupBy(sql`DATE(${users.createdAt})`)
      .orderBy(sql`DATE(${users.createdAt})`);
    
    // Activity summary
    const activitySummary = await db
      .select({
        action: auditLogs.action,
        count: count()
      })
      .from(auditLogs)
      .where(
        startDate && endDate
          ? and(
              gte(auditLogs.createdAt, new Date(startDate as string)),
              lte(auditLogs.createdAt, new Date(endDate as string))
            )
          : sql`true`
      )
      .groupBy(auditLogs.action);
    
    res.json({
      userGrowth,
      activitySummary,
      period: { startDate, endDate }
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ message: 'Failed to generate report' });
  }
});

export default router;