import { describe, expect, it } from "vitest"
import { en } from "../i18n/en"
import { mm } from "../i18n/mm"
import { toBurmeseNumerals, toWesternNumerals } from "../i18n/numerals"
import type { Locale } from "../i18n/types"

describe("toBurmeseNumerals", () => {
  it("converts 0", () => {
    expect(toBurmeseNumerals(0)).toBe("၀")
  })

  it("converts 1234567890", () => {
    expect(toBurmeseNumerals(1234567890)).toBe("၁၂၃၄၅၆၇၈၉၀")
  })

  it("converts year 2026", () => {
    expect(toBurmeseNumerals(2026)).toBe("၂၀၂၆")
  })
})

describe("toWesternNumerals", () => {
  it("converts Burmese numerals back", () => {
    expect(toWesternNumerals("၁၃၈၆")).toBe(1386)
  })

  it("roundtrips correctly", () => {
    for (const n of [0, 1, 42, 1386, 2026]) {
      expect(toWesternNumerals(toBurmeseNumerals(n))).toBe(n)
    }
  })
})

function checkLocaleCompleteness(locale: Locale, name: string) {
  describe(`${name} locale completeness`, () => {
    it("has 12 Gregorian months", () => {
      expect(locale.gregorianMonths).toHaveLength(12)
    })

    it("has all Myanmar months (0-14)", () => {
      for (let i = 0; i <= 14; i++) {
        expect(locale.myanmarMonths[i]).toBeTruthy()
      }
    })

    it("has 7 weekdays", () => {
      expect(locale.weekdays).toHaveLength(7)
      expect(locale.weekdaysShort).toHaveLength(7)
    })

    it("has 4 moon phases", () => {
      expect(locale.moonPhases).toHaveLength(4)
    })

    it("has 3 year types", () => {
      expect(locale.yearTypes).toHaveLength(3)
    })

    it("has 7 mahabote names", () => {
      expect(locale.mahabote).toHaveLength(7)
    })

    it("has 3 nakhat names", () => {
      expect(locale.nakhat).toHaveLength(3)
    })

    it("has 4 nagahle names", () => {
      expect(locale.nagahle).toHaveLength(4)
    })

    it("has formatNumber function", () => {
      expect(typeof locale.formatNumber).toBe("function")
      expect(locale.formatNumber(42)).toBeTruthy()
    })

    it("has ui labels", () => {
      expect(locale.ui.appTitle).toBeTruthy()
      expect(locale.ui.today).toBeTruthy()
      expect(locale.ui.monthView).toBeTruthy()
      expect(locale.ui.weekView).toBeTruthy()
      expect(locale.ui.yearView).toBeTruthy()
    })
  })
}

checkLocaleCompleteness(mm, "Burmese (mm)")
checkLocaleCompleteness(en, "English (en)")

describe("Burmese locale specifics", () => {
  it("formats numbers in Burmese", () => {
    expect(mm.formatNumber(2026)).toBe("၂၀၂၆")
  })

  it("has Burmese holiday translations", () => {
    expect(mm.holidays["Independence Day"]).toBeTruthy()
    expect(mm.holidays["Buddha Day"]).toBeTruthy()
  })

  it("has Burmese astro translations", () => {
    expect(mm.astro.Thamanyo).toBeTruthy()
    expect(mm.astro.Yatyaza).toBeTruthy()
  })
})

describe("English locale specifics", () => {
  it("formats numbers as strings", () => {
    expect(en.formatNumber(2026)).toBe("2026")
  })
})
