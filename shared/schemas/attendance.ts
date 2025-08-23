import { relations } from 'drizzle-orm';
import { date, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from "zod";
import { students } from './student';
import { teachers } from './teacher';

// Attendance Management Tables
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

// Relations
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

// Insert schemas
export const insertAttendanceSchema = createInsertSchema(attendance).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;