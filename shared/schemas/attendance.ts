import { relations } from 'drizzle-orm';
import { boolean, date, int, mysqlTable, text, timestamp, varchar } from 'drizzle-orm/mysql-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from "zod";
import { students } from './student';
import { teachers } from './teacher';

// Attendance Management Tables
export const attendance = mysqlTable('attendance', {
  id: int('id').primaryKey().autoincrement(),
  studentId: int('student_id').references(() => students.id).notNull(),
  teacherId: int('teacher_id').references(() => teachers.id),
  date: date('date').notNull(),
  status: varchar('status', { length: 20 }).notNull(),
  remarks: text('remarks'),
  grade: varchar('grade', { length: 20 }),
  section: varchar('section', { length: 20 }),
  subject: varchar('subject', { length: 100 }),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const attendanceRelations = relations(attendance, ({ one }) => ({
  student: one(students, {
    fields: [attendance.studentId],
    references: [students.id],
  }),
  teacher: one(teachers, {
    fields: [attendance.teacherId],
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