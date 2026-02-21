import { describe, expect, it } from "vitest"
import {
  cal_holiday,
  cal_mahabote,
  cal_mf,
  cal_mp,
  cal_my,
  cal_nagahle,
  cal_nakhat,
  getDayInfo,
  getGregorianMonthDays,
  j2m,
  j2w,
  m2j,
  my2sy,
  w2j,
} from "../burmese-calendar"

describe("w2j / j2w roundtrip", () => {
  it("converts 2024-01-01 correctly", () => {
    const jdn = w2j(2024, 1, 1)
    const w = j2w(jdn)
    expect(w.y).toBe(2024)
    expect(w.m).toBe(1)
    expect(w.d).toBe(1)
  })

  it("converts 2000-06-15 correctly", () => {
    const jdn = w2j(2000, 6, 15)
    const w = j2w(jdn)
    expect(w.y).toBe(2000)
    expect(w.m).toBe(6)
    expect(w.d).toBe(15)
  })

  it("handles leap year 2024-02-29", () => {
    const jdn = w2j(2024, 2, 29)
    const w = j2w(jdn)
    expect(w.y).toBe(2024)
    expect(w.m).toBe(2)
    expect(w.d).toBe(29)
  })
})

describe("j2m / m2j roundtrip", () => {
  it("converts a known date and back", () => {
    const jdn = Math.round(w2j(2024, 4, 17))
    const mm = j2m(jdn)
    const backJdn = m2j(mm.my, mm.mm, mm.md)
    expect(backJdn).toBe(jdn)
  })

  it("handles Myanmar New Year area", () => {
    const jdn = Math.round(w2j(2024, 4, 17))
    const mm = j2m(jdn)
    expect(mm.my).toBe(1386)
    expect(mm.mm).toBe(1) // Tagu
  })
})

describe("cal_mp - moon phases", () => {
  it("returns 1 for full moon day (md=15)", () => {
    expect(cal_mp(15, 1, 0)).toBe(1)
  })

  it("returns 3 for new moon day (md=30 in even month)", () => {
    expect(cal_mp(30, 2, 0)).toBe(3)
  })

  it("returns 0 for waxing days", () => {
    expect(cal_mp(5, 1, 0)).toBe(0)
  })
})

describe("cal_mf - fortnight day", () => {
  it("returns correct fortnight day for waxing", () => {
    expect(cal_mf(5)).toBe(5)
  })

  it("returns correct fortnight day for waning", () => {
    expect(cal_mf(20)).toBe(5)
  })
})

describe("cal_my - year info", () => {
  it("returns year type for known year", () => {
    const info = cal_my(1386)
    expect(info.myt).toBeGreaterThanOrEqual(0)
    expect(info.myt).toBeLessThanOrEqual(2)
  })
})

describe("getDayInfo", () => {
  it("returns complete info for today-ish date", () => {
    const jdn = Math.round(w2j(2026, 2, 21))
    const info = getDayInfo(jdn)

    expect(info.jdn).toBe(jdn)
    expect(info.gregorian.year).toBe(2026)
    expect(info.gregorian.month).toBe(2)
    expect(info.gregorian.day).toBe(21)
    expect(info.myanmar.my).toBeGreaterThan(1380)
    expect(info.moonPhase).toBeGreaterThanOrEqual(0)
    expect(info.moonPhase).toBeLessThanOrEqual(3)
    expect(info.weekday).toBeGreaterThanOrEqual(0)
    expect(info.weekday).toBeLessThanOrEqual(6)
    expect(info.monthName).toBeTruthy()
    expect(info.moonPhaseName).toBeTruthy()
    expect(info.weekdayName).toBeTruthy()
  })
})

describe("getGregorianMonthDays", () => {
  it("returns 28 or 29 days for February", () => {
    const days2024 = getGregorianMonthDays(2024, 2)
    expect(days2024).toHaveLength(29) // leap year

    const days2025 = getGregorianMonthDays(2025, 2)
    expect(days2025).toHaveLength(28)
  })

  it("returns 31 days for January", () => {
    const days = getGregorianMonthDays(2026, 1)
    expect(days).toHaveLength(31)
  })
})

describe("cal_holiday", () => {
  it("detects Independence Day", () => {
    const jdn = Math.round(w2j(2024, 1, 4))
    const holidays = cal_holiday(jdn)
    expect(holidays).toContain("Independence Day")
  })

  it("detects Christmas Day", () => {
    const jdn = Math.round(w2j(2024, 12, 25))
    const holidays = cal_holiday(jdn)
    expect(holidays).toContain("Christmas Day")
  })
})

describe("helper functions", () => {
  it("my2sy adds 1182", () => {
    expect(my2sy(1386)).toBe(2568)
  })

  it("cal_mahabote returns 0-6", () => {
    const result = cal_mahabote(1386, 3)
    expect(result % 7).toBeGreaterThanOrEqual(0)
    expect(result % 7).toBeLessThanOrEqual(6)
  })

  it("cal_nakhat returns 0-2", () => {
    expect(cal_nakhat(1386)).toBe(1386 % 3)
  })

  it("cal_nagahle returns 0-3", () => {
    const result = cal_nagahle(4)
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(3)
  })
})
