import type { LocaleCode } from "@/lib/i18n/types"

const DESCENDER_DIGITS = /[၂၃၄၅၇၉]/
const ASCENDER_DIGIT = /၆/

export function getCircledDayDigitOffsetClass(dayLabel: string, localeCode: LocaleCode): string {
  if (localeCode !== "mm") return ""
  if (ASCENDER_DIGIT.test(dayLabel)) return "translate-y-[0.07em]"
  if (DESCENDER_DIGITS.test(dayLabel)) return "-translate-y-[0.15em]"
  return ""
}
