'use client';

import { useCallback } from 'react';
import { Icon } from '@iconify/react';
import { Spacer, Chip, Link, Button } from '@heroui/react';
import type { CalendarBookingStepType } from './calendar-booking-types';

interface CalendarBookingConfirmationProps {
  setCalendarBookingStep?: (step: CalendarBookingStepType) => void;
  bookingDetails?: {
      link?: string | null;
      startTime?: string;
      endTime?: string;
      email?: string;
      name?: string;
  };
}

export default function CalendarBookingConfirmation({
  setCalendarBookingStep,
  bookingDetails,
}: CalendarBookingConfirmationProps) {
  const handleCancelOrReschedule = useCallback(() => {
    if (setCalendarBookingStep) setCalendarBookingStep('booking_initial');
  }, [setCalendarBookingStep]);

  return (
    <div className="rounded-large bg-default-50 shadow-small flex w-[375px] flex-col items-center gap-5 py-8">
      <div className="flex w-full flex-col items-center px-8">
        <div className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-3">
             <Icon icon="solar:check-circle-bold-duotone" width={56} className="text-cyan-400" />
        </div>
        <p className="text-default-foreground mb-2 text-base font-medium">
          This meeting is scheduled
        </p>
        <p className="text-tiny text-default-500 text-center">
          We sent an email with a calendar invitation with the details to everyone.
        </p>
      </div>
      <Spacer className="bg-default-100 w-full" x={0} y={0} />
      <div className="flex w-full flex-col items-center gap-4 px-8">
        <div className="flex w-full flex-col gap-1">
          <p className="text-small text-default-foreground font-medium">When</p>
          <p className="text-tiny text-default-500">
             {bookingDetails?.startTime ? new Date(bookingDetails.startTime).toLocaleString() : 'Date/Time'}
          </p>
        </div>
         <div className="flex w-full flex-col gap-1">
          <p className="text-small text-default-foreground font-medium">Where</p>
          <Link className="flex w-fit items-center gap-1" href={bookingDetails?.link || '#'} target="_blank" size="sm">
            <p className="text-tiny text-default-500">Google Meet</p>
            <Icon className="text-default-500" icon="mdi:open-in-new" width={12} />
          </Link>
        </div>
      </div>
       <Spacer className="bg-default-100 w-full" x={0} y={0} />
      <div className="flex flex-col items-center gap-2">
        <Button onPress={handleCancelOrReschedule} size="sm" variant="flat">
            Book Another
        </Button>
      </div>
    </div>
  );
}
