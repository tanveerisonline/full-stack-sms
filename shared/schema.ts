import { z } from "zod";

// User schema
export const userSchema = z.object({
  id: z.string(),
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['admin', 'teacher', 'student', 'parent']),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  avatar: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Student schema
export const studentSchema = z.object({
  id: z.string(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string(),
  dateOfBirth: z.string(),
  grade: z.string(),
  rollNumber: z.string(),
  address: z.string(),
  parentName: z.string(),
  parentContact: z.string(),
  parentEmail: z.string().email(),
  admissionDate: z.string(),
  status: z.enum(['active', 'inactive', 'pending', 'graduated']),
  avatar: z.string().optional(),
  bloodGroup: z.string().optional(),
  medicalInfo: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Teacher schema
export const teacherSchema = z.object({
  id: z.string(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string(),
  dateOfBirth: z.string(),
  address: z.string(),
  qualification: z.string(),
  experience: z.number(),
  subjects: z.array(z.string()),
  salary: z.number(),
  joinDate: z.string(),
  status: z.enum(['active', 'inactive']),
  avatar: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Course schema
export const courseSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  code: z.string().min(1),
  description: z.string(),
  grade: z.string(),
  subject: z.string(),
  credits: z.number(),
  teacherId: z.string(),
  duration: z.number(), // in hours
  status: z.enum(['active', 'inactive']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Class schedule schema
export const classScheduleSchema = z.object({
  id: z.string(),
  courseId: z.string(),
  teacherId: z.string(),
  grade: z.string(),
  section: z.string(),
  subject: z.string(),
  dayOfWeek: z.number(), // 0-6 (Sunday-Saturday)
  startTime: z.string(),
  endTime: z.string(),
  room: z.string(),
  status: z.enum(['active', 'cancelled']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Attendance schema
export const attendanceSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  date: z.string(),
  status: z.enum(['present', 'absent', 'late', 'excused']),
  notes: z.string().optional(),
  markedBy: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Assignment schema
export const assignmentSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string(),
  courseId: z.string(),
  teacherId: z.string(),
  grade: z.string(),
  subject: z.string(),
  dueDate: z.string(),
  totalMarks: z.number(),
  status: z.enum(['draft', 'published', 'closed']),
  attachments: z.array(z.string()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Grade schema
export const gradeSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  assignmentId: z.string().optional(),
  examId: z.string().optional(),
  subject: z.string(),
  marks: z.number(),
  totalMarks: z.number(),
  percentage: z.number(),
  grade: z.string(), // A, B, C, D, F
  comments: z.string().optional(),
  gradedBy: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Financial transaction schema
export const transactionSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  type: z.enum(['tuition', 'library', 'transport', 'hostel', 'examination', 'other']),
  amount: z.number(),
  status: z.enum(['paid', 'pending', 'overdue', 'refunded']),
  dueDate: z.string(),
  paidDate: z.string().optional(),
  paymentMethod: z.string().optional(),
  description: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Library book schema
export const bookSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  author: z.string().min(1),
  isbn: z.string(),
  category: z.string(),
  totalCopies: z.number(),
  availableCopies: z.number(),
  publishedYear: z.number(),
  publisher: z.string(),
  location: z.string(), // shelf location
  status: z.enum(['available', 'damaged', 'lost']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Book issue schema
export const bookIssueSchema = z.object({
  id: z.string(),
  bookId: z.string(),
  studentId: z.string(),
  issuedDate: z.string(),
  dueDate: z.string(),
  returnDate: z.string().optional(),
  status: z.enum(['issued', 'returned', 'overdue']),
  fineAmount: z.number().optional(),
  notes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Announcement schema
export const announcementSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  content: z.string().min(1),
  type: z.enum(['general', 'academic', 'event', 'urgent']),
  targetAudience: z.array(z.enum(['students', 'parents', 'teachers', 'all'])),
  priority: z.enum(['low', 'medium', 'high']),
  publishDate: z.string(),
  expiryDate: z.string().optional(),
  attachments: z.array(z.string()).optional(),
  createdBy: z.string(),
  status: z.enum(['draft', 'published', 'archived']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Export insert schemas
export const insertUserSchema = userSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const insertStudentSchema = studentSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const insertTeacherSchema = teacherSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const insertCourseSchema = courseSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const insertClassScheduleSchema = classScheduleSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const insertAttendanceSchema = attendanceSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const insertAssignmentSchema = assignmentSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const insertGradeSchema = gradeSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const insertTransactionSchema = transactionSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const insertBookSchema = bookSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const insertBookIssueSchema = bookIssueSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const insertAnnouncementSchema = announcementSchema.omit({ id: true, createdAt: true, updatedAt: true });

// Export types
export type User = z.infer<typeof userSchema>;
export type Student = z.infer<typeof studentSchema>;
export type Teacher = z.infer<typeof teacherSchema>;
export type Course = z.infer<typeof courseSchema>;
export type ClassSchedule = z.infer<typeof classScheduleSchema>;
export type Attendance = z.infer<typeof attendanceSchema>;
export type Assignment = z.infer<typeof assignmentSchema>;
export type Grade = z.infer<typeof gradeSchema>;
export type Transaction = z.infer<typeof transactionSchema>;
export type Book = z.infer<typeof bookSchema>;
export type BookIssue = z.infer<typeof bookIssueSchema>;
export type Announcement = z.infer<typeof announcementSchema>;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type InsertTeacher = z.infer<typeof insertTeacherSchema>;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type InsertClassSchedule = z.infer<typeof insertClassScheduleSchema>;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type InsertAssignment = z.infer<typeof insertAssignmentSchema>;
export type InsertGrade = z.infer<typeof insertGradeSchema>;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type InsertBook = z.infer<typeof insertBookSchema>;
export type InsertBookIssue = z.infer<typeof insertBookIssueSchema>;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
