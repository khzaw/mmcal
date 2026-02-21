export type LocaleCode = "mm" | "en"

export interface Locale {
  code: LocaleCode
  name: string
  gregorianMonths: string[]
  myanmarMonths: Record<number, string>
  weekdays: string[]
  weekdaysShort: string[]
  moonPhases: string[]
  yearTypes: string[]
  mahabote: string[]
  nakhat: string[]
  nagahle: string[]
  holidays: Record<string, string>
  astro: Record<string, string>
  ui: Record<string, string>
  formatNumber: (n: number) => string
}
