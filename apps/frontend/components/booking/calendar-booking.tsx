'use client';

import type { CalendarBookingStepType } from './calendar-booking-types';
import { Calendar, cn, Skeleton, type DateValue, type SharedSelection } from '@heroui/react';
import React, { useEffect, useState } from 'react';
import { getLocalTimeZone, isWeekend, today } from '@internationalized/date';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { XMarkIcon } from '@heroicons/react/24/outline';

import BookingDetails from './booking-details';
import { DurationEnum, durations, type TimeSlot } from './calendar';
import CalendarTimeSelect from './calendar-time-select';
import CalendarBookingForm from './calendar-booking-form';
import CalendarBookingConfirmation from './calendar-booking-confirmation';

const LoadingSkeleton = () => (
  <div
    className={
      'rounded-large bg-default-50 shadow-small flex w-[393px] flex-col items-center gap-5 lg:w-fit lg:flex-row lg:items-start lg:px-6'
    }
  >
    {/* Skeleton content... (simplified for brevity or copy exact if needed) */}
     <div className={'flex w-full flex-col p-6 lg:w-[220px] lg:px-4 lg:pt-8'}>
      <Skeleton className={'h-8 w-8 rounded-full'} />
      <Skeleton className="mt-3 h-2.5 w-[60px] rounded-lg" />
      <Skeleton className="mt-[5.5px] h-4 w-[95px] rounded-lg" />
      <Skeleton className="mt-4 h-[10.5px] w-full rounded-lg" />
      <Skeleton className="mt-[4.5px] h-[10.5px] w-[112px] rounded-lg" />
      <Skeleton className="mt-10 h-2.5 w-[40px] rounded-lg" />
      <Skeleton className="mt-[18px] h-2.5 w-[70px] rounded-lg" />
      <Skeleton className="mt-[15px] h-2.5 w-[124px] rounded-lg" />
      <Skeleton className="mt-[29px] h-8 w-[114px] rounded-lg" />
    </div>
    <div className={'w-full px-6 lg:w-[372px] lg:px-0'}>
      <div className={'flex items-center justify-center py-3'}>
        <Skeleton className={'h-[9px] w-[98px] rounded-full'} />
      </div>
      <div className={'grid grid-cols-4 gap-4'}>
        <Skeleton className={'h-2.5 rounded-full'} />
        <Skeleton className={'h-2.5 rounded-full'} />
        <Skeleton className={'h-2.5 rounded-full'} />
        <Skeleton className={'h-2.5 rounded-full'} />
      </div>
      <div className={'mt-8 grid grid-cols-7 gap-5'}>
         {Array.from({ length: 35 }).map((_, i) => (
             <Skeleton key={i} className="size-[29px] rounded-full" />
         ))}
      </div>
    </div>
  </div>
);

export default function CalendarBooking({ onClose }: { onClose?: () => void }) {
  const [isLoading, setIsLoading] = useState(true);
  const [calendarWidth, setCalendarWidth] = useState("390px");
  const [calendarBookingStep, setCalendarBookingStep] =
    useState<CalendarBookingStepType>('booking_initial');
  // ... existing state ...

  // Update width on resize
  useEffect(() => {
    const handleResize = () => {
        setCalendarWidth(window.innerWidth < 1024 ? "372px" : "390px");
    };
    
    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ... rest of state initialization ...
  const [selectedTimeZone, setSelectedTimeZone] = useState<string>(
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  );
  const [selectedDuration, setSelectedDuration] = useState<DurationEnum>(
    DurationEnum.FifteenMinutes,
  );
  const [selectedDate, setSelectedDate] = React.useState<DateValue>(today(getLocalTimeZone()));
  const [selectedTimeSlotRange, setSelectedTimeSlotRange] = useState<TimeSlot[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>('');
  
  // To store success details
  const [bookingSuccessDetails, setBookingSuccessDetails] = useState<any>(null);

  const onTimeZoneChange = (keys: SharedSelection) => {
    const newTimeZone = Array.from(keys)[0];
    if (newTimeZone) {
      setSelectedTimeZone(newTimeZone.toString());
    }
  };

  const onDurationChange = (selectedKey: React.Key) => {
    const durationIndex = durations.findIndex((d) => d.key === selectedKey);
    setSelectedDuration(durations[durationIndex].key);
    setSelectedTime('');
  };

  const onDateChange = (date: DateValue) => {
    setSelectedDate(date);
    // Reset time when date changes
    setSelectedTime('');
  };

  const onTimeChange = (time: string, selectedTimeSlotRange?: TimeSlot[]) => {
    if (selectedTimeSlotRange) setSelectedTimeSlotRange(selectedTimeSlotRange);
    setSelectedTime(time);
  };

  const onConfirm = () => {
    setCalendarBookingStep('booking_form');
  };

  const onBookingSuccess = (details: any) => {
      setBookingSuccessDetails(details);
      setCalendarBookingStep('booking_confirmation');
  };

  const isDateUnavailable = (date: DateValue) => {
    return isWeekend(date, 'en-US');
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      return () => {
        clearTimeout(timer);
      };
    }, 500);
  }, []);

  if (isLoading) {
    return <LoadingSkeleton />;
  }
  
  if (calendarBookingStep === 'booking_form') {
    return (
      <div className="relative flex  w-[80vw] lg:w-fit flex-col items-center justify-center p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
          {onClose && (
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 z-50 p-2 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 18 18"/></svg>
            </button>
          )}
          <CalendarBookingForm
            selectedDate={selectedDate}
            selectedTimeSlotRange={selectedTimeSlotRange}
            setCalendarBookingStep={setCalendarBookingStep}
            onBookingSuccess={onBookingSuccess}
          />
      </div>
    );
  }

  if (calendarBookingStep === 'booking_confirmation') { 
    return (
        <div className="relative flex w-[80vw] lg:w-fit flex-col items-center justify-center p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
            {onClose && (
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 p-2 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 18 18"/></svg>
                </button>
            )}
            <CalendarBookingConfirmation 
                setCalendarBookingStep={setCalendarBookingStep} 
                bookingDetails={bookingSuccessDetails}
            />
        </div>
    );
  }

  return (
    <div className="relative flex w-[90vw] lg:w-fit max-h-[85vh] flex-col items-center gap-5 overflow-y-auto lg:flex-row lg:items-start lg:gap-8 lg:overflow-visible p-6 lg:pr-16 rounded-3xl bg-black/40 backdrop-blur-2xl border border-white/10 shadow-2xl scrollbar-hide">
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>
      
      {onClose && (
        <button 
            onClick={onClose}
            className="sticky top-0 right-0 self-end z-50 p-2 rounded-full text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all active:scale-95 lg:absolute lg:top-4 lg:right-4 shadow-lg backdrop-blur-md"
            aria-label="Close"
        >
             <XMarkIcon className="w-5 h-5" />
        </button>
      )}

      <BookingDetails
        selectedDuration={selectedDuration}
        selectedTimeZone={selectedTimeZone}
        onDurationChange={onDurationChange}
        onTimeZoneChange={onTimeZoneChange}
        selectedDate={selectedDate}
        selectedTimeSlotRange={selectedTimeSlotRange}
      />
      <Calendar
        calendarWidth={calendarWidth}
        className="shadow-none dark:bg-transparent"
        classNames={{
          headerWrapper: 'bg-transparent px-3 pt-1.5 pb-3',
          title: 'text-default-700 text-small font-semibold',
          gridHeader: 'bg-transparent shadow-none',
          gridHeaderCell: 'font-medium text-default-400 text-xs p-0 w-full',
          gridHeaderRow: 'px-3 pb-3',
          gridBodyRow: 'gap-x-1 px-3 mb-1 first:mt-4 last:mb-0',
          gridWrapper: 'pb-3',
          cell: 'p-1.5 w-full',
          
          cellButton:
            'w-full h-9 rounded-medium data-[selected=true]:!bg-gradient-to-r data-[selected=true]:!from-cyan-400 data-[selected=true]:!to-purple-500 data-[selected=true]:!text-white data-[selected=true]:shadow-[0_2px_12px_0] data-[selected=true]:shadow-purple-500/30 text-small font-medium',
        }}
        isDateUnavailable={isDateUnavailable}
        value={selectedDate}
        weekdayStyle="short"
        onChange={onDateChange}
        color="secondary"
      />
      <CalendarTimeSelect
        day={selectedDate.day}
        duration={selectedDuration}
        selectedTime={selectedTime}
        weekday={format(selectedDate.toString(), 'EEE', { locale: enUS })}
        onConfirm={onConfirm}
        onTimeChange={onTimeChange}
      />
    </div>
  );
}
