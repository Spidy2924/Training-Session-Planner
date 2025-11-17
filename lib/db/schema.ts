import { pgTable, serial, varchar, text, timestamp, integer, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const roleEnum = pgEnum('role', ['admin', 'platoon_scoped']);

// Users table for authentication
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  role: roleEnum('role').notNull().default('platoon_scoped'),
  platoonId: integer('platoon_id'), // For platoon_scoped users
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Course table
export const courses = pgTable('courses', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  title: varchar('title', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Subject table
export const subjects = pgTable('subjects', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  title: varchar('title', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Instructor table
export const instructors = pgTable('instructors', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Platoon table
export const platoons = pgTable('platoons', {
  id: serial('id').primaryKey(),
  key: varchar('key', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Session table
export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),
  courseId: integer('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  subjectId: integer('subject_id').notNull().references(() => subjects.id, { onDelete: 'cascade' }),
  platoonId: integer('platoon_id').notNull().references(() => platoons.id, { onDelete: 'cascade' }),
  instructorId: integer('instructor_id').notNull().references(() => instructors.id, { onDelete: 'cascade' }),
  plannedAt: timestamp('planned_at').notNull(),
  durationMin: integer('duration_min').notNull(),
  venue: varchar('venue', { length: 255 }).notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const sessionsRelations = relations(sessions, ({ one }) => ({
  course: one(courses, {
    fields: [sessions.courseId],
    references: [courses.id],
  }),
  subject: one(subjects, {
    fields: [sessions.subjectId],
    references: [subjects.id],
  }),
  platoon: one(platoons, {
    fields: [sessions.platoonId],
    references: [platoons.id],
  }),
  instructor: one(instructors, {
    fields: [sessions.instructorId],
    references: [instructors.id],
  }),
}));

export const usersRelations = relations(users, ({ one }) => ({
  platoon: one(platoons, {
    fields: [users.platoonId],
    references: [platoons.id],
  }),
}));

