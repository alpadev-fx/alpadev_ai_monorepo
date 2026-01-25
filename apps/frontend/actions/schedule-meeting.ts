'use server';

import { z } from 'zod';

// Input Validation Schema
const ScheduleMeetingSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  notes: z.string().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  timeZone: z.string(),
});

export type ScheduleMeetingInput = z.infer<typeof ScheduleMeetingSchema>;

interface ScheduleMeetingResult {
  success: boolean;
  meetLink?: string;
  error?: string;
}

export async function scheduleMeeting(data: unknown): Promise<ScheduleMeetingResult> {
  try {
    // 1. Validate Input
    const parsed = ScheduleMeetingSchema.parse(data);

    // 2. Call internal API endpoint (tRPC is exposed via /api/trpc on the server)
    // For server actions, we can make a direct fetch to the tRPC endpoint
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/api/trpc/booking.scheduleMeeting`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        json: {
          name: parsed.name,
          email: parsed.email,
          notes: parsed.notes || '',
          startDate: parsed.startDate,
          endDate: parsed.endDate,
          timeZone: parsed.timeZone,
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.error?.message || 'Failed to schedule meeting');
    }

    const result = await response.json();
    
    return {
      success: true,
      meetLink: result?.result?.data?.json?.meetLink,
    };

  } catch (error: unknown) {
    console.error('Server Action Error:', error);
    
    if (error instanceof z.ZodError) {
       return { success: false, error: 'Invalid data provided: ' + error.errors.map(e => e.message).join(', ') };
    }

    const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { success: false, error: message };
  }
}
