import { relations } from 'drizzle-orm';
import { date, int, mysqlTable, text, timestamp, decimal, varchar } from 'drizzle-orm/mysql-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from "zod";
import { students } from './student';

// Financial Management Tables
export const transactions = mysqlTable('transactions', {
  id: int('id').primaryKey().autoincrement(),
  studentId: int('student_id').references(() => students.id).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  description: text('description'),
  dueDate: date('due_date'),
  paidDate: date('paid_date'),
  status: varchar('status', { length: 20 }).default('pending').notNull(),
  paymentMethod: varchar('payment_method', { length: 50 }),
  referenceNumber: varchar('reference_number', { length: 100 }),
  remarks: text('remarks'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const transactionsRelations = relations(transactions, ({ one }) => ({
  student: one(students, {
    fields: [transactions.studentId],
    references: [students.id],
  }),
}));

// Insert schemas
export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;