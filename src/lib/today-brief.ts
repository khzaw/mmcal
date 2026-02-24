import { type CalendarDayInfo, cal_pyathada, cal_yatyaza } from "@/lib/burmese-calendar"
import type { Locale } from "@/lib/i18n/types"

export interface TodayBriefItem {
  key: string
  label: string
  tone: "holiday" | "warning" | "good" | "neutral"
}

export function buildTodayBrief(day: CalendarDayInfo, t: Locale): TodayBriefItem[] {
  const items: TodayBriefItem[] = []

  const firstHoliday = day.holidays[0] ?? day.holidays2[0]
  if (firstHoliday) {
    items.push({
      key: "holiday",
      label: t.holidays[firstHoliday] ?? firstHoliday,
      tone: "holiday",
    })
  }

  if (day.sabbath === 1) {
    items.push({
      key: "sabbath",
      label: t.astro.Sabbath ?? "Sabbath",
      tone: "good",
    })
  } else if (day.sabbath === 2) {
    items.push({
      key: "sabbath-eve",
      label: t.astro["Sabbath Eve"] ?? "Sabbath Eve",
      tone: "neutral",
    })
  }

  if (cal_yatyaza(day.myanmar.mm, day.weekday) === 1) {
    items.push({
      key: "yatyaza",
      label: t.astro.Yatyaza ?? "Yatyaza",
      tone: "good",
    })
  }

  const pyathada = cal_pyathada(day.myanmar.mm, day.weekday)
  if (pyathada === 1) {
    items.push({
      key: "pyathada",
      label: t.astro.Pyathada ?? "Pyathada",
      tone: "warning",
    })
  } else if (pyathada === 2) {
    items.push({
      key: "afternoon-pyathada",
      label: t.astro["Afternoon Pyathada"] ?? "Afternoon Pyathada",
      tone: "warning",
    })
  }

  for (const astro of day.astro.slice(0, 2)) {
    items.push({
      key: `astro-${astro}`,
      label: t.astro[astro] ?? astro,
      tone: "neutral",
    })
  }

  if (items.length === 0) {
    items.push({
      key: "moon",
      label: `${t.moonPhases[day.moonPhase] ?? day.moonPhaseName} ${t.formatNumber(day.fortnightDay)}`,
      tone: "neutral",
    })
  }

  return items.slice(0, 6)
}
