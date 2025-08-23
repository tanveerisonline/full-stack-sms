import { Request, Response } from 'express';
import { userService } from '../services/userService';
import { insertUserSchema } from '../../shared/schemas';
import { AuthenticatedRequest } from '../middleware/auth';

export class UserController {
  static async getAllUsers(req: AuthenticatedRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      
      const result = await userService.getAllUsers(page, limit);
      res.json(result);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  }

  static async createUser(req: AuthenticatedRequest, res: Response) {
    try {
      const userData = insertUserSchema.parse(req.body);
      const newUser = await userService.createUser(userData, req.user!.id, req.ip, req.get('user-agent'));
      
      // Don't return password in response
      const { password, ...userWithoutPassword } = newUser;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ message: 'Failed to create user' });
    }
  }

  static async updateUser(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = parseInt(req.params.id);
      const updateData = req.body;
      
      const updatedUser = await userService.updateUser(userId, updateData, req.user!.id, req.ip, req.get('user-agent'));
      
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Don't return password in response
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Failed to update user' });
    }
  }

  static async deleteUser(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = parseInt(req.params.id);
      const deleted = await userService.deleteUser(userId, req.user!.id, req.ip, req.get('user-agent'));
      
      if (!deleted) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: 'Failed to delete user' });
    }
  }

  static async getUserProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.claims?.sub || req.user!.id;
      const user = await userService.getUserById(userId.toString());
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Don't return password in response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ message: 'Failed to fetch user profile' });
    }
  }
}