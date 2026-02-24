import { describe, expect, it } from "vitest"
import { getNewMoonInnerStars, getOrbitalStars } from "../moon-starfield"

describe("moon starfield", () => {
  it("keeps a dense baseline starfield for non-new-moon phases", () => {
    const waxingStars = getOrbitalStars(0)
    expect(waxingStars.length).toBeGreaterThanOrEqual(24)
  })

  it("adds many more orbital stars on new moon", () => {
    const waxingStars = getOrbitalStars(0)
    const newMoonStars = getOrbitalStars(3)

    expect(newMoonStars.length).toBeGreaterThan(waxingStars.length)
    expect(newMoonStars.length).toBeGreaterThanOrEqual(48)
    expect(newMoonStars.length - waxingStars.length).toBeGreaterThanOrEqual(20)
  })

  it("packs more stars close to the moon on new moon", () => {
    const waxingNearCount = getOrbitalStars(0).filter((s) => s.distOffset <= 8).length
    const newMoonNearCount = getOrbitalStars(3).filter((s) => s.distOffset <= 8).length

    expect(newMoonNearCount).toBeGreaterThan(waxingNearCount)
    expect(newMoonNearCount).toBeGreaterThanOrEqual(20)
  })

  it("keeps generated new moon inner stars inside the moon disk", () => {
    const half = 40
    const r = 30
    const stars = getNewMoonInnerStars(half, r)

    expect(stars.length).toBeGreaterThanOrEqual(10)

    for (const star of stars) {
      const dx = star.x - half
      const dy = star.y - half
      const distance = Math.hypot(dx, dy)
      expect(distance).toBeLessThanOrEqual(r * 0.95)
    }
  })
})
