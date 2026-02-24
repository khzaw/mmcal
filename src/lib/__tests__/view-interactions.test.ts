import { describe, expect, it } from "vitest"

import { isSwipeNavigationEnabled, shouldHideDetailHero } from "@/lib/view-interactions"

describe("view interaction rules", () => {
  it("enables swipe only for mobile month view", () => {
    expect(isSwipeNavigationEnabled("month", true)).toBe(true)
    expect(isSwipeNavigationEnabled("month", false)).toBe(false)
    expect(isSwipeNavigationEnabled("week", true)).toBe(false)
    expect(isSwipeNavigationEnabled("year", true)).toBe(false)
  })

  it("hides the detail hero only when selected date is today", () => {
    expect(shouldHideDetailHero(null, 2460000)).toBe(false)
    expect(shouldHideDetailHero(2460000, 2460000)).toBe(true)
    expect(shouldHideDetailHero(2460001, 2460000)).toBe(false)
  })
})
