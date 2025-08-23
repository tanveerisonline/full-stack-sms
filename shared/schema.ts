import { relations, sql } from 'drizzle-orm';
import { boolean, integer, pgTable, serial, text, timestamp, numeric, date, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from "zod";

// Database Tables
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  role: text('role').notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  avatar: text('avatar'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const students = pgTable('students', {
  id: serial('id').primaryKey(),
  rollNumber: text('roll_number').notNull().unique(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').unique(),
  phone: text('phone'),
  dateOfBirth: date('date_of_birth'),
  grade: text('grade').notNull(),
  section: text('section'),
  admissionDate: date('admission_date').notNull(),
  parentName: text('parent_name'),
  parentContact: text('parent_contact'),
  parentEmail: text('parent_email'),
  address: text('address'),
  status: text('status').default('active').notNull(),
  avatar: text('avatar'),
  bloodGroup: text('blood_group'),
  medicalInfo: text('medical_info'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const teachers = pgTable('teachers', {
  id: serial('id').primaryKey(),
  employeeId: text('employee_id').notNull().unique(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  dateOfBirth: date('date_of_birth'),
  hireDate: date('hire_date').notNull(),
  department: text('department'),
  subject: text('subject'),
  qualification: text('qualification'),
  experience: integer('experience'),
  salary: numeric('salary', { precision: 10, scale: 2 }),
  address: text('address'),
  status: text('status').default('active').notNull(),
  avatar: text('avatar'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const classes = pgTable('classes', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  grade: text('grade').notNull(),
  section: text('section'),
  subject: text('subject').notNull(),
  teacherId: integer('teacher_id').references(() => teachers.id),
  room: text('room'),
  schedule: text('schedule'),
  maxStudents: integer('max_students'),
  currentStudents: integer('current_students').default(0),
  status: text('status').default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const timetable = pgTable('timetable', {
  id: serial('id').primaryKey(),
  grade: text('grade').notNull(),
  section: text('section'),
  dayOfWeek: text('day_of_week').notNull(),
  period: integer('period').notNull(),
  subject: text('subject').notNull(),
  teacherId: integer('teacher_id').references(() => teachers.id),
  room: text('room'),
  startTime: text('start_time').notNull(),
  endTime: text('end_time').notNull(),
  status: text('status').default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const attendance = pgTable('attendance', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => students.id).notNull(),
  date: date('date').notNull(),
  status: text('status').notNull(),
  remarks: text('remarks'),
  markedBy: integer('marked_by').references(() => teachers.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const assignments = pgTable('assignments', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  subject: text('subject').notNull(),
  grade: text('grade').notNull(),
  section: text('section'),
  teacherId: integer('teacher_id').references(() => teachers.id),
  dueDate: date('due_date').notNull(),
  totalMarks: integer('total_marks'),
  instructions: text('instructions'),
  attachments: text('attachments'),
  status: text('status').default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const grades = pgTable('grades', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => students.id).notNull(),
  assignmentId: integer('assignment_id').references(() => assignments.id),
  subject: text('subject').notNull(),
  examType: text('exam_type'),
  marksObtained: numeric('marks_obtained', { precision: 5, scale: 2 }),
  totalMarks: numeric('total_marks', { precision: 5, scale: 2 }),
  grade: text('grade'),
  remarks: text('remarks'),
  gradedBy: integer('graded_by').references(() => teachers.id),
  gradedAt: timestamp('graded_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => students.id).notNull(),
  type: text('type').notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  description: text('description'),
  dueDate: date('due_date'),
  paidDate: date('paid_date'),
  status: text('status').default('pending').notNull(),
  paymentMethod: text('payment_method'),
  referenceNumber: text('reference_number'),
  remarks: text('remarks'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const books = pgTable('books', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  author: text('author').notNull(),
  isbn: text('isbn').unique(),
  category: text('category'),
  publisher: text('publisher'),
  publicationYear: integer('publication_year'),
  quantity: integer('quantity').default(1).notNull(),
  available: integer('available').default(1).notNull(),
  location: text('location'),
  description: text('description'),
  status: text('status').default('available').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const bookIssues = pgTable('book_issues', {
  id: serial('id').primaryKey(),
  bookId: integer('book_id').references(() => books.id).notNull(),
  studentId: integer('student_id').references(() => students.id).notNull(),
  issueDate: date('issue_date').notNull(),
  dueDate: date('due_date').notNull(),
  returnDate: date('return_date'),
  status: text('status').default('issued').notNull(),
  fine: numeric('fine', { precision: 8, scale: 2 }).default('0'),
  remarks: text('remarks'),
  issuedBy: integer('issued_by').references(() => teachers.id),
  returnedBy: integer('returned_by').references(() => teachers.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const announcements = pgTable('announcements', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  type: text('type').notNull(),
  targetAudience: text('target_audience').notNull(),
  grade: text('grade'),
  section: text('section'),
  publishDate: date('publish_date').notNull(),
  expiryDate: date('expiry_date'),
  priority: text('priority').default('normal').notNull(),
  status: text('status').default('active').notNull(),
  createdBy: integer('created_by').references(() => users.id),
  attachments: text('attachments'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  announcements: many(announcements),
}));

export const studentsRelations = relations(students, ({ many }) => ({
  grades: many(grades),
  attendance: many(attendance),
  bookIssues: many(bookIssues),
  transactions: many(transactions),
}));

export const teachersRelations = relations(teachers, ({ many }) => ({
  classes: many(classes),
  assignments: many(assignments),
  grades: many(grades),
  attendance: many(attendance),
  bookIssues: many(bookIssues),
  timetable: many(timetable),
}));

export const classesRelations = relations(classes, ({ one }) => ({
  teacher: one(teachers, {
    fields: [classes.teacherId],
    references: [teachers.id],
  }),
}));

export const assignmentsRelations = relations(assignments, ({ one, many }) => ({
  teacher: one(teachers, {
    fields: [assignments.teacherId],
    references: [teachers.id],
  }),
  grades: many(grades),
}));

export const gradesRelations = relations(grades, ({ one }) => ({
  student: one(students, {
    fields: [grades.studentId],
    references: [students.id],
  }),
  assignment: one(assignments, {
    fields: [grades.assignmentId],
    references: [assignments.id],
  }),
  gradedByTeacher: one(teachers, {
    fields: [grades.gradedBy],
    references: [teachers.id],
  }),
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
  student: one(students, {
    fields: [attendance.studentId],
    references: [students.id],
  }),
  markedByTeacher: one(teachers, {
    fields: [attendance.markedBy],
    references: [teachers.id],
  }),
}));

export const booksRelations = relations(books, ({ many }) => ({
  issues: many(bookIssues),
}));

export const bookIssuesRelations = relations(bookIssues, ({ one }) => ({
  book: one(books, {
    fields: [bookIssues.bookId],
    references: [books.id],
  }),
  student: one(students, {
    fields: [bookIssues.studentId],
    references: [students.id],
  }),
  issuedByTeacher: one(teachers, {
    fields: [bookIssues.issuedBy],
    references: [teachers.id],
  }),
  returnedByTeacher: one(teachers, {
    fields: [bookIssues.returnedBy],
    references: [teachers.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  student: one(students, {
    fields: [transactions.studentId],
    references: [students.id],
  }),
}));

export const announcementsRelations = relations(announcements, ({ one }) => ({
  createdByUser: one(users, {
    fields: [announcements.createdBy],
    references: [users.id],
  }),
}));

export const timetableRelations = relations(timetable, ({ one }) => ({
  teacher: one(teachers, {
    fields: [timetable.teacherId],
    references: [teachers.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTeacherSchema = createInsertSchema(teachers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertClassSchema = createInsertSchema(classes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAssignmentSchema = createInsertSchema(assignments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGradeSchema = createInsertSchema(grades).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAttendanceSchema = createInsertSchema(attendance).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBookSchema = createInsertSchema(books).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBookIssueSchema = createInsertSchema(bookIssues).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAnnouncementSchema = createInsertSchema(announcements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTimetableSchema = createInsertSchema(timetable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Student = typeof students.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Teacher = typeof teachers.$inferSelect;
export type InsertTeacher = z.infer<typeof insertTeacherSchema>;
export type Class = typeof classes.$inferSelect;
export type InsertClass = z.infer<typeof insertClassSchema>;
export type Assignment = typeof assignments.$inferSelect;
export type InsertAssignment = z.infer<typeof insertAssignmentSchema>;
export type Grade = typeof grades.$inferSelect;
export type InsertGrade = z.infer<typeof insertGradeSchema>;
export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type Book = typeof books.$inferSelect;
export type InsertBook = z.infer<typeof insertBookSchema>;
export type BookIssue = typeof bookIssues.$inferSelect;
export type InsertBookIssue = z.infer<typeof insertBookIssueSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type Timetable = typeof timetable.$inferSelect;
export type InsertTimetable = z.infer<typeof insertTimetableSchema>;
