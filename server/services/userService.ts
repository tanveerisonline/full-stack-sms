import bcrypt from 'bcrypt';
import { count, desc, eq } from 'drizzle-orm';
import { db } from '../db';
import { users, InsertUser, auditLogs } from '../../shared/schemas';

export class UserService {
  async getAllUsers(page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    const allUsers = await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

    const [totalCount] = await db.select({ count: count() }).from(users);

    return {
      users: allUsers.map(user => ({ ...user, password: undefined })),
      total: totalCount.count,
      page,
      limit,
    };
  }

  async getUserById(id: string) {
    const [user] = await db.select().from(users).where(eq(users.id, parseInt(id)));
    return user;
  }

  async getUserByUsername(username: string) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(userData: InsertUser, createdBy: number, ipAddress?: string, userAgent?: string) {
    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const result = await db
      .insert(users)
      .values({
        ...userData,
        password: hashedPassword,
      });

    const insertId = (result as any).insertId;
    const [newUser] = await db.select().from(users).where(eq(users.id, insertId));

    // Log audit event
    try {
      await db.insert(auditLogs).values({
        userId: createdBy,
        action: 'create_user',
        resourceType: 'user',
        resourceId: newUser.id.toString(),
        newValues: JSON.stringify({ ...userData, password: '[HIDDEN]' }),
        ipAddress,
        userAgent,
      });
    } catch (error) {
      console.error('Failed to log audit event:', error);
    }

    return newUser;
  }

  async updateUser(userId: number, updateData: Partial<InsertUser>, updatedBy: number, ipAddress?: string, userAgent?: string) {
    // Get old values for audit log
    const [oldUser] = await db.select().from(users).where(eq(users.id, userId));

    if (!oldUser) {
      return null;
    }

    // Hash password if provided
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    await db
      .update(users)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(users.id, userId));

    const [updatedUser] = await db.select().from(users).where(eq(users.id, userId));

    // Log audit event
    try {
      await db.insert(auditLogs).values({
        userId: updatedBy,
        action: 'update_user',
        resourceType: 'user',
        resourceId: userId.toString(),
        oldValues: JSON.stringify({ ...oldUser, password: '[HIDDEN]' }),
        newValues: JSON.stringify({ ...updateData, password: updateData.password ? '[HIDDEN]' : undefined }),
        ipAddress,
        userAgent,
      });
    } catch (error) {
      console.error('Failed to log audit event:', error);
    }

    return updatedUser;
  }

  async deleteUser(userId: number, deletedBy: number, ipAddress?: string, userAgent?: string) {
    // Get user data for audit log
    const [userToDelete] = await db.select().from(users).where(eq(users.id, userId));

    if (!userToDelete) {
      return false;
    }

    await db.delete(users).where(eq(users.id, userId));

    // Log audit event
    try {
      await db.insert(auditLogs).values({
        userId: deletedBy,
        action: 'delete_user',
        resourceType: 'user',
        resourceId: userId.toString(),
        oldValues: JSON.stringify({ ...userToDelete, password: '[HIDDEN]' }),
        ipAddress,
        userAgent,
      });
    } catch (error) {
      console.error('Failed to log audit event:', error);
    }

    return true;
  }

  async verifyPassword(username: string, password: string) {
    const user = await this.getUserByUsername(username);
    if (!user) {
      return null;
    }

    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }
}

export const userService = new UserService();