'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardBody, Input, Button, Textarea } from '@heroui/react';
import { api } from '@/lib/trpc/react';
import { format, addMinutes } from 'date-fns';
import type { DateValue } from '@heroui/react';
import type { CalendarBookingStepType, TimeSlot } from './calendar-booking-types';

interface BookingFormProps {
  setCalendarBookingStep?: (step: CalendarBookingStepType) => void;
  onSuccess?: (details: any) => void;
  selectedDate?: DateValue;
  selectedTimeSlotRange?: TimeSlot[];
  selectedTimeZone?: string;
}

export default function BookingForm({
  setCalendarBookingStep,
  onSuccess,
  selectedDate,
  selectedTimeSlotRange,
  selectedTimeZone,
}: BookingFormProps) {
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    notes: '',
  });

  // tRPC mutation
  const scheduleMeetingMutation = api.booking.scheduleMeeting.useMutation({
    onSuccess: (data) => {
      if (data.success && data.meetLink) {
        if (onSuccess) {
          onSuccess({ meetLink: data.meetLink, ...formData });
        }
      } else {
        setError('Failed to schedule meeting.');
      }
    },
    onError: (err) => {
      setError(err.message || 'An unexpected error occurred.');
    },
  });

  // Calculate start/end from selected time slots
  const { startDate, endDate, displayDateTime } = useMemo(() => {
    if (!selectedDate || !selectedTimeSlotRange || selectedTimeSlotRange.length === 0) {
      return { startDate: null, endDate: null, displayDateTime: 'Not selected' };
    }

    const firstSlot = selectedTimeSlotRange[0];
    const lastSlot = selectedTimeSlotRange[selectedTimeSlotRange.length - 1];

    // Validate time slots exist and have valid value property
    if (!firstSlot?.value || !lastSlot?.value) {
      return { startDate: null, endDate: null, displayDateTime: 'Not selected' };
    }

    try {
      const dateStr = `${selectedDate.year}-${String(selectedDate.month).padStart(2, '0')}-${String(selectedDate.day).padStart(2, '0')}`;
      const start = new Date(`${dateStr}T${firstSlot.value}:00`);
      const end = new Date(`${dateStr}T${lastSlot.value}:00`);
      
      // Validate dates are valid
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return { startDate: null, endDate: null, displayDateTime: 'Invalid time' };
      }
      
      // Add 15 mins to end to account for slot duration
      const adjustedEnd = addMinutes(end, 15);

      const display = format(start, 'EEEE, MMMM d, yyyy') + ' at ' + format(start, 'h:mm a') + ' - ' + format(adjustedEnd, 'h:mm a');

      return {
        startDate: start,
        endDate: adjustedEnd,
        displayDateTime: display,
      };
    } catch {
      return { startDate: null, endDate: null, displayDateTime: 'Invalid time' };
    }
  }, [selectedDate, selectedTimeSlotRange]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!startDate || !endDate) {
      setError("Please select a date and time first");
      return;
    }

    scheduleMeetingMutation.mutate({
      name: formData.name,
      email: formData.email,
      notes: formData.notes,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      timeZone: selectedTimeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const loading = scheduleMeetingMutation.isPending;

  return (
    <Card className="w-[80vw] lg:w-fit max-w-md bg-transparent shadow-none">
      <CardHeader className="flex flex-col gap-1 pb-0">
        <h2 className="text-xl font-bold text-white">Book a Video Call</h2>
      </CardHeader>
      <CardBody className="bg-transparent">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input 
            label="Name" 
            name="name"
            value={formData.name} 
            onChange={handleChange} 
            required 
            isDisabled={loading}
            classNames={{
              inputWrapper: "bg-white/5 border-white/10 hover:bg-white/10",
              label: "text-white/70",
              input: "text-white"
            }}
          />
          <Input 
            label="Email" 
            name="email"
            type="email"
            value={formData.email} 
            onChange={handleChange} 
            required 
            isDisabled={loading}
            classNames={{
              inputWrapper: "bg-white/5 border-white/10 hover:bg-white/10",
              label: "text-white/70",
              input: "text-white"
            }}
          />
          
          {/* Display selected date/time - READ ONLY */}
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <p className="text-xs text-white/50 mb-1">Date & Time</p>
            <p className="text-sm text-white font-medium">{displayDateTime}</p>
          </div>

          <Textarea 
            label="Notes" 
            name="notes"
            value={formData.notes} 
            onChange={handleChange} 
            isDisabled={loading}
            classNames={{
              inputWrapper: "bg-white/5 border-white/10 hover:bg-white/10",
              label: "text-white/70",
              input: "text-white"
            }}
          />

          {error && (
            <div className="p-3 text-sm text-red-300 bg-red-500/20 rounded-lg border border-red-500/30">
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            isLoading={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold"
          >
            {loading ? 'Booking...' : 'Confirm Meeting'}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
