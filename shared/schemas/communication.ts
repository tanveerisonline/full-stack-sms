import { relations } from 'drizzle-orm';
import { date, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from "zod";
import { users } from './user';

// Communication Management Tables
export const announcements = pgTable('announcements', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  type: text('type').notNull(),
  targetAudience: text('target_audience').notNull(),
  grade: text('grade'),
  section: text('section'),
  publishDate: date('publish_date').notNull(),
  expiryDate: date('expiry_date'),
  priority: text('priority').default('normal').notNull(),
  status: text('status').default('active').notNull(),
  createdBy: integer('created_by').references(() => users.id),
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