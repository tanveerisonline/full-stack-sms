import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import type { Request, Response } from "express";
import { storage } from "./simple-storage";
import bcrypt from 'bcrypt';
import { insertUserSchema, insertStudentSchema } from '@shared/schema';
import { z } from "zod";

// Helper function for error handling
const handleRouteError = (res: Response, error: any) => {
  if (error instanceof z.ZodError) {
    res.status(400).json({ error: error.errors });
  } else {
    console.error('Route error:', error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Test route
  app.get("/api/test", (req: Request, res: Response) => {
    res.json({ message: "API is working!" });
  });

  // User registration route
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);

      // Create user (pending approval)
      const newUser = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
      });

      res.status(201).json({ 
        message: 'Account created successfully!',
        userId: newUser.id 
      });
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  // Basic login route (simplified)
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password required' });
      }

      // Find user by username
      const user = await storage.getUserByUsername(username);

      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check password
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName
        }
      });
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  // Students routes
  app.get("/api/students", async (req: Request, res: Response) => {
    try {
      const students = await storage.getStudents();
      res.json(students);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.get("/api/students/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const student = await storage.getStudent(id);
      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }
      res.json(student);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.post("/api/students", async (req: Request, res: Response) => {
    try {
      const validatedStudent = insertStudentSchema.parse(req.body);
      
      // Generate rollNumber
      const rollNumber = `STU${Math.floor(Math.random() * 900000) + 100000}`;
      
      const studentData = {
        ...validatedStudent,
        rollNumber,
      };
      
      const student = await storage.createStudent(studentData);
      res.status(201).json(student);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.put("/api/students/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedStudent = insertStudentSchema.partial().parse(req.body);
      const student = await storage.updateStudent(id, validatedStudent);
      res.json(student);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.delete("/api/students/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteStudent(id);
      res.status(204).send();
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
