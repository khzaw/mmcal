import type { CalendarDayInfo } from "@/lib/burmese-calendar"
import { cal_pyathada, cal_yatyaza } from "@/lib/burmese-calendar"
import { describe, expect, it } from "vitest"
import { getDayHeatBucket, getDayHeatScore } from "../year-heatmap"

function makeDay(partial?: Partial<CalendarDayInfo>): CalendarDayInfo {
  return {
    jdn: 0,
    gregorian: { year: 2026, month: 2, day: 24 },
    myanmar: { myt: 0, my: 1387, mm: 12, md: 9 },
    moonPhase: 0,
    fortnightDay: 9,
    weekday: 2,
    monthName: "တပေါင်း",
    moonPhaseName: "လဆန်း",
    weekdayName: "အင်္ဂါ",
    holidays: [],
    holidays2: [],
    astro: [],
    sabbath: 0,
    ...partial,
  }
}

function findNeutralMonthWeekday(): { month: number; weekday: number } {
  for (let month = 1; month <= 12; month++) {
    for (let weekday = 0; weekday <= 6; weekday++) {
      if (cal_yatyaza(month, weekday) === 0 && cal_pyathada(month, weekday) === 0) {
        return { month, weekday }
      }
    }
  }
  throw new Error("No neutral month/weekday combination found")
}

describe("year heatmap scoring", () => {
  it("keeps a fully normal day in the lowest bucket", () => {
    const neutral = findNeutralMonthWeekday()
    const day = makeDay({
      myanmar: { myt: 0, my: 1387, mm: neutral.month, md: 8 },
      weekday: neutral.weekday,
    })

    expect(getDayHeatScore(day)).toBe(0)
    expect(getDayHeatBucket(day)).toBe(0)
  })

  it("raises full/new moon days above baseline", () => {
    const neutral = findNeutralMonthWeekday()
    const base = makeDay({
      myanmar: { myt: 0, my: 1387, mm: neutral.month, md: 8 },
      weekday: neutral.weekday,
    })

    expect(getDayHeatScore({ ...base, moonPhase: 1 })).toBe(1)
    expect(getDayHeatScore({ ...base, moonPhase: 3 })).toBe(1)
  })

  it("pushes public holidays into highest intensity bucket", () => {
    const neutral = findNeutralMonthWeekday()
    const day = makeDay({
      myanmar: { myt: 0, my: 1387, mm: neutral.month, md: 8 },
      weekday: neutral.weekday,
      holidays: ["Union Day"],
    })

    expect(getDayHeatScore(day)).toBeGreaterThanOrEqual(5)
    expect(getDayHeatBucket(day)).toBe(4)
  })
})
