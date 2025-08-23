import { relations } from 'drizzle-orm';
import { boolean, date, integer, pgTable, serial, text, timestamp, numeric } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from "zod";

// Student Management Tables
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
  createdAt: true,
  updatedAt: true,
}).extend({
  admissionDate: z.string().optional(),
});

// Types
export type Student = typeof students.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;