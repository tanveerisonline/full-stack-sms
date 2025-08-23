import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import type { Request, Response } from "express";
import { storage } from "./storage";
import { seedDatabase } from "./seed";
import { 
  insertUserSchema, insertStudentSchema, insertTeacherSchema, insertClassSchema,
  insertAssignmentSchema, insertGradeSchema, insertAttendanceSchema, 
  insertBookSchema, insertBookIssueSchema, insertTransactionSchema,
  insertAnnouncementSchema, insertTimetableSchema
} from "@shared/schema";
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
