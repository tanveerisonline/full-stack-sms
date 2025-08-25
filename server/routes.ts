import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import type { Request, Response } from "express";
import { storage } from "./storage";
import { seedDatabase } from "./seed";
import superAdminRoutes from "./superAdminRoutes";
import adminRoutes from "./routes/adminRoutes";
import photoRoutes from "./routes/photoRoutes";
import bcrypt from 'bcrypt';
import { generateAccessToken, createUserSession, authenticateToken } from './middleware/auth';
import { db } from './db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { 
  insertUserSchema, insertStudentSchema, insertTeacherSchema, insertClassSchema,
  insertAssignmentSchema, insertGradeSchema, insertAttendanceSchema, 
  insertBookSchema, insertBookIssueSchema, insertTransactionSchema,
  insertAnnouncementSchema, insertTimetableSchema, insertPayrollSchema,
  insertExamSchema, insertQuestionSchema, insertQuestionOptionSchema,
  insertExamSubmissionSchema, insertSubmissionAnswerSchema, insertExamResultSchema
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
      if (user.role !== 'super_admin' && user.role !== 'Super Administrator' && !user.isApproved) {
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
  
  // Admin routes (admin role and above)
  const adminRoutes = (await import('./routes/adminRoutes')).default;
  app.use('/api/admin', adminRoutes);
  
  // Mount photo routes
  app.use('/api/photos', photoRoutes);
  
  // Role management routes (super admin only)
  const roleRoutes = (await import('./routes/roleRoutes')).default;
  app.use('/api/super-admin/roles', roleRoutes);

  // System settings routes (super admin only)
  const systemSettingsRoutes = (await import('./routes/systemSettingsRoutes')).default;
  app.use('/api/super-admin/settings', systemSettingsRoutes);

  // Audit logs routes (super admin only)
  const auditRoutes = (await import('./routes/auditRoutes')).default;
  app.use('/api/super-admin/audit', auditRoutes);

  // Backup & restore routes (super admin only)
  const backupRoutes = (await import('./routes/backupRoutes')).default;
  app.use('/api/super-admin/backup', backupRoutes);

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
      
      // Generate rollNumber and set admissionDate
      const rollNumber = `STU${Math.floor(Math.random() * 900000) + 100000}`;
      const admissionDate = new Date().toISOString().split('T')[0];
      
      const studentData = {
        ...validatedStudent,
        rollNumber,
        admissionDate,
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

  // Teacher stats endpoint (must come before /:id route)
  app.get("/api/teachers/stats", async (req: Request, res: Response) => {
    try {
      const teachers = await storage.getTeachers();
      const stats = {
        total: teachers.length,
        active: teachers.filter(teacher => teacher.status === 'active').length,
        newThisMonth: teachers.filter(teacher => {
          if (!(teacher as any).hireDate) return false;
          try {
            const hireDate = new Date((teacher as any).hireDate);
            const now = new Date();
            return hireDate.getMonth() === now.getMonth() && 
                   hireDate.getFullYear() === now.getFullYear();
          } catch {
            return false;
          }
        }).length,
        departments: [...new Set(teachers.map(t => (t as any).department).filter(Boolean))].length,
      };
      res.json(stats);
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


  // Photo upload endpoints for object storage (no auth required for getting upload URL)
  app.post("/api/photos/upload", async (req: Request, res: Response) => {
    try {
      const { ObjectStorageService } = await import('./objectStorage');
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error('Photo upload error:', error);
      // Fallback to mock URL if object storage fails
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substr(2, 9);
      const uploadURL = `https://storage.googleapis.com/replit-objstore-49a4ed3c-8a65-4b08-8681-59afa70812d2/public/uploads/photo-${timestamp}-${randomId}.jpg`;
      res.json({ uploadURL });
    }
  });

  // Serve uploaded photos (convert private storage URLs to accessible endpoints)
  app.get("/objects/*", async (req: Request, res: Response) => {
    try {
      const objectPath = req.path; // This will be something like '/objects/uploads/uuid'
      console.log('Serving object:', objectPath);
      
      // Extract the filename from the path
      const pathParts = objectPath.split('/');
      const filename = pathParts[pathParts.length - 1];
      
      // For now, try to fetch the image directly and proxy it
      const storageUrl = `https://storage.googleapis.com/replit-objstore-49a4ed3c-8a65-4b08-8681-59afa70812d2/.private${objectPath.replace('/objects', '')}`;
      
      // Fetch the image from storage and pipe it back
      const fetch = (await import('node-fetch')).default;
      const response = await fetch(storageUrl);
      
      if (!response.ok) {
        return res.status(404).json({ error: 'Photo not found' });
      }
      
      // Set appropriate headers
      res.set({
        'Content-Type': response.headers.get('content-type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=3600'
      });
      
      // Pipe the image data to the response
      response.body?.pipe(res);
      
    } catch (error) {
      console.error('Photo serve error:', error);
      res.status(500).json({ error: 'Error serving photo' });
    }
  });

  app.delete("/api/photos/remove", async (req: Request, res: Response) => {
    try {
      // Mock photo removal for now
      res.json({ success: true });
    } catch (error) {
      console.error('Photo remove error:', error);
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

  // Payroll management routes
  app.get("/api/payroll", async (req: Request, res: Response) => {
    try {
      const payrollRecords = await storage.getPayroll();
      res.json(payrollRecords);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.get("/api/payroll/stats", async (req: Request, res: Response) => {
    try {
      const payrollRecords = await storage.getPayroll();
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const thisMonthRecords = payrollRecords.filter((record: any) => {
        const recordMonth = new Date(Date.parse(record.month + " 1, " + record.year)).getMonth();
        const recordYear = parseInt(record.year);
        return recordMonth === currentMonth && recordYear === currentYear;
      });

      const stats = {
        totalMonthly: thisMonthRecords.reduce((sum: number, record: any) => sum + Number(record.netSalary), 0),
        paidThisMonth: thisMonthRecords.filter((record: any) => record.status === 'paid').length,
        pending: payrollRecords.filter((record: any) => record.status === 'pending').length,
        averageSalary: payrollRecords.length > 0 ? 
          Math.round(payrollRecords.reduce((sum: number, record: any) => sum + Number(record.netSalary), 0) / payrollRecords.length) : 0
      };
      
      res.json(stats);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.post("/api/payroll", async (req: Request, res: Response) => {
    try {
      const validatedData = insertPayrollSchema.parse(req.body);
      const payrollRecord = await storage.createPayroll(validatedData);
      res.status(201).json(payrollRecord);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.put("/api/payroll/:id", async (req: Request, res: Response) => {
    try {
      const payrollId = parseInt(req.params.id);
      const validatedData = insertPayrollSchema.partial().parse(req.body);
      const payrollRecord = await storage.updatePayroll(payrollId, validatedData);
      
      if (!payrollRecord) {
        return res.status(404).json({ message: "Payroll record not found" });
      }
      
      res.json(payrollRecord);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.put("/api/payroll/:id/status", async (req: Request, res: Response) => {
    try {
      const payrollId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!['pending', 'approved', 'paid'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const payrollRecord = await storage.updatePayroll(payrollId, { status });
      
      if (!payrollRecord) {
        return res.status(404).json({ message: "Payroll record not found" });
      }
      
      res.json(payrollRecord);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.delete("/api/payroll/:id", async (req: Request, res: Response) => {
    try {
      const payrollId = parseInt(req.params.id);
      await storage.deletePayroll(payrollId);
      res.status(204).send();
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  // ===== EXAMINATION SYSTEM ROUTES =====

  // Exam Routes
  app.get("/api/exams", async (req: Request, res: Response) => {
    try {
      const exams = await storage.getExams();
      res.json(exams);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.get("/api/exams/:id", async (req: Request, res: Response) => {
    try {
      const examId = parseInt(req.params.id);
      const exam = await storage.getExam(examId);
      
      if (!exam) {
        return res.status(404).json({ message: "Exam not found" });
      }
      
      res.json(exam);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.get("/api/exams/teacher/:teacherId", async (req: Request, res: Response) => {
    try {
      const teacherId = parseInt(req.params.teacherId);
      const exams = await storage.getExamsByTeacher(teacherId);
      res.json(exams);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.get("/api/exams/class/:classId", async (req: Request, res: Response) => {
    try {
      const classId = req.params.classId;
      const exams = await storage.getExamsByClass(classId);
      res.json(exams);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.post("/api/exams", async (req: Request, res: Response) => {
    try {
      // First validate the data with the schema
      const validatedData = insertExamSchema.parse(req.body);
      
      // Then convert datetime strings to Date objects for storage
      const examData = {
        ...validatedData,
        startTime: validatedData.startTime ? new Date(validatedData.startTime) : null,
        endTime: validatedData.endTime ? new Date(validatedData.endTime) : null,
      };
      
      const exam = await storage.createExam(examData);
      res.status(201).json(exam);
    } catch (error) {
      console.error('Exam creation error:', error);
      handleRouteError(res, error);
    }
  });

  app.put("/api/exams/:id", async (req: Request, res: Response) => {
    try {
      const examId = parseInt(req.params.id);
      
      // First validate the data with the schema
      const validatedData = insertExamSchema.partial().parse(req.body);
      
      // Then convert datetime strings to Date objects for storage
      const examData = {
        ...validatedData,
        startTime: validatedData.startTime ? new Date(validatedData.startTime) : undefined,
        endTime: validatedData.endTime ? new Date(validatedData.endTime) : undefined,
      };
      
      const exam = await storage.updateExam(examId, examData);
      
      if (!exam) {
        return res.status(404).json({ message: "Exam not found" });
      }
      
      res.json(exam);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.delete("/api/exams/:id", async (req: Request, res: Response) => {
    try {
      const examId = parseInt(req.params.id);
      await storage.deleteExam(examId);
      res.status(204).send();
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  // Question Routes
  app.get("/api/questions", async (req: Request, res: Response) => {
    try {
      const questions = await storage.getQuestions();
      res.json(questions);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.get("/api/questions/:id", async (req: Request, res: Response) => {
    try {
      const questionId = parseInt(req.params.id);
      const question = await storage.getQuestion(questionId);
      
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }
      
      res.json(question);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.get("/api/exams/:examId/questions", async (req: Request, res: Response) => {
    try {
      const examId = parseInt(req.params.examId);
      const questions = await storage.getQuestionsByExam(examId);
      
      // Also fetch options for each question
      const questionsWithOptions = await Promise.all(
        questions.map(async (question) => {
          const options = await storage.getQuestionOptionsByQuestion(question.id);
          return { ...question, options };
        })
      );
      
      res.json(questionsWithOptions);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.post("/api/questions", async (req: Request, res: Response) => {
    try {
      const { options, ...questionData } = req.body;
      const validatedData = insertQuestionSchema.parse(questionData);
      
      // Create the question first
      const question = await storage.createQuestion(validatedData);
      
      // Create options if provided
      if (options && Array.isArray(options)) {
        const createdOptions = await Promise.all(
          options.map((option: any) => {
            const validatedOption = insertQuestionOptionSchema.parse({
              ...option,
              questionId: question.id,
            });
            return storage.createQuestionOption(validatedOption);
          })
        );
        
        res.status(201).json({ ...question, options: createdOptions });
      } else {
        res.status(201).json(question);
      }
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.put("/api/questions/:id", async (req: Request, res: Response) => {
    try {
      const questionId = parseInt(req.params.id);
      const { options, ...questionData } = req.body;
      const validatedData = insertQuestionSchema.partial().parse(questionData);
      
      const question = await storage.updateQuestion(questionId, validatedData);
      
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }
      
      // Handle options update if provided
      if (options && Array.isArray(options)) {
        // Delete existing options and create new ones
        const existingOptions = await storage.getQuestionOptionsByQuestion(questionId);
        await Promise.all(
          existingOptions.map(option => storage.deleteQuestionOption(option.id))
        );
        
        const createdOptions = await Promise.all(
          options.map((option: any) => {
            const validatedOption = insertQuestionOptionSchema.parse({
              ...option,
              questionId: question.id,
            });
            return storage.createQuestionOption(validatedOption);
          })
        );
        
        res.json({ ...question, options: createdOptions });
      } else {
        res.json(question);
      }
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.delete("/api/questions/:id", async (req: Request, res: Response) => {
    try {
      const questionId = parseInt(req.params.id);
      await storage.deleteQuestion(questionId);
      res.status(204).send();
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  // Question Options Routes
  app.get("/api/questions/:questionId/options", async (req: Request, res: Response) => {
    try {
      const questionId = parseInt(req.params.questionId);
      const options = await storage.getQuestionOptionsByQuestion(questionId);
      res.json(options);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.post("/api/questions/:questionId/options", async (req: Request, res: Response) => {
    try {
      const questionId = parseInt(req.params.questionId);
      const validatedData = insertQuestionOptionSchema.parse({
        ...req.body,
        questionId,
      });
      const option = await storage.createQuestionOption(validatedData);
      res.status(201).json(option);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.put("/api/options/:id", async (req: Request, res: Response) => {
    try {
      const optionId = parseInt(req.params.id);
      const validatedData = insertQuestionOptionSchema.partial().parse(req.body);
      const option = await storage.updateQuestionOption(optionId, validatedData);
      
      if (!option) {
        return res.status(404).json({ message: "Option not found" });
      }
      
      res.json(option);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.delete("/api/options/:id", async (req: Request, res: Response) => {
    try {
      const optionId = parseInt(req.params.id);
      await storage.deleteQuestionOption(optionId);
      res.status(204).send();
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  // Exam Submission Routes
  app.get("/api/exam-submissions", async (req: Request, res: Response) => {
    try {
      const submissions = await storage.getExamSubmissions();
      res.json(submissions);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.get("/api/exam-submissions/:id", async (req: Request, res: Response) => {
    try {
      const submissionId = parseInt(req.params.id);
      const submission = await storage.getExamSubmission(submissionId);
      
      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }
      
      res.json(submission);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.get("/api/students/:studentId/exam-submissions", async (req: Request, res: Response) => {
    try {
      const studentId = parseInt(req.params.studentId);
      const submissions = await storage.getExamSubmissionsByStudent(studentId);
      res.json(submissions);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.get("/api/exams/:examId/submissions", async (req: Request, res: Response) => {
    try {
      const examId = parseInt(req.params.examId);
      const submissions = await storage.getExamSubmissionsByExam(examId);
      res.json(submissions);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.get("/api/students/:studentId/exams/:examId/submission", async (req: Request, res: Response) => {
    try {
      const studentId = parseInt(req.params.studentId);
      const examId = parseInt(req.params.examId);
      const submission = await storage.getExamSubmissionByStudentAndExam(studentId, examId);
      
      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }
      
      res.json(submission);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.post("/api/exam-submissions", async (req: Request, res: Response) => {
    try {
      const validatedData = insertExamSubmissionSchema.parse(req.body);
      const submission = await storage.createExamSubmission(validatedData);
      res.status(201).json(submission);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.put("/api/exam-submissions/:id", async (req: Request, res: Response) => {
    try {
      const submissionId = parseInt(req.params.id);
      const validatedData = insertExamSubmissionSchema.partial().parse(req.body);
      const submission = await storage.updateExamSubmission(submissionId, validatedData);
      
      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }
      
      res.json(submission);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.delete("/api/exam-submissions/:id", async (req: Request, res: Response) => {
    try {
      const submissionId = parseInt(req.params.id);
      await storage.deleteExamSubmission(submissionId);
      res.status(204).send();
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  // Submission Answer Routes
  app.get("/api/exam-submissions/:submissionId/answers", async (req: Request, res: Response) => {
    try {
      const submissionId = parseInt(req.params.submissionId);
      const answers = await storage.getSubmissionAnswersBySubmission(submissionId);
      res.json(answers);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.post("/api/submission-answers", async (req: Request, res: Response) => {
    try {
      const validatedData = insertSubmissionAnswerSchema.parse(req.body);
      const answer = await storage.createSubmissionAnswer(validatedData);
      res.status(201).json(answer);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.put("/api/submission-answers/:id", async (req: Request, res: Response) => {
    try {
      const answerId = parseInt(req.params.id);
      const validatedData = insertSubmissionAnswerSchema.partial().parse(req.body);
      const answer = await storage.updateSubmissionAnswer(answerId, validatedData);
      
      if (!answer) {
        return res.status(404).json({ message: "Answer not found" });
      }
      
      res.json(answer);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  // Exam Results Routes
  app.get("/api/exam-results", async (req: Request, res: Response) => {
    try {
      const results = await storage.getExamResults();
      res.json(results);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.get("/api/exam-results/:id", async (req: Request, res: Response) => {
    try {
      const resultId = parseInt(req.params.id);
      const result = await storage.getExamResult(resultId);
      
      if (!result) {
        return res.status(404).json({ message: "Result not found" });
      }
      
      res.json(result);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.get("/api/students/:studentId/exam-results", async (req: Request, res: Response) => {
    try {
      const studentId = parseInt(req.params.studentId);
      const results = await storage.getExamResultsByStudent(studentId);
      res.json(results);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.get("/api/exams/:examId/results", async (req: Request, res: Response) => {
    try {
      const examId = parseInt(req.params.examId);
      const results = await storage.getExamResultsByExam(examId);
      res.json(results);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.get("/api/students/:studentId/exams/:examId/result", async (req: Request, res: Response) => {
    try {
      const studentId = parseInt(req.params.studentId);
      const examId = parseInt(req.params.examId);
      const result = await storage.getExamResultByStudentAndExam(studentId, examId);
      
      if (!result) {
        return res.status(404).json({ message: "Result not found" });
      }
      
      res.json(result);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.post("/api/exam-results", async (req: Request, res: Response) => {
    try {
      const validatedData = insertExamResultSchema.parse(req.body);
      const result = await storage.createExamResult(validatedData);
      res.status(201).json(result);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.put("/api/exam-results/:id", async (req: Request, res: Response) => {
    try {
      const resultId = parseInt(req.params.id);
      const validatedData = insertExamResultSchema.partial().parse(req.body);
      const result = await storage.updateExamResult(resultId, validatedData);
      
      if (!result) {
        return res.status(404).json({ message: "Result not found" });
      }
      
      res.json(result);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  app.delete("/api/exam-results/:id", async (req: Request, res: Response) => {
    try {
      const resultId = parseInt(req.params.id);
      await storage.deleteExamResult(resultId);
      res.status(204).send();
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  // Exam Statistics Routes
  app.get("/api/exams/:examId/stats", async (req: Request, res: Response) => {
    try {
      const examId = parseInt(req.params.examId);
      
      // Get exam details
      const exam = await storage.getExam(examId);
      if (!exam) {
        return res.status(404).json({ message: "Exam not found" });
      }
      
      // Get all submissions for this exam
      const submissions = await storage.getExamSubmissionsByExam(examId);
      const results = await storage.getExamResultsByExam(examId);
      
      // Calculate statistics
      const totalStudentsAttempted = submissions.length;
      const totalStudentsCompleted = submissions.filter(s => s.status === 'submitted' || s.status === 'graded').length;
      const averageScore = results.length > 0 ? 
        results.reduce((sum, r) => sum + (Number(r.percentage) || 0), 0) / results.length : 0;
      const passRate = results.length > 0 ?
        (results.filter(r => r.passed).length / results.length) * 100 : 0;
      const highestScore = results.length > 0 ? 
        Math.max(...results.map(r => Number(r.percentage) || 0)) : 0;
      const lowestScore = results.length > 0 ? 
        Math.min(...results.map(r => Number(r.percentage) || 0)) : 0;
      
      const stats = {
        examId,
        examTitle: exam.title,
        totalStudentsAttempted,
        totalStudentsCompleted,
        averageScore: Math.round(averageScore * 100) / 100,
        passRate: Math.round(passRate * 100) / 100,
        highestScore,
        lowestScore,
        totalQuestions: await storage.getQuestionsByExam(examId).then(q => q.length),
        totalMarks: exam.totalMarks,
        status: exam.status,
      };
      
      res.json(stats);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  // Auto-grading Route for multiple choice questions
  app.post("/api/exams/:examId/submissions/:submissionId/auto-grade", async (req: Request, res: Response) => {
    try {
      const examId = parseInt(req.params.examId);
      const submissionId = parseInt(req.params.submissionId);
      
      // Get submission and questions
      const submission = await storage.getExamSubmission(submissionId);
      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }
      
      const questions = await storage.getQuestionsByExam(examId);
      const answers = await storage.getSubmissionAnswersBySubmission(submissionId);
      
      let totalScore = 0;
      let maxScore = 0;
      let correctAnswers = 0;
      
      // Grade each answer
      for (const question of questions) {
        maxScore += question.marks;
        const answer = answers.find(a => a.questionId === question.id);
        
        if (answer && question.questionType === 'multiple_choice') {
          const options = await storage.getQuestionOptionsByQuestion(question.id);
          const correctOption = options.find(o => o.isCorrect);
          
          if (correctOption && answer.selectedOptionId === correctOption.id) {
            totalScore += question.marks;
            correctAnswers++;
            
            // Update answer with correct status
            await storage.updateSubmissionAnswer(answer.id, {
              isCorrect: true,
              marksAwarded: question.marks.toString(),
              maxMarks: question.marks,
            });
          } else if (answer.selectedOptionId) {
            // Update answer as incorrect
            await storage.updateSubmissionAnswer(answer.id, {
              isCorrect: false,
              marksAwarded: "0",
              maxMarks: question.marks,
            });
          }
        }
      }
      
      const exam = await storage.getExam(examId);
      if (!exam) {
        return res.status(404).json({ message: "Exam not found" });
      }
      
      const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
      const passed = exam.passingMarks ? percentage >= ((exam.passingMarks / exam.totalMarks) * 100) : percentage >= 50;
      
      // Update submission
      await storage.updateExamSubmission(submissionId, {
        status: 'graded',
        totalScore: totalScore.toString(),
        maxScore,
        percentage: percentage.toString(),
      });
      
      // Create or update exam result
      const existingResult = await storage.getExamResultByStudentAndExam(submission.studentId, examId);
      
      const resultData = {
        examId,
        studentId: submission.studentId,
        submissionId,
        totalScore: totalScore.toString(),
        maxScore,
        percentage: percentage.toString(),
        passed,
        correctAnswers,
        totalQuestions: questions.length,
        timeSpent: submission.timeSpent,
      };
      
      let result;
      if (existingResult) {
        result = await storage.updateExamResult(existingResult.id, resultData);
      } else {
        result = await storage.createExamResult(resultData);
      }
      
      res.json({
        message: "Auto-grading completed",
        result,
        totalScore,
        maxScore,
        percentage,
        correctAnswers,
        totalQuestions: questions.length,
      });
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  // ========== Question Management APIs ==========

  // Get all questions for an exam
  app.get("/api/exams/:examId/questions", async (req: Request, res: Response) => {
    try {
      const examId = parseInt(req.params.examId);
      const questions = await storage.getQuestionsByExam(examId);
      
      // Get options for each question
      const questionsWithOptions = await Promise.all(
        questions.map(async (question) => {
          const options = await storage.getQuestionOptionsByQuestion(question.id);
          return { ...question, options };
        })
      );
      
      res.json(questionsWithOptions);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  // Create a new question
  app.post("/api/questions", async (req: Request, res: Response) => {
    try {
      const validatedData = insertQuestionSchema.parse(req.body);
      const question = await storage.createQuestion(validatedData);
      res.status(201).json(question);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  // Update a question
  app.put("/api/questions/:id", async (req: Request, res: Response) => {
    try {
      const questionId = parseInt(req.params.id);
      const validatedData = insertQuestionSchema.partial().parse(req.body);
      const question = await storage.updateQuestion(questionId, validatedData);
      
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }
      
      res.json(question);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  // Delete a question
  app.delete("/api/questions/:id", async (req: Request, res: Response) => {
    try {
      const questionId = parseInt(req.params.id);
      await storage.deleteQuestion(questionId);
      res.status(204).send();
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  // Create question option
  app.post("/api/questions/:questionId/options", async (req: Request, res: Response) => {
    try {
      const questionId = parseInt(req.params.questionId);
      const validatedData = insertQuestionOptionSchema.parse({
        ...req.body,
        questionId,
      });
      const option = await storage.createQuestionOption(validatedData);
      res.status(201).json(option);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  // Update question option
  app.put("/api/question-options/:id", async (req: Request, res: Response) => {
    try {
      const optionId = parseInt(req.params.id);
      const validatedData = insertQuestionOptionSchema.partial().parse(req.body);
      const option = await storage.updateQuestionOption(optionId, validatedData);
      
      if (!option) {
        return res.status(404).json({ message: "Option not found" });
      }
      
      res.json(option);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  // Delete question option
  app.delete("/api/question-options/:id", async (req: Request, res: Response) => {
    try {
      const optionId = parseInt(req.params.id);
      await storage.deleteQuestionOption(optionId);
      res.status(204).send();
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  // ========== Submission Tracking APIs ==========

  // Get all submissions for an exam
  app.get("/api/exams/:examId/submissions", async (req: Request, res: Response) => {
    try {
      const examId = parseInt(req.params.examId);
      const submissions = await storage.getExamSubmissionsByExam(examId);
      res.json(submissions);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  // Get submissions by student
  app.get("/api/students/:studentId/submissions", async (req: Request, res: Response) => {
    try {
      const studentId = parseInt(req.params.studentId);
      const submissions = await storage.getExamSubmissionsByStudent(studentId);
      res.json(submissions);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  // Get specific submission with answers
  app.get("/api/submissions/:id", async (req: Request, res: Response) => {
    try {
      const submissionId = parseInt(req.params.id);
      const submission = await storage.getExamSubmission(submissionId);
      
      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }
      
      const answers = await storage.getSubmissionAnswersBySubmission(submissionId);
      res.json({ ...submission, answers });
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  // Create exam submission
  app.post("/api/submissions", async (req: Request, res: Response) => {
    try {
      const validatedData = insertExamSubmissionSchema.parse(req.body);
      const submission = await storage.createExamSubmission(validatedData);
      res.status(201).json(submission);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  // Update submission
  app.put("/api/submissions/:id", async (req: Request, res: Response) => {
    try {
      const submissionId = parseInt(req.params.id);
      const validatedData = insertExamSubmissionSchema.partial().parse(req.body);
      const submission = await storage.updateExamSubmission(submissionId, validatedData);
      
      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }
      
      res.json(submission);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  // ========== Results Viewing APIs ==========

  // Get all results for an exam
  app.get("/api/exams/:examId/results", async (req: Request, res: Response) => {
    try {
      const examId = parseInt(req.params.examId);
      const results = await storage.getExamResultsByExam(examId);
      res.json(results);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  // Get results by student
  app.get("/api/students/:studentId/results", async (req: Request, res: Response) => {
    try {
      const studentId = parseInt(req.params.studentId);
      const results = await storage.getExamResultsByStudent(studentId);
      res.json(results);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  // Get specific result
  app.get("/api/results/:id", async (req: Request, res: Response) => {
    try {
      const resultId = parseInt(req.params.id);
      const result = await storage.getExamResult(resultId);
      
      if (!result) {
        return res.status(404).json({ message: "Result not found" });
      }
      
      res.json(result);
    } catch (error) {
      handleRouteError(res, error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
