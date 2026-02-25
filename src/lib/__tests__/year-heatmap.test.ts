import type { CalendarDayInfo } from "@/lib/burmese-calendar"
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

describe("year heatmap scoring", () => {
  it("keeps a normal day in the lowest bucket", () => {
    const day = makeDay()
    expect(getDayHeatScore(day)).toBe(0)
    expect(getDayHeatBucket(day)).toBe(0)
  })

  it("ignores non-holiday signals", () => {
    const day = makeDay({
      moonPhase: 1,
      sabbath: 1,
      astro: ["Thamanyo"],
    })
    expect(getDayHeatScore(day)).toBe(0)
    expect(getDayHeatBucket(day)).toBe(0)
  })

  it("marks holiday days as highlighted", () => {
    const day = makeDay({
      holidays: ["Union Day"],
    })

    expect(getDayHeatScore(day)).toBe(1)
    expect(getDayHeatBucket(day)).toBe(4)
  })

  it("counts secondary holiday list too", () => {
    const day = makeDay({
      holidays2: ["Christmas Day"],
    })

    expect(getDayHeatScore(day)).toBe(1)
    expect(getDayHeatBucket(day)).toBe(4)
  })
})
