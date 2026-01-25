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

    // 2. Call internal API endpoint
    // Use relative URL for server-side fetch in Next.js, or internal host
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
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
      // Use cache: 'no-store' to prevent caching issues
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Response Error:', response.status, errorText);
      
      // Try to parse as JSON for structured error
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData?.error?.message || errorData?.message || 'Failed to schedule meeting');
      } catch {
        throw new Error(`Failed to schedule meeting (${response.status})`);
      }
    }

    const result = await response.json();
    
    // Handle tRPC response structure
    const meetLink = result?.result?.data?.json?.meetLink || result?.meetLink;
    
    if (!meetLink) {
      console.warn('Meeting scheduled but no Meet link returned');
    }
    
    return {
      success: true,
      meetLink: meetLink || 'Meeting scheduled (no link generated)',
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
