import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { users, userSessions, auditLogs } from '@shared/schema';
import { eq, and, gt } from 'drizzle-orm';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-production';

export async function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Check if session exists and is active
    const [session] = await db
      .select()
      .from(userSessions)
      .where(
        and(
          eq(userSessions.token, token),
          eq(userSessions.isActive, true),
          gt(userSessions.expiresAt, new Date())
        )
      );

    if (!session) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // Get user details
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.userId));

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'User not found or inactive' });
    }

    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName
    };

    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
}

export function requireRole(roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      // Log unauthorized access attempt
      logAuditEvent(req.user.id, 'unauthorized_access', 'access_control', 
        null, { attemptedEndpoint: req.path, userRole: req.user.role }, 
        req.ip, req.get('user-agent'));
      
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
}

export const requireSuperAdmin = requireRole(['super_admin', 'Super Administrator']);

export async function logAuditEvent(
  userId: number,
  action: string,
  resourceType: string,
  resourceId: string | null,
  changes: any,
  ipAddress?: string,
  userAgent?: string
) {
  try {
    await db.insert(auditLogs).values({
      userId,
      action,
      resourceType,
      resourceId,
      oldValues: changes.oldValues ? JSON.stringify(changes.oldValues) : null,
      newValues: changes.newValues ? JSON.stringify(changes.newValues) : null,
      ipAddress,
      userAgent
    });
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
}

// JWT token generation
export function generateAccessToken(user: any) {
  return jwt.sign(
    { 
      userId: user.id, 
      username: user.username,
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

// Session management
export async function createUserSession(userId: number, token: string, ipAddress?: string, userAgent?: string) {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24); // 24-hour session

  await db.insert(userSessions).values({
    userId,
    token,
    expiresAt,
    ipAddress,
    userAgent
  });
}

export async function invalidateUserSession(token: string) {
  await db
    .update(userSessions)
    .set({ isActive: false })
    .where(eq(userSessions.token, token));
}