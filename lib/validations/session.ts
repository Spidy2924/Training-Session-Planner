import { z } from 'zod';

export const createSessionSchema = z.object({
  courseId: z.number().int().positive(),
  subjectId: z.number().int().positive(),
  platoonId: z.number().int().positive(),
  instructorId: z.number().int().positive(),
  plannedAt: z.string().datetime().or(z.date()),
  durationMin: z.number().int().positive(),
  venue: z.string().min(1).max(255),
  notes: z.string().optional(),
});

export const updateSessionSchema = createSessionSchema.partial();

export const sessionFilterSchema = z.object({
  courseId: z.string().optional(),
  platoonId: z.string().optional(),
  instructorId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;
export type SessionFilterInput = z.infer<typeof sessionFilterSchema>;

