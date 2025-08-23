import { Request, Response } from 'express';
import { adminService } from '../services/adminService';
import { AuthenticatedRequest } from '../middleware/auth';

export class AdminController {
  static async getDashboardStats(req: AuthenticatedRequest, res: Response) {
    try {
      const stats = await adminService.getDashboardStatistics();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({ message: 'Failed to fetch dashboard statistics' });
    }
  }

  static async getAuditLogs(req: AuthenticatedRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const action = req.query.action as string;
      const resourceType = req.query.resourceType as string;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;

      const result = await adminService.getAuditLogs({
        page,
        limit,
        filters: { action, resourceType, startDate, endDate }
      });

      res.json(result);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      res.status(500).json({ message: 'Failed to fetch audit logs' });
    }
  }

  static async getSystemSettings(req: AuthenticatedRequest, res: Response) {
    try {
      const category = req.query.category as string;
      const settings = await adminService.getSystemSettings(category);
      res.json(settings);
    } catch (error) {
      console.error('Error fetching system settings:', error);
      res.status(500).json({ message: 'Failed to fetch system settings' });
    }
  }

  static async updateSystemSetting(req: AuthenticatedRequest, res: Response) {
    try {
      const settingId = parseInt(req.params.id);
      const { value } = req.body;
      
      const updatedSetting = await adminService.updateSystemSetting(
        settingId, 
        value, 
        req.user!.id,
        req.ip,
        req.get('user-agent')
      );

      if (!updatedSetting) {
        return res.status(404).json({ message: 'System setting not found' });
      }

      res.json(updatedSetting);
    } catch (error) {
      console.error('Error updating system setting:', error);
      res.status(500).json({ message: 'Failed to update system setting' });
    }
  }

  static async getActiveSessions(req: AuthenticatedRequest, res: Response) {
    try {
      const sessions = await adminService.getActiveSessions();
      res.json(sessions);
    } catch (error) {
      console.error('Error fetching active sessions:', error);
      res.status(500).json({ message: 'Failed to fetch active sessions' });
    }
  }

  static async terminateSession(req: AuthenticatedRequest, res: Response) {
    try {
      const sessionId = parseInt(req.params.id);
      const terminated = await adminService.terminateSession(
        sessionId, 
        req.user!.id,
        req.ip,
        req.get('user-agent')
      );

      if (!terminated) {
        return res.status(404).json({ message: 'Session not found' });
      }

      res.status(204).send();
    } catch (error) {
      console.error('Error terminating session:', error);
      res.status(500).json({ message: 'Failed to terminate session' });
    }
  }
}