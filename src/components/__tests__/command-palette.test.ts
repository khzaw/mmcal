import { describe, expect, it } from "vitest"
import { normalizeSearchInput, tryParseDate } from "@/components/command-palette.utils"

describe("tryParseDate", () => {
  it("normalizes Myanmar digits to ASCII", () => {
    expect(normalizeSearchInput("၂၀၂၆-၃-၄")).toBe("2026-3-4")
  })

  it("parses YYYY-MM-DD", () => {
    expect(tryParseDate("2026-03-04")).toEqual({
      year: 2026,
      month: 3,
      day: 4,
    })
  })

  it("parses Myanmar digits in YYYY-MM-DD", () => {
    expect(tryParseDate("၂၀၂၆-၃-၄")).toEqual({
      year: 2026,
      month: 3,
      day: 4,
    })
  })
})
