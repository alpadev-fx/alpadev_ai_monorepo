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
    <div className="flex w-[375px] flex-col items-center gap-5 py-8">
      <div className="flex w-full flex-col items-center px-8">
        <div className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-3">
             <Icon icon="solar:check-circle-bold-duotone" width={56} className="text-cyan-400" />
        </div>
        <p className="text-white mb-2 text-base font-medium">
          This meeting is scheduled
        </p>
        <p className="text-tiny text-white/50 text-center">
          We sent an email with a calendar invitation with the details to everyone.
        </p>
      </div>
      <Spacer className="bg-white/10 w-full" x={0} y={0} />
      <div className="flex w-full flex-col items-center gap-4 px-8">
        <div className="flex w-full flex-col gap-1">
          <p className="text-small text-white/70 font-medium">When</p>
          <p className="text-tiny text-white">
             {bookingDetails?.startTime ? new Date(bookingDetails.startTime).toLocaleString() : 'Date/Time'}
          </p>
        </div>
         <div className="flex w-full flex-col gap-1">
          <p className="text-small text-white/70 font-medium">Where</p>
          <Link className="flex w-fit items-center gap-1" href={bookingDetails?.link || '#'} target="_blank" size="sm">
            <p className="text-tiny text-white">Google Meet</p>
            <Icon className="text-white/50" icon="mdi:open-in-new" width={12} />
          </Link>
        </div>
      </div>
       <Spacer className="bg-white/10 w-full" x={0} y={0} />
      <div className="flex flex-col items-center gap-2">
        <Button onPress={handleCancelOrReschedule} size="sm" variant="flat" className="bg-white/10 text-white hover:bg-white/20">
            Book Another
        </Button>
      </div>
    </div>
  );
}
