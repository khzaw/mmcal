const myanmarToAsciiDigit: Record<string, string> = {
  "၀": "0",
  "၁": "1",
  "၂": "2",
  "၃": "3",
  "၄": "4",
  "၅": "5",
  "၆": "6",
  "၇": "7",
  "၈": "8",
  "၉": "9",
}

export function normalizeSearchInput(input: string): string {
  return input.replace(/[၀-၉]/g, (digit) => myanmarToAsciiDigit[digit] ?? digit).trim()
}

export function tryParseDate(input: string): { year: number; month: number; day: number } | null {
  input = normalizeSearchInput(input)
  if (!input) return null

  // Try YYYY-MM-DD or YYYY/MM/DD
  const isoMatch = input.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/)
  if (isoMatch) {
    const [, y, m, d] = isoMatch
    const year = Number(y)
    const month = Number(m)
    const day = Number(d)
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return { year, month, day }
    }
  }

  // Try MM/DD/YYYY or DD/MM/YYYY (assume MM/DD)
  const usMatch = input.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/)
  if (usMatch) {
    const [, a, b, y] = usMatch
    const month = Number(a)
    const day = Number(b)
    const year = Number(y)
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return { year, month, day }
    }
  }

  return null
}
