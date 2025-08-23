import { relations } from 'drizzle-orm';
import { date, integer, pgTable, serial, text, timestamp, numeric } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from "zod";
import { teachers } from './teacher';
import { students } from './student';

// Academic Management Tables
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

// Types
export type Class = typeof classes.$inferSelect;
export type InsertClass = z.infer<typeof insertClassSchema>;
export type Timetable = typeof timetable.$inferSelect;
export type InsertTimetable = z.infer<typeof insertTimetableSchema>;
export type Assignment = typeof assignments.$inferSelect;
export type InsertAssignment = z.infer<typeof insertAssignmentSchema>;
export type Grade = typeof grades.$inferSelect;
export type InsertGrade = z.infer<typeof insertGradeSchema>;