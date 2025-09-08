import { relations } from 'drizzle-orm';
import { date, int, mysqlTable, text, timestamp, boolean, varchar, decimal } from 'drizzle-orm/mysql-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from "zod";
import { students } from './student';
import { teachers } from './teacher';

// Library Management Tables
export const books = mysqlTable('books', {
  id: int('id').primaryKey().autoincrement(),
  title: varchar('title', { length: 200 }).notNull(),
  author: varchar('author', { length: 200 }).notNull(),
  isbn: varchar('isbn', { length: 50 }).unique(),
  category: varchar('category', { length: 100 }),
  publisher: varchar('publisher', { length: 100 }),
  publicationYear: int('publication_year'),
  quantity: int('quantity').default(1).notNull(),
  available: int('available').default(1).notNull(),
  location: varchar('location', { length: 100 }),
  description: text('description'),
  status: varchar('status', { length: 20 }).default('available').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const bookIssues = mysqlTable('book_issues', {
  id: int('id').primaryKey().autoincrement(),
  bookId: int('book_id').references(() => books.id).notNull(),
  studentId: int('student_id').references(() => students.id).notNull(),
  issueDate: date('issue_date').notNull(),
  dueDate: date('due_date').notNull(),
  returnDate: date('return_date'),
  status: varchar('status', { length: 20 }).default('issued').notNull(),
  fine: decimal('fine', { precision: 8, scale: 2 }).default('0'),
  remarks: text('remarks'),
  issuedBy: int('issued_by').references(() => teachers.id),
  returnedBy: int('returned_by').references(() => teachers.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
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

// Insert schemas
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

// Types
export type Book = typeof books.$inferSelect;
export type InsertBook = z.infer<typeof insertBookSchema>;
export type BookIssue = typeof bookIssues.$inferSelect;
export type InsertBookIssue = z.infer<typeof insertBookIssueSchema>;