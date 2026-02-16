import { Router } from 'express';
import type { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { db } from '../db';
import { users, students, teachers } from '@shared/schema';
import { eq } from 'drizzle-orm';
// Note: ObjectStorageService imports removed for fallback system
// Uncomment when GCS is properly configured:
// import {
//   ObjectStorageService,
//   ObjectNotFoundError,
// } from "../objectStorage";

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
  // Temporarily disabled - requires ObjectStorageService configuration
  res.status(503).json({
    error: 'Object storage service temporarily unavailable',
    message: 'Configure PRIVATE_OBJECT_DIR and PUBLIC_OBJECT_SEARCH_PATHS to enable this feature'
  });
});

// Get upload URL for photo (no authentication required for getting presigned URL)
router.post("/upload", async (req: Request, res: Response) => {
  // Always use fallback system for now since GCS is not configured
  console.log('Photo upload request - using local fallback system');
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substr(2, 9);
  const uploadURL = `/api/photos/local-upload/${randomId}-${timestamp}`;
  
  // Check if we have GCS configuration
  const hasGCSConfig = process.env.PRIVATE_OBJECT_DIR && process.env.PUBLIC_OBJECT_SEARCH_PATHS;
  
  res.json({ 
    success: true,
    uploadURL, 
    provider: hasGCSConfig ? 'gcs-fallback' : 'local-fallback',
    message: hasGCSConfig 
      ? 'GCS configured but using local fallback for development' 
      : 'Using local fallback - configure PRIVATE_OBJECT_DIR and PUBLIC_OBJECT_SEARCH_PATHS for cloud storage',
    timestamp: new Date().toISOString()
  });
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
    // For fallback system, just store the URL directly
    const avatar = req.body.photoURL;

    // Update user avatar in database
    await db
      .update(users)
      .set({ 
        avatar: avatar,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));

    res.json({ 
      avatar: avatar,
      message: 'Avatar updated successfully (using fallback system)'
    });
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
    if (!userRole || !['admin', 'super_admin'].includes(userRole)) {
      // Additional check can be added here for student's own photo update
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    // For fallback system, just store the URL directly
    const avatar = req.body.photoURL;

    // Update student avatar in database
    await db
      .update(students)
      .set({ 
        avatar: avatar,
        updatedAt: new Date()
      })
      .where(eq(students.id, studentId));

    res.json({ 
      avatar: avatar,
      message: 'Student avatar updated successfully (using fallback system)'
    });
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
    if (!userRole || !['admin', 'super_admin', 'teacher'].includes(userRole)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    // For fallback system, just store the URL directly
    const avatar = req.body.photoURL;

    // Update teacher avatar in database
    await db
      .update(teachers)
      .set({ 
        avatar: avatar,
        updatedAt: new Date()
      })
      .where(eq(teachers.id, teacherId));

    res.json({ 
      avatar: avatar,
      message: 'Teacher avatar updated successfully (using fallback system)'
    });
  } catch (error) {
    console.error("Error updating teacher avatar:", error);
    res.status(500).json({ error: "Failed to update teacher avatar" });
  }
});

export default router;