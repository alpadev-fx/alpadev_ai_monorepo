"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { motion, AnimatePresence } from "framer-motion"
import {
  CalendarDaysIcon,
  ClockIcon,
  GlobeAltIcon,
  CheckCircleIcon,
  LinkIcon,
  DocumentTextIcon,
  UserIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline"
import { type ScheduleMeetingInput } from "@package/validations"
import { api } from "@/lib/trpc/react"

interface BookingResult {
  meetLink: string
  bookingId: string
}

const TIME_OPTIONS = Array.from({ length: 28 }, (_, i) => {
  const hour = Math.floor(i / 2) + 7
  const minute = i % 2 === 0 ? "00" : "30"
  const h24 = `${String(hour).padStart(2, "0")}:${minute}`
  const period = hour >= 12 ? "PM" : "AM"
  const h12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  return { value: h24, label: `${h12}:${minute} ${period}` }
})

function getTodayString(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, "0")
  const d = String(now.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function buildISODateTime(date: string, time: string, timeZone: string): string {
  const dt = new Date(`${date}T${time}:00`)
  if (isNaN(dt.getTime())) return ""
  // Create a proper ISO string that respects the conceptual timezone
  // The API expects an ISO datetime string
  return dt.toISOString()
}

export default function CalendarBookingsPage() {
  const [bookingResult, setBookingResult] = useState<BookingResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ScheduleMeetingInput & { date: string; startTime: string; endTime: string }>({
    defaultValues: {
      name: "",
      email: "",
      notes: "",
      date: getTodayString(),
      startTime: "09:00",
      endTime: "09:30",
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      startDate: "",
      endDate: "",
    },
  })

  const watchedDate = watch("date")
  const watchedStartTime = watch("startTime")
  const watchedEndTime = watch("endTime")

  const scheduleMutation = api.booking.scheduleMeeting.useMutation({
    onSuccess: (data) => {
      if (data.success && data.meetLink) {
        setBookingResult({ meetLink: data.meetLink, bookingId: data.bookingId })
        setError(null)
      } else {
        setError("Failed to schedule meeting. Please try again.")
      }
    },
    onError: (err) => {
      setError(err.message || "An unexpected error occurred.")
    },
  })

  const onSubmit = (data: ScheduleMeetingInput & { date: string; startTime: string; endTime: string }) => {
    setError(null)

    const startDate = buildISODateTime(data.date, data.startTime, data.timeZone)
    const endDate = buildISODateTime(data.date, data.endTime, data.timeZone)

    if (!startDate || !endDate) {
      setError("Invalid date or time selected.")
      return
    }

    if (new Date(startDate) >= new Date(endDate)) {
      setError("End time must be after start time.")
      return
    }

    scheduleMutation.mutate({
      name: data.name,
      email: data.email,
      notes: data.notes || undefined,
      startDate,
      endDate,
      timeZone: data.timeZone,
    })
  }

  const handleNewBooking = () => {
    setBookingResult(null)
    setError(null)
    reset()
  }

  const formattedDate = watchedDate
    ? new Date(watchedDate + "T00:00:00").toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : ""

  const startTimeLabel = TIME_OPTIONS.find((t) => t.value === watchedStartTime)?.label ?? watchedStartTime
  const endTimeLabel = TIME_OPTIONS.find((t) => t.value === watchedEndTime)?.label ?? watchedEndTime
  const isPending = scheduleMutation.isPending

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h1 className="text-2xl font-bold tracking-tight text-white">Calendar & Bookings</h1>
        <p className="mt-1 text-sm text-zinc-400">Schedule meetings and manage your calendar</p>
      </motion.div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Booking form (60%) */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3"
        >
          <div className="rounded-2xl bg-[#161616] border border-white/5 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f751a1]/10">
                <CalendarDaysIcon className="h-5 w-5 text-[#f751a1]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Schedule a Meeting</h2>
                <p className="text-xs text-zinc-500">Fill in the details to create a Google Meet event</p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-sm font-medium text-zinc-300">
                  <UserIcon className="h-4 w-4 text-zinc-500" />
                  Name
                </label>
                <input
                  {...register("name")}
                  type="text"
                  placeholder="John Doe"
                  disabled={isPending}
                  className="w-full rounded-xl bg-[#131313] border border-white/5 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-[#f751a1]/50 focus:outline-none focus:ring-1 focus:ring-[#f751a1]/30 disabled:opacity-50 transition-colors"
                />
                {errors.name && (
                  <p className="text-xs text-red-400">{errors.name.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-sm font-medium text-zinc-300">
                  <EnvelopeIcon className="h-4 w-4 text-zinc-500" />
                  Email
                </label>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="john@example.com"
                  disabled={isPending}
                  className="w-full rounded-xl bg-[#131313] border border-white/5 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-[#f751a1]/50 focus:outline-none focus:ring-1 focus:ring-[#f751a1]/30 disabled:opacity-50 transition-colors"
                />
                {errors.email && (
                  <p className="text-xs text-red-400">{errors.email.message}</p>
                )}
              </div>

              {/* Date */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-sm font-medium text-zinc-300">
                  <CalendarDaysIcon className="h-4 w-4 text-zinc-500" />
                  Date
                </label>
                <input
                  {...register("date")}
                  type="date"
                  min={getTodayString()}
                  disabled={isPending}
                  className="w-full rounded-xl bg-[#131313] border border-white/5 px-4 py-2.5 text-sm text-white focus:border-[#f751a1]/50 focus:outline-none focus:ring-1 focus:ring-[#f751a1]/30 disabled:opacity-50 transition-colors [color-scheme:dark]"
                />
              </div>

              {/* Time row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-sm font-medium text-zinc-300">
                    <ClockIcon className="h-4 w-4 text-zinc-500" />
                    Start Time
                  </label>
                  <select
                    {...register("startTime")}
                    disabled={isPending}
                    className="w-full rounded-xl bg-[#131313] border border-white/5 px-4 py-2.5 text-sm text-white focus:border-[#f751a1]/50 focus:outline-none focus:ring-1 focus:ring-[#f751a1]/30 disabled:opacity-50 transition-colors [color-scheme:dark]"
                  >
                    {TIME_OPTIONS.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-sm font-medium text-zinc-300">
                    <ClockIcon className="h-4 w-4 text-zinc-500" />
                    End Time
                  </label>
                  <select
                    {...register("endTime")}
                    disabled={isPending}
                    className="w-full rounded-xl bg-[#131313] border border-white/5 px-4 py-2.5 text-sm text-white focus:border-[#f751a1]/50 focus:outline-none focus:ring-1 focus:ring-[#f751a1]/30 disabled:opacity-50 transition-colors [color-scheme:dark]"
                  >
                    {TIME_OPTIONS.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Timezone */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-sm font-medium text-zinc-300">
                  <GlobeAltIcon className="h-4 w-4 text-zinc-500" />
                  Timezone
                </label>
                <input
                  {...register("timeZone")}
                  type="text"
                  disabled={isPending}
                  className="w-full rounded-xl bg-[#131313] border border-white/5 px-4 py-2.5 text-sm text-zinc-400 focus:border-[#f751a1]/50 focus:outline-none focus:ring-1 focus:ring-[#f751a1]/30 disabled:opacity-50 transition-colors"
                  readOnly
                />
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-sm font-medium text-zinc-300">
                  <DocumentTextIcon className="h-4 w-4 text-zinc-500" />
                  Notes
                  <span className="text-zinc-600 font-normal">(optional)</span>
                </label>
                <textarea
                  {...register("notes")}
                  rows={3}
                  placeholder="Any additional details for the meeting..."
                  disabled={isPending}
                  className="w-full rounded-xl bg-[#131313] border border-white/5 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-[#f751a1]/50 focus:outline-none focus:ring-1 focus:ring-[#f751a1]/30 disabled:opacity-50 transition-colors resize-none"
                />
              </div>

              {/* Error message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-300">
                      {error}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-xl bg-[#f751a1] px-6 py-3 text-sm font-semibold text-white hover:bg-[#ec4899] focus:outline-none focus:ring-2 focus:ring-[#f751a1]/50 focus:ring-offset-2 focus:ring-offset-[#161616] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Scheduling...
                  </span>
                ) : (
                  "Schedule Meeting"
                )}
              </button>
            </form>
          </div>
        </motion.div>

        {/* Right: Success panel / Placeholder (40%) */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <div className="rounded-2xl bg-[#161616] border border-white/5 p-6 sticky top-6">
            <AnimatePresence mode="wait">
              {bookingResult ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Success header */}
                  <div className="flex flex-col items-center text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 mb-4">
                      <CheckCircleIcon className="h-8 w-8 text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Meeting Scheduled!</h3>
                    <p className="mt-1 text-sm text-zinc-400">Your meeting has been created successfully</p>
                  </div>

                  {/* Booking details */}
                  <div className="space-y-3">
                    <div className="rounded-xl bg-[#131313] border border-white/5 p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <CalendarDaysIcon className="h-5 w-5 text-[#d0bcff] mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs text-zinc-500">Date</p>
                          <p className="text-sm text-white">{formattedDate}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <ClockIcon className="h-5 w-5 text-[#d0bcff] mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs text-zinc-500">Time</p>
                          <p className="text-sm text-white">{startTimeLabel} - {endTimeLabel}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <DocumentTextIcon className="h-5 w-5 text-[#d0bcff] mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs text-zinc-500">Booking ID</p>
                          <p className="text-sm font-mono text-zinc-300">{bookingResult.bookingId}</p>
                        </div>
                      </div>
                    </div>

                    {/* Meet link */}
                    <a
                      href={bookingResult.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 px-4 py-3 text-sm text-[#d0bcff] hover:bg-[#8B5CF6]/15 transition-colors group"
                    >
                      <LinkIcon className="h-5 w-5 shrink-0 group-hover:text-[#8B5CF6] transition-colors" />
                      <div className="min-w-0">
                        <p className="text-xs text-zinc-500">Google Meet Link</p>
                        <p className="truncate text-[#d0bcff]">{bookingResult.meetLink}</p>
                      </div>
                    </a>
                  </div>

                  {/* New booking button */}
                  <button
                    onClick={handleNewBooking}
                    className="w-full rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:bg-[#1a1a1a] hover:text-white transition-colors"
                  >
                    Schedule Another Meeting
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1a1a1a] mb-4">
                    <CalendarDaysIcon className="h-8 w-8 text-zinc-600" />
                  </div>
                  <h3 className="text-base font-medium text-zinc-400">No Meeting Scheduled</h3>
                  <p className="mt-1 max-w-[220px] text-sm text-zinc-600">
                    Select a date and time to schedule a meeting
                  </p>

                  {/* Preview of selected date/time */}
                  {watchedDate && watchedStartTime && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 w-full rounded-xl bg-[#131313] border border-white/5 p-4 text-left"
                    >
                      <p className="text-xs font-medium text-zinc-500 mb-2">Preview</p>
                      <p className="text-sm text-white">{formattedDate}</p>
                      <p className="text-sm text-zinc-400 mt-1">
                        {startTimeLabel} - {endTimeLabel}
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
