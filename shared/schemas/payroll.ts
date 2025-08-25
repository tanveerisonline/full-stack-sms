import { pgTable, serial, varchar, decimal, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { teachers } from "./teacher";

export const payroll = pgTable("payroll", {
  id: serial("id").primaryKey(),
  teacherId: integer("teacher_id").notNull().references(() => teachers.id),
  month: varchar("month", { length: 20 }).notNull(),
  year: varchar("year", { length: 4 }).notNull(),
  basicSalary: decimal("basic_salary", { precision: 10, scale: 2 }).notNull(),
  allowances: decimal("allowances", { precision: 10, scale: 2 }).default("0"),
  deductions: decimal("deductions", { precision: 10, scale: 2 }).default("0"),
  overtime: decimal("overtime", { precision: 10, scale: 2 }).default("0"),
  bonus: decimal("bonus", { precision: 10, scale: 2 }).default("0"),
  grossSalary: decimal("gross_salary", { precision: 10, scale: 2 }).notNull(),
  netSalary: decimal("net_salary", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, approved, paid
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
import { relations } from "drizzle-orm";

export const payrollRelations = relations(payroll, ({ one }) => ({
  teacher: one(teachers, {
    fields: [payroll.teacherId],
    references: [teachers.id],
  }),
}));

// Zod schemas for validation
export const insertPayrollSchema = createInsertSchema(payroll, {
  basicSalary: z.coerce.string().min(1, "Basic salary is required"),
  allowances: z.coerce.string().optional().default("0"),
  deductions: z.coerce.string().optional().default("0"),
  overtime: z.coerce.string().optional().default("0"),
  bonus: z.coerce.string().optional().default("0"),
  grossSalary: z.coerce.string().min(1, "Gross salary is required"),
  netSalary: z.coerce.string().min(1, "Net salary is required"),
  month: z.string().min(1, "Month is required"),
  year: z.string().min(4, "Year must be 4 digits"),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const selectPayrollSchema = createInsertSchema(payroll);

// Types
export type Payroll = typeof payroll.$inferSelect;
export type InsertPayroll = typeof payroll.$inferInsert;