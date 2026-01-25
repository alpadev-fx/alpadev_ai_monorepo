import {
  eachDayOfInterval,
  endOfDay,
  format,
  formatDistanceToNowStrict,
  startOfDay,
  subDays,
} from "date-fns"

export type DateRange = {
  from: Date | undefined
  to?: Date | undefined
}

export function formatDateToMonthDayYear(date: Date) {
  return format(date, "MMM do, yyyy")
}

export function convertDateToFullYear(date: Date) {
  return format(date, "yyyy-MM-dd")
}

export function timeFromNow(date: Date) {
  return formatDistanceToNowStrict(date, { addSuffix: true })
}

export function subtractDays(amountDaysToSubtract: number) {
  return subDays(new Date(), amountDaysToSubtract)
}

export function getAllDaysBetweenTwoDates(fromDate: Date, toDate: Date) {
  return eachDayOfInterval({
    start: startOfDay(fromDate),
    end: endOfDay(toDate),
  })
}

/**
 * Converts a date into a short date and time string format.
 *
 * @param {Date|string} dateValue The date or date string to format.
 * @returns {string} The formatted date and time string in a short format (e.g., "3/9/2023 8:00:00 PM").
 */
export const toShortDateTime = (dateValue: Date | string, locale = "en") => {
  const date = new Date(dateValue)

  const formattedDate = date.toLocaleDateString(locale, {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  })
  const formattedTime = date.toLocaleTimeString(locale, {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "UTC",
    hour12: true,
  })

  return `${formattedDate} ${formattedTime}`
}

/**
 * Converts a date into a short date string format.
 *
 * @param {Date|string} date The date or date string to format.
 * @returns {string} The formatted date string in the short format (e.g., "Mar 9, 2023").
 */
export const toShortDate = (date: Date | string, locale = "en") => {
  return new Date(date).toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  })
}

/**
 * Converts a date into a long date string format.
 *
 * @param {i18n} i18n the localization instance from the app.
 * @param {Date|string} date The date or date string to format.
 * @returns {string} The formatted date string in the long format (e.g., "Thursday, Mar 9, 2023").
 */
export const toLongDate = (dateValue: Date | string, locale = "en") => {
  const date = new Date(dateValue)
  // return a dash if the date is invalid
  if (isNaN(date.getTime())) {
    return "-"
  }

  return date.toLocaleDateString(locale, {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  })
}

/**
 * Converts a date into a numeric date string format.
 *
 * @param {i18n} i18n the localization instance from the app.
 * @param {Date|string} date The date or date string to format.
 * @returns {string} The formatted date string in a numeric format (e.g., "3/9/2023").
 */
export const toNumericDate = (dateValue: Date | string, locale = "en") => {
  const date = new Date(dateValue)
  // return a dash if the date is invalid
  if (isNaN(date.getTime())) {
    return "-"
  }

  return date.toLocaleDateString(locale, {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  })
}

/**
 * Sorts an array of data objects by date.
 *
 * @template T - The type of the data objects.
 * @param {T[]} data - The array of data objects to be sorted.
 * @param {'ascendent' | 'descendent'} [order='ascendent'] - The order in which to sort the data objects. Defaults to 'ascendent'.
 * @param {string} [propertyName] - The name of the property to use as the date value. If not provided, will try 'timestamp' or 'date'.
 * @returns {T[]} - The sorted array of data objects.
 */
export const sortDataByDate = <T extends Record<string, string | number>>(
  data: T[],
  order: "ascendent" | "descendent" = "ascendent",
  propertyName?: string
): T[] => {
  const direction = order === "ascendent" ? 1 : -1

  return data.sort((a, b) => {
    const dateValueA = propertyName
      ? a[propertyName]
      : a.timestamp || a.date || 0
    const dateValueB = propertyName
      ? b[propertyName]
      : b.timestamp || b.date || 0

    const dateA = new Date(dateValueA)
    const dateB = new Date(dateValueB)

    if (dateA < dateB) return -1 * direction
    if (dateA > dateB) return 1 * direction
    return 0
  })
}
