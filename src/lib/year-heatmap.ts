import type { CalendarDayInfo } from "@/lib/burmese-calendar"

export function getDayHeatScore(day: CalendarDayInfo): number {
  return day.holidays.length + day.holidays2.length
}

export function getDayHeatBucket(day: CalendarDayInfo): 0 | 1 | 2 | 3 | 4 {
  return getDayHeatScore(day) > 0 ? 4 : 0
}
