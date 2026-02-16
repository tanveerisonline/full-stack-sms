import { Router, Request, Response } from 'express';
import { authenticateToken, requireSuperAdmin, logAuditEvent, AuthenticatedRequest } from '../middleware/auth';
import { db } from '../db';
import { roles, insertRoleSchema, type Role, users } from '@shared/schemas';
import { eq, desc, count, ilike, or, and } from 'drizzle-orm';
import { PERMISSIONS, DEFAULT_ROLES, getAllPermissions, PERMISSION_CATEGORIES } from '@shared/permissions';

const router = Router();

// Apply authentication and super admin requirement
router.use(authenticateToken);
router.use(requireSuperAdmin);

// Get all roles with pagination and search
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let baseQuery = db.select().from(roles);
    
    if (search) {
      baseQuery = baseQuery.where(
        or(
          ilike(roles.name, `%${search}%`),
          ilike(roles.description, `%${search}%`)
        )
      ) as typeof baseQuery;
    }

    const [rolesData, totalCount] = await Promise.all([
      baseQuery
        .orderBy(desc(roles.createdAt))
        .limit(Number(limit))
        .offset(offset),
      db.select({ count: count() }).from(roles).then(result => result[0].count)
    ]);

    await logAuditEvent(
      req.user!.id,
      'view_roles',
      'role_management',
      null,
      { search, page, limit },
      req.ip,
      req.get('user-agent')
    );

    res.json({
      roles: rolesData,
      total: totalCount,
      page: Number(page),
      limit: Number(limit)
    });
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ message: 'Failed to fetch roles' });
  }
});

// Get single role by ID
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const roleId = parseInt(req.params.id);
    
    const [role] = await db
      .select()
      .from(roles)
      .where(eq(roles.id, roleId));

    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    res.json(role);
  } catch (error) {
    console.error('Error fetching role:', error);
    res.status(500).json({ message: 'Failed to fetch role' });
  }
});

// Create new role
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validatedData = insertRoleSchema.parse(req.body);

    // Check if role name already exists
    const [existingRole] = await db
      .select()
      .from(roles)
      .where(eq(roles.name, validatedData.name));

    if (existingRole) {
      return res.status(409).json({ message: 'Role name already exists' });
    }

    // Validate permissions
    const allPermissions = getAllPermissions();
    const invalidPermissions = Array.isArray(validatedData.permissions) 
      ? validatedData.permissions.filter(
          permission => !allPermissions.includes(permission as any)
        )
      : [];

    if (invalidPermissions.length > 0) {
      return res.status(400).json({ 
        message: 'Invalid permissions provided',
        invalidPermissions
      });
    }

    const result = await db
      .insert(roles)
      .values(validatedData);

    const [newRole] = await db
      .select()
      .from(roles)
      .where(eq(roles.name, validatedData.name))
      .limit(1);

    await logAuditEvent(
      req.user!.id,
      'create_role',
      'role',
      newRole.id.toString(),
      { newValues: validatedData },
      req.ip,
      req.get('user-agent')
    );

    res.status(201).json(newRole);
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(500).json({ message: 'Failed to create role' });
  }
});

// Update role
router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const roleId = parseInt(req.params.id);
    const updateData = insertRoleSchema.partial().parse(req.body);

    // Get old values for audit log
    const [oldRole] = await db
      .select()
      .from(roles)
      .where(eq(roles.id, roleId));

    if (!oldRole) {
      return res.status(404).json({ message: 'Role not found' });
    }

    // Check if new name conflicts with existing role (if name is being updated)
    if (updateData.name && updateData.name !== oldRole.name) {
      const [existingRole] = await db
        .select()
        .from(roles)
        .where(eq(roles.name, updateData.name));

      if (existingRole) {
        return res.status(409).json({ message: 'Role name already exists' });
      }
    }

    // Validate permissions if provided
    if (updateData.permissions) {
      const allPermissions = getAllPermissions();
      const invalidPermissions = Array.isArray(updateData.permissions)
        ? updateData.permissions.filter(
            permission => !allPermissions.includes(permission as any)
          )
        : [];

      if (invalidPermissions.length > 0) {
        return res.status(400).json({ 
          message: 'Invalid permissions provided',
          invalidPermissions
        });
      }
    }

    await db
      .update(roles)
      .set(updateData)
      .where(eq(roles.id, roleId));

    const [updatedRole] = await db
      .select()
      .from(roles)
      .where(eq(roles.id, roleId))
      .limit(1);

    await logAuditEvent(
      req.user!.id,
      'update_role',
      'role',
      roleId.toString(),
      { 
        oldValues: oldRole,
        newValues: updateData
      },
      req.ip,
      req.get('user-agent')
    );

    res.json(updatedRole);
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ message: 'Failed to update role' });
  }
});

// Delete role (permanently)
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const roleId = parseInt(req.params.id);

    // Get role details for audit log
    const [role] = await db
      .select()
      .from(roles)
      .where(eq(roles.id, roleId));

    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    // Actually delete the role
    await db
      .delete(roles)
      .where(eq(roles.id, roleId));

    await logAuditEvent(
      req.user!.id,
      'delete_role',
      'role',
      roleId.toString(),
      { deletedRole: role },
      req.ip,
      req.get('user-agent')
    );

    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).json({ message: 'Failed to delete role' });
  }
});

// Toggle role active status
router.patch('/:id/toggle-status', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const roleId = parseInt(req.params.id);

    // Get current role
    const [role] = await db
      .select()
      .from(roles)
      .where(eq(roles.id, roleId));

    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    // Toggle active status
    await db
      .update(roles)
      .set({ isActive: !role.isActive })
      .where(eq(roles.id, roleId));

    const [updatedRole] = await db
      .select()
      .from(roles)
      .where(eq(roles.id, roleId))
      .limit(1);

    await logAuditEvent(
      req.user!.id,
      'toggle_role_status',
      'role',
      roleId.toString(),
      { 
        oldStatus: role.isActive,
        newStatus: updatedRole.isActive
      },
      req.ip,
      req.get('user-agent')
    );

    res.json({ 
      message: `Role ${updatedRole.isActive ? 'activated' : 'deactivated'} successfully`, 
      role: updatedRole 
    });
  } catch (error) {
    console.error('Error toggling role status:', error);
    res.status(500).json({ message: 'Failed to toggle role status' });
  }
});

// Get all available permissions grouped by category
router.get('/permissions/list', async (req: AuthenticatedRequest, res: Response) => {
  try {
    res.json({
      permissions: getAllPermissions(),
      categories: PERMISSION_CATEGORIES,
      total: getAllPermissions().length
    });
  } catch (error) {
    console.error('Error fetching permissions:', error);
    res.status(500).json({ message: 'Failed to fetch permissions' });
  }
});

// Initialize default roles
router.post('/initialize', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const createdRoles = [];

    for (const [key, roleData] of Object.entries(DEFAULT_ROLES)) {
      // Check if role already exists
      const [existingRole] = await db
        .select()
        .from(roles)
        .where(eq(roles.name, roleData.name));

      if (!existingRole) {
        await db
          .insert(roles)
          .values({
            name: roleData.name,
            description: roleData.description,
            permissions: roleData.permissions,
          });

        const [newRole] = await db
          .select()
          .from(roles)
          .where(eq(roles.name, roleData.name))
          .limit(1);
        
        createdRoles.push(newRole);
      }
    }

    await logAuditEvent(
      req.user!.id,
      'initialize_roles',
      'role_management',
      null,
      { createdRoles: createdRoles.length },
      req.ip,
      req.get('user-agent')
    );

    res.json({
      message: `Initialized ${createdRoles.length} default roles`,
      createdRoles
    });
  } catch (error) {
    console.error('Error initializing roles:', error);
    res.status(500).json({ message: 'Failed to initialize roles' });
  }
});

// Get approved and active users for role assignment
router.get('/users/eligible', authenticateToken, requireSuperAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { search = '' } = req.query;

    let whereCondition = and(
      eq(users.isApproved, true),
      eq(users.isActive, true)
    );

    if (search) {
      whereCondition = and(
        eq(users.isApproved, true),
        eq(users.isActive, true),
        or(
          ilike(users.username, `%${search}%`),
          ilike(users.email, `%${search}%`),
          ilike(users.firstName, `%${search}%`),
          ilike(users.lastName, `%${search}%`)
        )
      );
    }

    const userQuery = db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        isActive: users.isActive,
        isApproved: users.isApproved,
      })
      .from(users)
      .where(whereCondition);

    const eligibleUsers = await userQuery.orderBy(desc(users.createdAt));

    await logAuditEvent(
      req.user!.id,
      'view_eligible_users',
      'user_management',
      null,
      { search, userCount: eligibleUsers.length },
      req.ip,
      req.get('user-agent')
    );

    res.json({ users: eligibleUsers });
  } catch (error) {
    console.error('Error fetching eligible users:', error);
    res.status(500).json({ message: 'Failed to fetch eligible users' });
  }
});

// Assign role to user
router.post('/assign', authenticateToken, requireSuperAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId, roleId } = req.body;

    if (!userId || !roleId) {
      return res.status(400).json({ message: 'User ID and Role ID are required' });
    }

    // Verify user exists and is eligible (approved and active)
    const [user] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.id, userId),
          eq(users.isApproved, true),
          eq(users.isActive, true)
        )
      );

    if (!user) {
      return res.status(404).json({ message: 'User not found or not eligible for role assignment' });
    }

    // Verify role exists
    const [role] = await db
      .select()
      .from(roles)
      .where(eq(roles.id, roleId));

    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    // Get old role for audit
    const oldRole = user.role;

    // Update user's role
    await db
      .update(users)
      .set({ role: role.name })
      .where(eq(users.id, userId));

    const [updatedUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    await logAuditEvent(
      req.user!.id,
      'assign_role',
      'user',
      userId.toString(),
      { 
        oldValues: { role: oldRole },
        newValues: { role: role.name },
        roleName: role.name,
        username: user.username
      },
      req.ip,
      req.get('user-agent')
    );

    res.json({
      message: 'Role assigned successfully',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
      }
    });
  } catch (error) {
    console.error('Error assigning role:', error);
    res.status(500).json({ message: 'Failed to assign role' });
  }
});

// Remove role from user (set to default)
router.post('/remove', authenticateToken, requireSuperAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Verify user exists
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get old role for audit
    const oldRole = user.role;

    // Remove role (set to default role)
    await db
      .update(users)
      .set({ role: 'user' }) // Default role
      .where(eq(users.id, userId));

    const [updatedUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    await logAuditEvent(
      req.user!.id,
      'remove_role',
      'user',
      userId.toString(),
      { 
        oldValues: { role: oldRole },
        newValues: { role: 'user' },
        username: user.username
      },
      req.ip,
      req.get('user-agent')
    );

    res.json({
      message: 'Role removed successfully',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
      }
    });
  } catch (error) {
    console.error('Error removing role:', error);
    res.status(500).json({ message: 'Failed to remove role' });
  }
});

export default router;