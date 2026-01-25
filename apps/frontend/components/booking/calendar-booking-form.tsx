'use client';

import React, { useState } from 'react';
import type { DateValue, SharedSelection } from '@heroui/react';
import type { CalendarBookingStepType, TimeSlot } from './calendar-booking-types';
import CalendarBookingDetails from './booking-details';
import { DurationEnum, durations } from './calendar';
import BookingForm from './booking-form';

interface CalendarBookingFormProps {
  setCalendarBookingStep: (step: CalendarBookingStepType) => void;
  selectedTimeSlotRange?: TimeSlot[];
  selectedDate?: DateValue;
  onBookingSuccess: (details: any) => void;
}

export default function CalendarBookingForm({
  setCalendarBookingStep,
  selectedTimeSlotRange,
  selectedDate,
  onBookingSuccess,
}: CalendarBookingFormProps) {
  const [selectedTimeZone, setSelectedTimeZone] = useState<string>(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const [selectedDuration, setSelectedDuration] = useState<DurationEnum>(
    DurationEnum.FifteenMinutes
  );

  const onTimeZoneChange = (keys: SharedSelection) => {
    const newTimeZone = Array.from(keys)[0];
    if (newTimeZone) {
      setSelectedTimeZone(newTimeZone.toString());
    }
  };

  const onDurationChange = (selectedKey: React.Key) => {
    const durationIndex = durations.findIndex((d) => d.key === selectedKey);
    setSelectedDuration(durations[durationIndex].key);
  };

  return (
    <div className="rounded-large bg-default-50 shadow-small flex w-[393px] flex-col items-center gap-5 md:w-fit md:flex-row md:items-start md:px-6">
      <CalendarBookingDetails
        className="md:w-[220px] md:px-4 md:pt-8"
        selectedDate={selectedDate}
        selectedDuration={selectedDuration}
        selectedTimeSlotRange={selectedTimeSlotRange}
        selectedTimeZone={selectedTimeZone}
        onDurationChange={onDurationChange}
        onTimeZoneChange={onTimeZoneChange}
      />
      <BookingForm 
        setCalendarBookingStep={setCalendarBookingStep} 
        onSuccess={onBookingSuccess}
        selectedDate={selectedDate}
        selectedTimeSlotRange={selectedTimeSlotRange}
        selectedTimeZone={selectedTimeZone}
      />
    </div>
  );
}
