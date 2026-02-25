import type { CalendarDayInfo } from "@/lib/burmese-calendar"
import { cal_pyathada, cal_yatyaza } from "@/lib/burmese-calendar"

export function getDayHeatScore(day: CalendarDayInfo): number {
  let score = 0

  if (day.holidays.length > 0 || day.holidays2.length > 0) score += 5

  if (day.sabbath === 1) score += 2
  else if (day.sabbath === 2) score += 1

  if (day.moonPhase === 1 || day.moonPhase === 3) score += 1

  if (cal_yatyaza(day.myanmar.mm, day.weekday) === 1) score += 1

  const pyathada = cal_pyathada(day.myanmar.mm, day.weekday)
  if (pyathada === 1) score += 2
  else if (pyathada === 2) score += 1

  if (day.astro.length > 0) score += 1

  return score
}

export function getDayHeatBucket(day: CalendarDayInfo): 0 | 1 | 2 | 3 | 4 {
  if (day.holidays.length > 0 || day.holidays2.length > 0) return 4
  const score = getDayHeatScore(day)
  if (score <= 0) return 0
  if (score <= 2) return 1
  if (score <= 4) return 2
  if (score <= 6) return 3
  return 4
}
