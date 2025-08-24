import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import type { Request, Response } from "express";
import { storage } from "./storage";
import { seedDatabase } from "./seed";
import superAdminRoutes from "./superAdminRoutes";
import bcrypt from 'bcrypt';
import { generateAccessToken, createUserSession, authenticateToken } from './middleware/auth';
import { db } from './db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { 
  insertUserSchema, insertStudentSchema, insertTeacherSchema, insertClassSchema,
  insertAssignmentSchema, insertGradeSchema, insertAttendanceSchema, 
  insertBookSchema, insertBookIssueSchema, insertTransactionSchema,
  insertAnnouncementSchema, insertTimetableSchema
} from "@shared/schema";
import { z } from "zod";

// Helper function to determine redirect path based on role
const getRedirectPath = (role: string): string => {
  switch (role) {
    case 'super_admin':
      return '/super-admin';
    case 'admin':
      return '/admin-dashboard';
    case 'teacher':
      return '/teacher-dashboard';
    case 'student':
      return '/student-dashboard';
    case 'parent':
      return '/parent-dashboard';
    default:
      return '/dashboard';
  }
};

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
  // User registration route
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if username or email already exists
      const [existingUsername] = await db
        .select()
        .from(users)
        .where(eq(users.username, validatedData.username))
        .limit(1);
      
      const [existingEmail] = await db
        .select()
        .from(users)
        .where(eq(users.email, validatedData.email))
        .limit(1);

      if (existingUsername) {
        return res.status(409).json({ message: 'Username already exists' });
      }
      
      if (existingEmail) {
        return res.status(409).json({ message: 'Email already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);

      // Create user (pending approval)
      const [newUser] = await db
        .insert(users)
        .values({
          ...validatedData,
          password: hashedPassword,
          isApproved: false, // Pending approval
        })
        .returning();

      res.status(201).json({ 
        message: 'Account created successfully! Please wait for admin approval.',
        userId: newUser.id 
      });
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  // Authentication routes
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password required' });
      }

      // Find user by username or email
      const [user] = await db
        .select()
        .from(users)
        .where(
          username.includes('@') 
            ? eq(users.email, username)
            : eq(users.username, username)
        )
        .limit(1);

      if (!user || !user.isActive) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check if user is approved (except for super_admin who can always login)
      if (user.role !== 'super_admin' && !user.isApproved) {
        return res.status(403).json({ 
          message: 'Your account is pending approval. Please contact an administrator.' 
        });
      }

      // Check password
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = generateAccessToken(user);
      
      // Create session
      await createUserSession(user.id, token, req.ip, req.get('user-agent'));

      // Update last login
      await db
        .update(users)
        .set({ lastLogin: new Date() })
        .where(eq(users.id, user.id));

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar
        },
        redirectTo: getRedirectPath(user.role)
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Login failed' });
    }
  });

  // Super Admin routes (protected)
  app.use('/api/super-admin', superAdminRoutes);

  // Development seed endpoint (only in development)
  if (process.env.NODE_ENV === 'development') {
    app.post("/api/dev/seed", async (req: Request, res: Response) => {
      try {
        await seedDatabase();
        res.json({ message: "Database seeded successfully" });
      } catch (error) {
        handleRouteError(res, error);
      }
    });

    // Create default super admin user in development
    app.post("/api/dev/create-super-admin", async (req: Request, res: Response) => {
      try {
        const hashedPassword = await bcrypt.hash('superadmin123', 10);
        
        const [existingAdmin] = await db
          .select()
          .from(users)
          .where(eq(users.username, 'superadmin'))
          .limit(1);

        if (existingAdmin) {
          return res.json({ message: 'Super admin already exists' });
        }

        const [superAdmin] = await db
          .insert(users)
          .values({
            username: 'superadmin',
            password: hashedPassword,
            role: 'super_admin',
            firstName: 'Super',
            lastName: 'Admin',
            email: 'superadmin@edumanage.pro',
            phone: '+1234567890'
          })
          .returning();

        res.json({ 
          message: 'Super admin created successfully',
          credentials: {
            username: 'superadmin',
            password: 'superadmin123'
          }
        });
      } catch (error) {
        handleRouteError(res, error);
      }
    });
  }

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
      // Set default admissionDate if not provided
      const studentData = {
        ...validatedStudent,
        admissionDate: validatedStudent.admissionDate || new Date().toISOString().split('T')[0]
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

  // Teachers routes
  app.get("/api/teachers", async (req: Request, res: Response) => {
    try {
      const teachers = await storage.getTeachers();
      res.json(teachers);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.get("/api/teachers/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const teacher = await storage.getTeacher(id);
      if (!teacher) {
        return res.status(404).json({ error: "Teacher not found" });
      }
      res.json(teacher);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.post("/api/teachers", async (req: Request, res: Response) => {
    try {
      const validatedTeacher = insertTeacherSchema.parse(req.body);
      const teacher = await storage.createTeacher(validatedTeacher);
      res.status(201).json(teacher);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.put("/api/teachers/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedTeacher = insertTeacherSchema.partial().parse(req.body);
      const teacher = await storage.updateTeacher(id, validatedTeacher);
      res.json(teacher);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.delete("/api/teachers/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTeacher(id);
      res.status(204).send();
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  // Classes routes
  app.get("/api/classes", async (req: Request, res: Response) => {
    try {
      const classes = await storage.getClasses();
      res.json(classes);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.get("/api/classes/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const classItem = await storage.getClass(id);
      if (!classItem) {
        return res.status(404).json({ error: "Class not found" });
      }
      res.json(classItem);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.post("/api/classes", async (req: Request, res: Response) => {
    try {
      const validatedClass = insertClassSchema.parse(req.body);
      const classItem = await storage.createClass(validatedClass);
      res.status(201).json(classItem);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.put("/api/classes/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedClass = insertClassSchema.partial().parse(req.body);
      const classItem = await storage.updateClass(id, validatedClass);
      res.json(classItem);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.delete("/api/classes/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteClass(id);
      res.status(204).send();
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  // Timetable routes
  app.get("/api/timetable", async (req: Request, res: Response) => {
    try {
      const timetable = await storage.getTimetable();
      res.json(timetable);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.get("/api/timetable/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const entry = await storage.getTimetableEntry(id);
      if (!entry) {
        return res.status(404).json({ error: "Timetable entry not found" });
      }
      res.json(entry);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.post("/api/timetable", async (req: Request, res: Response) => {
    try {
      const validatedData = insertTimetableSchema.parse(req.body);
      const entry = await storage.createTimetableEntry(validatedData);
      res.status(201).json(entry);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.put("/api/timetable/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertTimetableSchema.partial().parse(req.body);
      const entry = await storage.updateTimetableEntry(id, validatedData);
      res.json(entry);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.delete("/api/timetable/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTimetableEntry(id);
      res.status(204).send();
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  // Books routes
  app.get("/api/books", async (req: Request, res: Response) => {
    try {
      const books = await storage.getBooks();
      res.json(books);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.post("/api/books", async (req: Request, res: Response) => {
    try {
      const validatedBook = insertBookSchema.parse(req.body);
      const book = await storage.createBook(validatedBook);
      res.status(201).json(book);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.put("/api/books/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedBook = insertBookSchema.partial().parse(req.body);
      const book = await storage.updateBook(id, validatedBook);
      res.json(book);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.delete("/api/books/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteBook(id);
      res.status(204).send();
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  // Book Issues routes
  app.get("/api/book-issues", async (req: Request, res: Response) => {
    try {
      const bookIssues = await storage.getBookIssues();
      res.json(bookIssues);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.post("/api/book-issues", async (req: Request, res: Response) => {
    try {
      const validatedBookIssue = insertBookIssueSchema.parse(req.body);
      const bookIssue = await storage.createBookIssue(validatedBookIssue);
      res.status(201).json(bookIssue);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.put("/api/book-issues/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedBookIssue = insertBookIssueSchema.partial().parse(req.body);
      const bookIssue = await storage.updateBookIssue(id, validatedBookIssue);
      res.json(bookIssue);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.delete("/api/book-issues/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteBookIssue(id);
      res.status(204).send();
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  // Transactions routes
  app.get("/api/transactions", async (req: Request, res: Response) => {
    try {
      const transactions = await storage.getTransactions();
      res.json(transactions);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.post("/api/transactions", async (req: Request, res: Response) => {
    try {
      const validatedTransaction = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(validatedTransaction);
      res.status(201).json(transaction);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.put("/api/transactions/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedTransaction = insertTransactionSchema.partial().parse(req.body);
      const transaction = await storage.updateTransaction(id, validatedTransaction);
      res.json(transaction);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.delete("/api/transactions/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTransaction(id);
      res.status(204).send();
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  // Assignments routes
  app.get("/api/assignments", async (req: Request, res: Response) => {
    try {
      const assignments = await storage.getAssignments();
      res.json(assignments);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.post("/api/assignments", async (req: Request, res: Response) => {
    try {
      const validatedAssignment = insertAssignmentSchema.parse(req.body);
      const assignment = await storage.createAssignment(validatedAssignment);
      res.status(201).json(assignment);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.put("/api/assignments/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedAssignment = insertAssignmentSchema.partial().parse(req.body);
      const assignment = await storage.updateAssignment(id, validatedAssignment);
      res.json(assignment);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.delete("/api/assignments/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteAssignment(id);
      res.status(204).send();
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  // Grades routes
  app.get("/api/grades", async (req: Request, res: Response) => {
    try {
      const grades = await storage.getGrades();
      res.json(grades);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.post("/api/grades", async (req: Request, res: Response) => {
    try {
      const validatedGrade = insertGradeSchema.parse(req.body);
      const grade = await storage.createGrade(validatedGrade);
      res.status(201).json(grade);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  // Attendance routes
  app.get("/api/attendance", async (req: Request, res: Response) => {
    try {
      const attendance = await storage.getAttendance();
      res.json(attendance);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.post("/api/attendance", async (req: Request, res: Response) => {
    try {
      const validatedAttendance = insertAttendanceSchema.parse(req.body);
      const attendance = await storage.createAttendance(validatedAttendance);
      res.status(201).json(attendance);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  // Announcements routes
  app.get("/api/announcements", async (req: Request, res: Response) => {
    try {
      const announcements = await storage.getAnnouncements();
      res.json(announcements);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.post("/api/announcements", async (req: Request, res: Response) => {
    try {
      const validatedAnnouncement = insertAnnouncementSchema.parse(req.body);
      const announcement = await storage.createAnnouncement(validatedAnnouncement);
      res.status(201).json(announcement);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.put("/api/announcements/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedAnnouncement = insertAnnouncementSchema.partial().parse(req.body);
      const announcement = await storage.updateAnnouncement(id, validatedAnnouncement);
      res.json(announcement);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.delete("/api/announcements/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteAnnouncement(id);
      res.status(204).send();
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  // Timetable routes
  app.get("/api/timetable", async (req: Request, res: Response) => {
    try {
      const timetable = await storage.getTimetable();
      res.json(timetable);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.post("/api/timetable", async (req: Request, res: Response) => {
    try {
      const validatedTimetableEntry = insertTimetableSchema.parse(req.body);
      const timetableEntry = await storage.createTimetableEntry(validatedTimetableEntry);
      res.status(201).json(timetableEntry);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
