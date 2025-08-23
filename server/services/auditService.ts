import { db } from '../db';
import { auditLogs, InsertAuditLog } from '@shared/schemas';

export class AuditService {
  async logEvent(
    userId: number,
    action: string,
    resourceType: string,
    resourceId: string | null = null,
    data: any = null,
    ipAddress?: string,
    userAgent?: string
  ) {
    try {
      const auditData: InsertAuditLog = {
        userId,
        action,
        resourceType,
        resourceId,
        oldValues: data?.oldValues ? JSON.stringify(data.oldValues) : null,
        newValues: data?.newValues ? JSON.stringify(data.newValues) : null,
        ipAddress,
        userAgent,
      };

      await db.insert(auditLogs).values(auditData);
    } catch (error) {
      console.error('Failed to log audit event:', error);
      // Don't throw error to avoid breaking the main operation
    }
  }

  async getRecentActivity(limit: number = 10) {
    return await db
      .select()
      .from(auditLogs)
      .orderBy(auditLogs.timestamp)
      .limit(limit);
  }
}

export const auditService = new AuditService();