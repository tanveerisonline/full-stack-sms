import { relations } from 'drizzle-orm';
import { date, integer, pgTable, serial, text, timestamp, numeric } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from "zod";
import { students } from './student';
import { teachers } from './teacher';

// Library Management Tables
export const books = pgTable('books', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  author: text('author').notNull(),
  isbn: text('isbn').unique(),
  category: text('category'),
  publisher: text('publisher'),
  publicationYear: integer('publication_year'),
  quantity: integer('quantity').default(1).notNull(),
  available: integer('available').default(1).notNull(),
  location: text('location'),
  description: text('description'),
  status: text('status').default('available').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const bookIssues = pgTable('book_issues', {
  id: serial('id').primaryKey(),
  bookId: integer('book_id').references(() => books.id).notNull(),
  studentId: integer('student_id').references(() => students.id).notNull(),
  issueDate: date('issue_date').notNull(),
  dueDate: date('due_date').notNull(),
  returnDate: date('return_date'),
  status: text('status').default('issued').notNull(),
  fine: numeric('fine', { precision: 8, scale: 2 }).default('0'),
  remarks: text('remarks'),
  issuedBy: integer('issued_by').references(() => teachers.id),
  returnedBy: integer('returned_by').references(() => teachers.id),
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