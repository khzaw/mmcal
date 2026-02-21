const BURMESE_DIGITS = ["၀", "၁", "၂", "၃", "၄", "၅", "၆", "၇", "၈", "၉"]

export function toBurmeseNumerals(n: number): string {
  return String(n).replace(/[0-9]/g, (d) => BURMESE_DIGITS[Number(d)]!)
}

export function toWesternNumerals(s: string): number {
  const western = s.replace(/[၀-၉]/g, (d) => String("၀၁၂၃၄၅၆၇၈၉".indexOf(d)))
  return Number(western)
}
