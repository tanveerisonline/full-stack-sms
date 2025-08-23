import { and, count, desc, eq, gte, lte, sql } from 'drizzle-orm';
import { db } from '../db';
import { 
  users, 
  students, 
  teachers, 
  auditLogs, 
  systemSettings,
  userSessions,
  InsertSystemSetting 
} from '../../shared/schemas';

export class AdminService {
  async getDashboardStatistics() {
    const [usersCount] = await db.select({ count: count() }).from(users);
    const [studentsCount] = await db.select({ count: count() }).from(students);
    const [teachersCount] = await db.select({ count: count() }).from(teachers);
    const [activeSessionsCount] = await db
      .select({ count: count() })
      .from(userSessions)
      .where(eq(userSessions.isActive, true));

    const recentLogs = await db
      .select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.timestamp))
      .limit(10);

    const systemUptime = process.uptime();
    const memoryUsage = process.memoryUsage();

    return {
      totalUsers: usersCount.count,
      totalStudents: studentsCount.count,
      totalTeachers: teachersCount.count,
      activeSessions: activeSessionsCount.count,
      systemUptime: Math.floor(systemUptime / 3600) + ' hours',
      memoryUsage: Math.round(memoryUsage.used / 1024 / 1024) + ' MB',
      errorLogs: recentLogs.filter(log => log.action.includes('error')).length,
      recentActivity: recentLogs,
    };
  }

  async getAuditLogs(options: {
    page: number;
    limit: number;
    filters: {
      action?: string;
      resourceType?: string;
      startDate?: string;
      endDate?: string;
    };
  }) {
    const { page, limit, filters } = options;
    const offset = (page - 1) * limit;

    let whereConditions = [];

    if (filters.action) {
      whereConditions.push(eq(auditLogs.action, filters.action));
    }

    if (filters.resourceType) {
      whereConditions.push(eq(auditLogs.resourceType, filters.resourceType));
    }

    if (filters.startDate) {
      whereConditions.push(gte(auditLogs.timestamp, new Date(filters.startDate)));
    }

    if (filters.endDate) {
      whereConditions.push(lte(auditLogs.timestamp, new Date(filters.endDate)));
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const logs = await db
      .select()
      .from(auditLogs)
      .where(whereClause)
      .orderBy(desc(auditLogs.timestamp))
      .limit(limit)
      .offset(offset);

    const [totalCount] = await db
      .select({ count: count() })
      .from(auditLogs)
      .where(whereClause);

    return {
      logs,
      total: totalCount.count,
      page,
      limit,
    };
  }

  async getSystemSettings(category?: string) {
    let query = db.select().from(systemSettings);

    if (category) {
      query = query.where(eq(systemSettings.category, category));
    }

    return await query.orderBy(systemSettings.category, systemSettings.key);
  }

  async updateSystemSetting(settingId: number, value: string, updatedBy: number, ipAddress?: string, userAgent?: string) {
    // Get old value for audit log
    const [oldSetting] = await db.select().from(systemSettings).where(eq(systemSettings.id, settingId));

    if (!oldSetting) {
      return null;
    }

    const [updatedSetting] = await db
      .update(systemSettings)
      .set({ 
        value, 
        updatedBy, 
        updatedAt: new Date() 
      })
      .where(eq(systemSettings.id, settingId))
      .returning();

    // Log audit event
    try {
      await db.insert(auditLogs).values({
        userId: updatedBy,
        action: 'update_system_setting',
        resourceType: 'system_setting',
        resourceId: settingId.toString(),
        oldValues: JSON.stringify({ key: oldSetting.key, value: oldSetting.value }),
        newValues: JSON.stringify({ key: oldSetting.key, value }),
        ipAddress,
        userAgent,
      });
    } catch (error) {
      console.error('Failed to log audit event:', error);
    }

    return updatedSetting;
  }

  async getActiveSessions() {
    return await db
      .select({
        id: userSessions.id,
        userId: userSessions.userId,
        ipAddress: userSessions.ipAddress,
        userAgent: userSessions.userAgent,
        createdAt: userSessions.createdAt,
        expiresAt: userSessions.expiresAt,
        username: users.username,
        email: users.email,
      })
      .from(userSessions)
      .innerJoin(users, eq(userSessions.userId, users.id))
      .where(eq(userSessions.isActive, true))
      .orderBy(desc(userSessions.createdAt));
  }

  async terminateSession(sessionId: number, terminatedBy: number, ipAddress?: string, userAgent?: string) {
    const [session] = await db.select().from(userSessions).where(eq(userSessions.id, sessionId));

    if (!session) {
      return false;
    }

    await db
      .update(userSessions)
      .set({ isActive: false })
      .where(eq(userSessions.id, sessionId));

    // Log audit event
    try {
      await db.insert(auditLogs).values({
        userId: terminatedBy,
        action: 'terminate_session',
        resourceType: 'user_session',
        resourceId: sessionId.toString(),
        newValues: JSON.stringify({ sessionUserId: session.userId }),
        ipAddress,
        userAgent,
      });
    } catch (error) {
      console.error('Failed to log audit event:', error);
    }

    return true;
  }
}

export const adminService = new AdminService();