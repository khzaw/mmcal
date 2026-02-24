import type { CalendarDayInfo } from "@/lib/burmese-calendar"
import { cal_pyathada, cal_yatyaza } from "@/lib/burmese-calendar"
import { mm } from "@/lib/i18n/mm"
import { describe, expect, it } from "vitest"
import { buildTodayBrief } from "../today-brief"

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

describe("buildTodayBrief", () => {
  it("includes translated holiday and sabbath when present", () => {
    const day = makeDay({ holidays: ["Union Day"], sabbath: 1 })
    const items = buildTodayBrief(day, mm)
    const labels = items.map((i) => i.label)

    expect(labels).toContain(mm.holidays["Union Day"])
    expect(labels).toContain(mm.astro.Sabbath)
  })

  it("includes yatyaza and pyathada signals for matching day setup", () => {
    let yatyazaDay: CalendarDayInfo | null = null
    let pyathadaDay: CalendarDayInfo | null = null

    for (let month = 1; month <= 12; month++) {
      for (let weekday = 0; weekday <= 6; weekday++) {
        if (!yatyazaDay && cal_yatyaza(month, weekday) === 1) {
          yatyazaDay = makeDay({ myanmar: { myt: 0, my: 1387, mm: month, md: 9 }, weekday })
        }
        if (!pyathadaDay && cal_pyathada(month, weekday) > 0) {
          pyathadaDay = makeDay({ myanmar: { myt: 0, my: 1387, mm: month, md: 9 }, weekday })
        }
      }
    }

    expect(yatyazaDay).toBeTruthy()
    expect(pyathadaDay).toBeTruthy()

    const yItems = buildTodayBrief(yatyazaDay!, mm).map((i) => i.label)
    const pItems = buildTodayBrief(pyathadaDay!, mm).map((i) => i.label)

    expect(yItems).toContain(mm.astro.Yatyaza ?? "Yatyaza")
    expect(
      pItems.includes(mm.astro.Pyathada ?? "Pyathada") ||
        pItems.includes(mm.astro["Afternoon Pyathada"] ?? "Afternoon Pyathada"),
    ).toBe(true)
  })

  it("falls back to moon brief when no special markers are present", () => {
    const day = makeDay()
    const items = buildTodayBrief(day, mm)

    expect(items.length).toBeGreaterThanOrEqual(1)
    expect(items[items.length - 1]?.label).toContain(mm.moonPhases[day.moonPhase] ?? "")
  })
})
