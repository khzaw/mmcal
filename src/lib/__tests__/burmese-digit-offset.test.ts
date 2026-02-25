import { describe, expect, it } from "vitest"

import { getCircledDayDigitOffsetClass } from "@/lib/burmese-digit-offset"

describe("getCircledDayDigitOffsetClass", () => {
  it("returns descender offset for Burmese descender digits", () => {
    expect(getCircledDayDigitOffsetClass("၂၅", "mm")).toBe("-translate-y-[0.15em]")
    expect(getCircledDayDigitOffsetClass("၇", "mm")).toBe("-translate-y-[0.15em]")
  })

  it("returns ascender offset when Burmese ascender digit is present", () => {
    expect(getCircledDayDigitOffsetClass("၆", "mm")).toBe("translate-y-[0.07em]")
    expect(getCircledDayDigitOffsetClass("၂၆", "mm")).toBe("translate-y-[0.07em]")
  })

  it("returns no offset for non-Burmese locales", () => {
    expect(getCircledDayDigitOffsetClass("57", "en")).toBe("")
    expect(getCircledDayDigitOffsetClass("၆", "en")).toBe("")
  })
})
