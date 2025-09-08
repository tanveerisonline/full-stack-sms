import { relations } from 'drizzle-orm';
import { boolean, date, int, mysqlTable, text, timestamp, decimal, varchar } from 'drizzle-orm/mysql-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from "zod";

// Student Management Tables
export const students = mysqlTable('students', {
  id: int('id').primaryKey().autoincrement(),
  rollNumber: varchar('roll_number', { length: 50 }).notNull().unique(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: varchar('email', { length: 255 }).unique(),
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

// Will be imported from other schemas
// export const attendance = pgTable('attendance', { ... })
// export const grades = pgTable('grades', { ... })
// export const transactions = pgTable('transactions', { ... })
// export const bookIssues = pgTable('book_issues', { ... })

// Relations - will be defined after all tables are imported
export const studentsRelations = relations(students, ({ many }) => ({
  // These relations will be defined in the main index file
  // grades: many(grades),
  // attendance: many(attendance),
  // bookIssues: many(bookIssues),
  // transactions: many(transactions),
}));

// Insert schemas
export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
  rollNumber: true, // Auto-generated
  admissionDate: true, // Auto-generated
  createdAt: true,
  updatedAt: true,
});

// Types
export type Student = typeof students.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;