import type { CalendarDayInfo } from "@/lib/burmese-calendar"
import { en } from "@/lib/i18n/en"
import { mm } from "@/lib/i18n/mm"
import { describe, expect, it } from "vitest"
import { buildShareCardSvg, buildShareText, getShareFilename } from "../share-card"

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

describe("share card helpers", () => {
  it("builds concise share text with short month in English", () => {
    const day = makeDay({ holidays: ["Union Day"] })
    const text = buildShareText(day, en, "en")

    expect(text).toContain("Feb 24, 2026")
    expect(text).toContain("Union Day")
  })

  it("builds locale-aware share text in Myanmar", () => {
    const day = makeDay({ holidays: ["Union Day"] })
    const text = buildShareText(day, mm, "mm")

    expect(text).toContain(mm.gregorianMonths[1] ?? "")
    expect(text).toContain(mm.holidays["Union Day"] ?? "")
  })

  it("escapes xml-unsafe text inside SVG output", () => {
    const unsafeHoliday = 'A&B <tag> "x"'
    const day = makeDay({ holidays: [unsafeHoliday] })
    const locale = {
      ...en,
      holidays: {
        ...en.holidays,
        [unsafeHoliday]: unsafeHoliday,
      },
    }

    const svg = buildShareCardSvg(day, locale, "en")
    expect(svg).toContain("A&amp;B &lt;tag&gt; &quot;x&quot;")
  })

  it("creates stable png filenames", () => {
    const day = makeDay({ gregorian: { year: 2026, month: 2, day: 4 } })
    expect(getShareFilename(day)).toBe("mmcal-2026-02-04.png")
  })
})
