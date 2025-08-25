import { Router } from 'express';
import type { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { db } from '../db';
import { users, students, teachers } from '@shared/schema';
import { eq } from 'drizzle-orm';
import {
  ObjectStorageService,
  ObjectNotFoundError,
} from "../objectStorage";

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

// Serve private objects (photos) with access control (authenticated)
router.get("/objects/:objectPath(*)", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id?.toString();
  const objectStorageService = new ObjectStorageService();
  
  try {
    const objectFile = await objectStorageService.getObjectEntityFile(req.path);
    const canAccess = await objectStorageService.canAccessObjectEntity({
      objectFile,
      userId: userId,
    });
    
    if (!canAccess) {
      return res.sendStatus(401);
    }
    
    objectStorageService.downloadObject(objectFile, res);
  } catch (error) {
    console.error("Error checking object access:", error);
    if (error instanceof ObjectNotFoundError) {
      return res.sendStatus(404);
    }
    return res.sendStatus(500);
  }
});

// Get upload URL for photo (no authentication required for getting presigned URL)
router.post("/upload", async (req: Request, res: Response) => {
  try {
    const objectStorageService = new ObjectStorageService();
    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    res.json({ uploadURL });
  } catch (error) {
    console.error("Error getting upload URL:", error);
    res.status(500).json({ error: "Failed to get upload URL" });
  }
});

// Update user avatar (authenticated)
router.put("/avatar", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.body.photoURL) {
    return res.status(400).json({ error: "photoURL is required" });
  }

  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  try {
    const objectStorageService = new ObjectStorageService();
    const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
      req.body.photoURL,
      {
        owner: userId?.toString() || "",
        visibility: "private", // Profile photos are private by default
      },
    );

    // Update user avatar in database
    await db
      .update(users)
      .set({ 
        avatar: objectPath,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));

    res.json({ avatar: objectPath });
  } catch (error) {
    console.error("Error updating user avatar:", error);
    res.status(500).json({ error: "Failed to update avatar" });
  }
});

// Update student avatar (authenticated)
router.put("/student/:studentId/avatar", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.body.photoURL) {
    return res.status(400).json({ error: "photoURL is required" });
  }

  const studentId = parseInt(req.params.studentId);
  const userId = req.user?.id;
  
  if (!userId) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  try {
    // Check if user has permission to update this student (admin or self)
    const userRole = req.user?.role;
    if (!['admin', 'super_admin'].includes(userRole)) {
      // Additional check can be added here for student's own photo update
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    const objectStorageService = new ObjectStorageService();
    const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
      req.body.photoURL,
      {
        owner: userId?.toString() || "",
        visibility: "private",
      },
    );

    // Update student avatar in database
    await db
      .update(students)
      .set({ 
        avatar: objectPath,
        updatedAt: new Date()
      })
      .where(eq(students.id, studentId));

    res.json({ avatar: objectPath });
  } catch (error) {
    console.error("Error updating student avatar:", error);
    res.status(500).json({ error: "Failed to update student avatar" });
  }
});

// Update teacher avatar (authenticated)
router.put("/teacher/:teacherId/avatar", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.body.photoURL) {
    return res.status(400).json({ error: "photoURL is required" });
  }

  const teacherId = parseInt(req.params.teacherId);
  const userId = req.user?.id;
  
  if (!userId) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  try {
    // Check if user has permission to update this teacher (admin or self)
    const userRole = req.user?.role;
    if (!['admin', 'super_admin', 'teacher'].includes(userRole)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    const objectStorageService = new ObjectStorageService();
    const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
      req.body.photoURL,
      {
        owner: userId?.toString() || "",
        visibility: "private",
      },
    );

    // Update teacher avatar in database
    await db
      .update(teachers)
      .set({ 
        avatar: objectPath,
        updatedAt: new Date()
      })
      .where(eq(teachers.id, teacherId));

    res.json({ avatar: objectPath });
  } catch (error) {
    console.error("Error updating teacher avatar:", error);
    res.status(500).json({ error: "Failed to update teacher avatar" });
  }
});

export default router;