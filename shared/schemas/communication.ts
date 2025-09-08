import { relations } from 'drizzle-orm';
import { date, int, mysqlTable, text, timestamp, boolean, varchar } from 'drizzle-orm/mysql-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from "zod";
import { users } from './user';

// Communication Management Tables
export const announcements = mysqlTable('announcements', {
  id: int('id').primaryKey().autoincrement(),
  title: varchar('title', { length: 200 }).notNull(),
  content: text('content').notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  targetAudience: varchar('target_audience', { length: 50 }).notNull(),
  grade: varchar('grade', { length: 20 }),
  section: varchar('section', { length: 20 }),
  publishDate: date('publish_date').notNull(),
  expiryDate: date('expiry_date'),
  priority: varchar('priority', { length: 20 }).default('normal').notNull(),
  status: varchar('status', { length: 20 }).default('active').notNull(),
  createdBy: int('created_by').references(() => users.id),
  attachments: text('attachments'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const announcementsRelations = relations(announcements, ({ one }) => ({
  createdByUser: one(users, {
    fields: [announcements.createdBy],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertAnnouncementSchema = createInsertSchema(announcements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;