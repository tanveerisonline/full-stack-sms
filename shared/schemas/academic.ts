import { relations } from 'drizzle-orm';
import { date, int, mysqlTable, text, timestamp, decimal, varchar } from 'drizzle-orm/mysql-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from "zod";
import { teachers } from './teacher';
import { students } from './student';

// Academic Management Tables
export const classes = mysqlTable('classes', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 100 }).notNull(),
  grade: varchar('grade', { length: 20 }).notNull(),
  section: varchar('section', { length: 20 }),
  subject: varchar('subject', { length: 100 }).notNull(),
  teacherId: int('teacher_id').references(() => teachers.id),
  room: varchar('room', { length: 50 }),
  schedule: text('schedule'),
  maxStudents: int('max_students'),
  currentStudents: int('current_students').default(0),
  status: varchar('status', { length: 20 }).default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const timetable = mysqlTable('timetable', {
  id: int('id').primaryKey().autoincrement(),
  grade: varchar('grade', { length: 20 }).notNull(),
  section: varchar('section', { length: 20 }),
  dayOfWeek: varchar('day_of_week', { length: 20 }).notNull(),
  period: int('period').notNull(),
  subject: varchar('subject', { length: 100 }).notNull(),
  teacherId: int('teacher_id').references(() => teachers.id),
  room: varchar('room', { length: 50 }),
  startTime: varchar('start_time', { length: 10 }).notNull(),
  endTime: varchar('end_time', { length: 10 }).notNull(),
  status: varchar('status', { length: 20 }).default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const assignments = mysqlTable('assignments', {
  id: int('id').primaryKey().autoincrement(),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  subject: varchar('subject', { length: 100 }).notNull(),
  grade: varchar('grade', { length: 20 }).notNull(),
  section: varchar('section', { length: 20 }),
  teacherId: int('teacher_id').references(() => teachers.id),
  dueDate: date('due_date').notNull(),
  totalMarks: int('total_marks'),
  instructions: text('instructions'),
  attachments: text('attachments'),
  status: varchar('status', { length: 20 }).default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const grades = mysqlTable('grades', {
  id: int('id').primaryKey().autoincrement(),
  studentId: int('student_id').references(() => students.id).notNull(),
  assignmentId: int('assignment_id').references(() => assignments.id),
  subject: varchar('subject', { length: 100 }).notNull(),
  examType: varchar('exam_type', { length: 50 }),
  marksObtained: decimal('marks_obtained', { precision: 5, scale: 2 }),
  totalMarks: decimal('total_marks', { precision: 5, scale: 2 }),
  grade: varchar('grade', { length: 10 }),
  remarks: text('remarks'),
  gradedBy: int('graded_by').references(() => teachers.id),
  gradedAt: timestamp('graded_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const classesRelations = relations(classes, ({ one }) => ({
  teacher: one(teachers, {
    fields: [classes.teacherId],
    references: [teachers.id],
  }),
}));

export const timetableRelations = relations(timetable, ({ one }) => ({
  teacher: one(teachers, {
    fields: [timetable.teacherId],
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

// Insert schemas
export const insertClassSchema = createInsertSchema(classes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTimetableSchema = createInsertSchema(timetable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAssignmentSchema = createInsertSchema(assignments, {
  // Accept date strings for dueDate
  dueDate: z.string().transform((val) => val),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGradeSchema = createInsertSchema(grades).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type Class = typeof classes.$inferSelect;
export type InsertClass = z.infer<typeof insertClassSchema>;
export type Timetable = typeof timetable.$inferSelect;
export type InsertTimetable = z.infer<typeof insertTimetableSchema>;
export type Assignment = typeof assignments.$inferSelect;
export type InsertAssignment = z.infer<typeof insertAssignmentSchema>;
export type Grade = typeof grades.$inferSelect;
export type InsertGrade = z.infer<typeof insertGradeSchema>;