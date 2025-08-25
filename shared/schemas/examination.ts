import { 
  pgTable, 
  serial, 
  varchar, 
  text, 
  timestamp, 
  integer, 
  decimal, 
  boolean,
  jsonb,
  unique
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Exams table - Main exam metadata
export const exams = pgTable('exams', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  subject: varchar('subject', { length: 100 }).notNull(),
  class: varchar('class', { length: 50 }).notNull(),
  teacherId: integer('teacher_id').notNull(),
  totalMarks: integer('total_marks').notNull().default(0),
  duration: integer('duration').notNull(), // Duration in minutes
  instructions: text('instructions'),
  status: varchar('status', { length: 20 }).notNull().default('draft'), // draft, published, completed, cancelled
  startTime: timestamp('start_time'),
  endTime: timestamp('end_time'),
  allowLateSubmission: boolean('allow_late_submission').default(false),
  showResultsAfterSubmission: boolean('show_results_after_submission').default(false),
  shuffleQuestions: boolean('shuffle_questions').default(false),
  maxAttempts: integer('max_attempts').default(1),
  passingMarks: integer('passing_marks'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Questions table - Exam questions
export const questions = pgTable('questions', {
  id: serial('id').primaryKey(),
  examId: integer('exam_id').notNull().references(() => exams.id, { onDelete: 'cascade' }),
  questionText: text('question_text').notNull(),
  questionType: varchar('question_type', { length: 20 }).notNull(), // multiple_choice, true_false, short_answer, essay
  marks: integer('marks').notNull().default(1),
  explanation: text('explanation'), // Explanation for the correct answer
  orderIndex: integer('order_index').notNull().default(0),
  isRequired: boolean('is_required').default(true),
  metadata: jsonb('metadata'), // Additional question data (images, formulas, etc.)
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Question Options table - Multiple choice options
export const questionOptions = pgTable('question_options', {
  id: serial('id').primaryKey(),
  questionId: integer('question_id').notNull().references(() => questions.id, { onDelete: 'cascade' }),
  optionText: text('option_text').notNull(),
  isCorrect: boolean('is_correct').default(false),
  orderIndex: integer('order_index').notNull().default(0),
  explanation: text('explanation'), // Explanation for this specific option
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Exam Submissions table - Student exam submissions
export const examSubmissions = pgTable('exam_submissions', {
  id: serial('id').primaryKey(),
  examId: integer('exam_id').notNull().references(() => exams.id, { onDelete: 'cascade' }),
  studentId: integer('student_id').notNull(),
  attemptNumber: integer('attempt_number').notNull().default(1),
  status: varchar('status', { length: 20 }).notNull().default('in_progress'), // in_progress, submitted, graded, expired
  startedAt: timestamp('started_at').defaultNow().notNull(),
  submittedAt: timestamp('submitted_at'),
  autoSubmittedAt: timestamp('auto_submitted_at'), // For time-based auto submission
  totalScore: decimal('total_score', { precision: 5, scale: 2 }),
  maxScore: integer('max_score'),
  percentage: decimal('percentage', { precision: 5, scale: 2 }),
  timeSpent: integer('time_spent'), // Time spent in minutes
  isLateSubmission: boolean('is_late_submission').default(false),
  metadata: jsonb('metadata'), // Additional submission data
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  unique_student_attempt: unique().on(table.examId, table.studentId, table.attemptNumber),
}));

// Submission Answers table - Individual question answers
export const submissionAnswers = pgTable('submission_answers', {
  id: serial('id').primaryKey(),
  submissionId: integer('submission_id').notNull().references(() => examSubmissions.id, { onDelete: 'cascade' }),
  questionId: integer('question_id').notNull().references(() => questions.id, { onDelete: 'cascade' }),
  answerText: text('answer_text'), // For text-based answers
  selectedOptionId: integer('selected_option_id').references(() => questionOptions.id), // For multiple choice
  selectedOptions: jsonb('selected_options'), // For multiple select questions
  isCorrect: boolean('is_correct'),
  marksAwarded: decimal('marks_awarded', { precision: 5, scale: 2 }),
  maxMarks: integer('max_marks'),
  timeSpent: integer('time_spent'), // Time spent on this question in seconds
  metadata: jsonb('metadata'), // Additional answer data
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  unique_submission_question: unique().on(table.submissionId, table.questionId),
}));

// Results table - Final exam results and analytics
export const examResults = pgTable('exam_results', {
  id: serial('id').primaryKey(),
  examId: integer('exam_id').notNull().references(() => exams.id, { onDelete: 'cascade' }),
  studentId: integer('student_id').notNull(),
  submissionId: integer('submission_id').notNull().references(() => examSubmissions.id, { onDelete: 'cascade' }),
  totalScore: decimal('total_score', { precision: 5, scale: 2 }).notNull(),
  maxScore: integer('max_score').notNull(),
  percentage: decimal('percentage', { precision: 5, scale: 2 }).notNull(),
  grade: varchar('grade', { length: 5 }), // A+, A, B+, B, C+, C, D, F
  passed: boolean('passed').notNull(),
  rank: integer('rank'), // Rank in the class
  timeSpent: integer('time_spent'), // Total time spent in minutes
  correctAnswers: integer('correct_answers'),
  totalQuestions: integer('total_questions'),
  analytics: jsonb('analytics'), // Detailed performance analytics
  remarks: text('remarks'), // Teacher remarks
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  unique_exam_student: unique().on(table.examId, table.studentId),
}));

// Relations
export const examsRelations = relations(exams, ({ many }) => ({
  questions: many(questions),
  submissions: many(examSubmissions),
  results: many(examResults),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  exam: one(exams, {
    fields: [questions.examId],
    references: [exams.id],
  }),
  options: many(questionOptions),
  answers: many(submissionAnswers),
}));

export const questionOptionsRelations = relations(questionOptions, ({ one }) => ({
  question: one(questions, {
    fields: [questionOptions.questionId],
    references: [questions.id],
  }),
}));

export const examSubmissionsRelations = relations(examSubmissions, ({ one, many }) => ({
  exam: one(exams, {
    fields: [examSubmissions.examId],
    references: [exams.id],
  }),
  answers: many(submissionAnswers),
  result: one(examResults),
}));

export const submissionAnswersRelations = relations(submissionAnswers, ({ one }) => ({
  submission: one(examSubmissions, {
    fields: [submissionAnswers.submissionId],
    references: [examSubmissions.id],
  }),
  question: one(questions, {
    fields: [submissionAnswers.questionId],
    references: [questions.id],
  }),
  selectedOption: one(questionOptions, {
    fields: [submissionAnswers.selectedOptionId],
    references: [questionOptions.id],
  }),
}));

export const examResultsRelations = relations(examResults, ({ one }) => ({
  exam: one(exams, {
    fields: [examResults.examId],
    references: [exams.id],
  }),
  submission: one(examSubmissions, {
    fields: [examResults.submissionId],
    references: [examSubmissions.id],
  }),
}));

// Type exports
export type Exam = typeof exams.$inferSelect;
export type InsertExam = typeof exams.$inferInsert;
export type Question = typeof questions.$inferSelect;
export type InsertQuestion = typeof questions.$inferInsert;
export type QuestionOption = typeof questionOptions.$inferSelect;
export type InsertQuestionOption = typeof questionOptions.$inferInsert;
export type ExamSubmission = typeof examSubmissions.$inferSelect;
export type InsertExamSubmission = typeof examSubmissions.$inferInsert;
export type SubmissionAnswer = typeof submissionAnswers.$inferSelect;
export type InsertSubmissionAnswer = typeof submissionAnswers.$inferInsert;
export type ExamResult = typeof examResults.$inferSelect;
export type InsertExamResult = typeof examResults.$inferInsert;

// Zod schemas for validation
export const insertExamSchema = createInsertSchema(exams, {
  title: z.string().min(1, "Title is required").max(255),
  subject: z.string().min(1, "Subject is required"),
  class: z.string().min(1, "Class is required"),
  teacherId: z.number().positive("Teacher ID must be positive"),
  totalMarks: z.number().min(0, "Total marks must be non-negative"),
  duration: z.number().positive("Duration must be positive"),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertQuestionSchema = createInsertSchema(questions, {
  examId: z.number().positive("Exam ID must be positive"),
  questionText: z.string().min(1, "Question text is required"),
  questionType: z.enum(['multiple_choice', 'true_false', 'short_answer', 'essay']),
  marks: z.number().positive("Marks must be positive"),
  orderIndex: z.number().min(0, "Order index must be non-negative"),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertQuestionOptionSchema = createInsertSchema(questionOptions, {
  questionId: z.number().positive("Question ID must be positive"),
  optionText: z.string().min(1, "Option text is required"),
  orderIndex: z.number().min(0, "Order index must be non-negative"),
}).omit({
  id: true,
  createdAt: true,
});

export const insertExamSubmissionSchema = createInsertSchema(examSubmissions, {
  examId: z.number().positive("Exam ID must be positive"),
  studentId: z.number().positive("Student ID must be positive"),
  attemptNumber: z.number().positive("Attempt number must be positive"),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSubmissionAnswerSchema = createInsertSchema(submissionAnswers, {
  submissionId: z.number().positive("Submission ID must be positive"),
  questionId: z.number().positive("Question ID must be positive"),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertExamResultSchema = createInsertSchema(examResults, {
  examId: z.number().positive("Exam ID must be positive"),
  studentId: z.number().positive("Student ID must be positive"),
  submissionId: z.number().positive("Submission ID must be positive"),
  totalScore: z.number().min(0, "Total score must be non-negative"),
  maxScore: z.number().positive("Max score must be positive"),
  percentage: z.number().min(0).max(100, "Percentage must be between 0 and 100"),
  passed: z.boolean(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Insert type exports
export type InsertExamType = z.infer<typeof insertExamSchema>;
export type InsertQuestionType = z.infer<typeof insertQuestionSchema>;
export type InsertQuestionOptionType = z.infer<typeof insertQuestionOptionSchema>;
export type InsertExamSubmissionType = z.infer<typeof insertExamSubmissionSchema>;
export type InsertSubmissionAnswerType = z.infer<typeof insertSubmissionAnswerSchema>;
export type InsertExamResultType = z.infer<typeof insertExamResultSchema>;