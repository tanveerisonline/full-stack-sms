import { relations } from 'drizzle-orm';
import { date, int, mysqlTable, text, timestamp, decimal, varchar } from 'drizzle-orm/mysql-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from "zod";

// Teacher Management Tables
export const teachers = mysqlTable('teachers', {
  id: int('id').primaryKey().autoincrement(),
  employeeId: varchar('employee_id', { length: 50 }).notNull().unique(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 100 }).notNull().unique(),
  phone: varchar('phone', { length: 20 }),
  dateOfBirth: date('date_of_birth'),
  hireDate: date('hire_date').notNull(),
  department: varchar('department', { length: 100 }),
  subject: varchar('subject', { length: 100 }),
  qualification: text('qualification'),
  experience: int('experience'),
  salary: decimal('salary', { precision: 10, scale: 2 }),
  address: text('address'),
  status: varchar('status', { length: 20 }).default('active').notNull(),
  avatar: text('avatar'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations - will be defined in main index after importing all tables
export const teachersRelations = relations(teachers, ({ many }) => ({
  // These relations will be defined in the main index file
  // classes: many(classes),
  // assignments: many(assignments),
  // grades: many(grades),
  // attendance: many(attendance),
  // bookIssues: many(bookIssues),
  // timetable: many(timetable),
}));

// Insert schemas with validation
export const insertTeacherSchema = createInsertSchema(teachers, {
  email: z.string().email("Invalid email format"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  employeeId: z.string().min(1, "Employee ID is required"),
  experience: z.coerce.number().min(0, "Experience must be positive").optional(),
  salary: z.coerce.string().optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type Teacher = typeof teachers.$inferSelect;
export type InsertTeacher = z.infer<typeof insertTeacherSchema>;