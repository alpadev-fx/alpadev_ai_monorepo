import { z } from 'zod';

export const ScheduleMeetingSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  notes: z.string().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  timeZone: z.string(),
});

export type ScheduleMeetingInput = z.infer<typeof ScheduleMeetingSchema>;
