// Re-export all schemas, types, and relations
export * from './user';
export * from './student';
export * from './teacher';
export * from './academic';
export * from './attendance';
export * from './financial';
export * from './library';
export * from './communication';
export * from './admin';
export * from './payroll';
export * from './examination';

// Import for cross-schema relations
import { relations } from 'drizzle-orm';
import { students } from './student';
import { teachers } from './teacher';
import { users } from './user';
import { announcements } from './communication';
import { grades, assignments, classes, timetable } from './academic';
import { attendance } from './attendance';
import { transactions } from './financial';
import { books, bookIssues } from './library';
import { exams, questions, examSubmissions, examResults } from './examination';

// Cross-schema relations that couldn't be defined in individual files

// Update users relations to include announcements
export const usersRelationsExtended = relations(users, ({ many }) => ({
  announcements: many(announcements),
}));

// Update students relations with all references
export const studentsRelationsExtended = relations(students, ({ many }) => ({
  grades: many(grades),
  attendance: many(attendance),
  bookIssues: many(bookIssues),
  transactions: many(transactions),
}));

// Update teachers relations with all references
export const teachersRelationsExtended = relations(teachers, ({ many }) => ({
  classes: many(classes),
  assignments: many(assignments),
  grades: many(grades),
  attendance: many(attendance),
  bookIssues: many(bookIssues),
  timetable: many(timetable),
}));

// All tables export for easy access
export const allTables = {
  users,
  students,
  teachers,
  classes,
  timetable,
  assignments,
  grades,
  attendance,
  transactions,
  books,
  bookIssues,
  announcements,
  exams,
  questions,
  examSubmissions,
  examResults,
} as const;

// Schema validation helpers
export const schemas = {
  // User schemas
  insertUser: () => import('./user').then(m => m.insertUserSchema),
  insertRole: () => import('./user').then(m => m.insertRoleSchema),
  insertUserSession: () => import('./user').then(m => m.insertUserSessionSchema),
  
  // Student schemas
  insertStudent: () => import('./student').then(m => m.insertStudentSchema),
  
  // Teacher schemas
  insertTeacher: () => import('./teacher').then(m => m.insertTeacherSchema),
  
  // Academic schemas
  insertClass: () => import('./academic').then(m => m.insertClassSchema),
  insertTimetable: () => import('./academic').then(m => m.insertTimetableSchema),
  insertAssignment: () => import('./academic').then(m => m.insertAssignmentSchema),
  insertGrade: () => import('./academic').then(m => m.insertGradeSchema),
  
  // Other schemas
  insertAttendance: () => import('./attendance').then(m => m.insertAttendanceSchema),
  insertTransaction: () => import('./financial').then(m => m.insertTransactionSchema),
  insertBook: () => import('./library').then(m => m.insertBookSchema),
  insertBookIssue: () => import('./library').then(m => m.insertBookIssueSchema),
  insertAnnouncement: () => import('./communication').then(m => m.insertAnnouncementSchema),
  insertAuditLog: () => import('./admin').then(m => m.insertAuditLogSchema),
  insertSystemSetting: () => import('./admin').then(m => m.insertSystemSettingSchema),
  
  // Examination schemas
  insertExam: () => import('./examination').then(m => m.insertExamSchema),
  insertQuestion: () => import('./examination').then(m => m.insertQuestionSchema),
  insertQuestionOption: () => import('./examination').then(m => m.insertQuestionOptionSchema),
  insertExamSubmission: () => import('./examination').then(m => m.insertExamSubmissionSchema),
  insertSubmissionAnswer: () => import('./examination').then(m => m.insertSubmissionAnswerSchema),
  insertExamResult: () => import('./examination').then(m => m.insertExamResultSchema),
} as const;