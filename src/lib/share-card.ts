import { cal_pyathada, cal_yatyaza } from "@/lib/burmese-calendar"
import type { CalendarDayInfo } from "@/lib/burmese-calendar"
import type { Locale, LocaleCode } from "@/lib/i18n/types"

const EN_MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

function getGregorianMonthLabel(day: CalendarDayInfo, t: Locale, localeCode: LocaleCode): string {
  if (localeCode === "en") {
    return (
      EN_MONTH_SHORT[day.gregorian.month - 1] ?? t.gregorianMonths[day.gregorian.month - 1] ?? ""
    )
  }
  return t.gregorianMonths[day.gregorian.month - 1] ?? ""
}

function getMoonAccent(phase: number): { moonFill: string; moonStroke: string; star: string } {
  if (phase === 1) return { moonFill: "#f4df9d", moonStroke: "#f0d05c", star: "#eac75e" }
  if (phase === 3) return { moonFill: "#161a22", moonStroke: "#7e828d", star: "#b6bac5" }
  return { moonFill: "#efe4ba", moonStroke: "#e6be3f", star: "#eac75e" }
}

function renderMoon(day: CalendarDayInfo): string {
  const { moonFill, moonStroke } = getMoonAccent(day.moonPhase)
  const progress = Math.max(0.05, Math.min(0.95, day.fortnightDay / 15))
  const terminatorRx = 64 * Math.abs(1 - 2 * progress)

  if (day.moonPhase === 1) {
    return `
      <circle cx="132" cy="130" r="64" fill="${moonFill}" stroke="${moonStroke}" stroke-width="1.5" />
    `
  }

  if (day.moonPhase === 3) {
    return `
      <circle cx="132" cy="130" r="64" fill="${moonFill}" stroke="${moonStroke}" stroke-width="1.5" />
      <circle cx="132" cy="130" r="64" fill="none" stroke="#8d9098" stroke-opacity="0.28" stroke-width="8" />
    `
  }

  const litFill = "#f0ca49"
  const shadowFill = "#0f131b"
  const isWaxing = day.moonPhase === 0
  return `
    <defs>
      <clipPath id="share-moon-clip">
        <circle cx="132" cy="130" r="64" />
      </clipPath>
      <radialGradient id="share-lit-grad" cx="${isWaxing ? "65%" : "35%"}" cy="35%" r="70%">
        <stop offset="0%" stop-color="#ffe38f" />
        <stop offset="100%" stop-color="${litFill}" />
      </radialGradient>
    </defs>
    <circle cx="132" cy="130" r="64" fill="${shadowFill}" stroke="${moonStroke}" stroke-width="1.5" />
    <g clip-path="url(#share-moon-clip)">
      ${
        isWaxing
          ? `<rect x="132" y="66" width="64" height="128" fill="url(#share-lit-grad)" />
             <ellipse cx="132" cy="130" rx="${terminatorRx}" ry="64" fill="${progress > 0.5 ? "url(#share-lit-grad)" : shadowFill}" />`
          : `<rect x="68" y="66" width="64" height="128" fill="url(#share-lit-grad)" />
             <ellipse cx="132" cy="130" rx="${terminatorRx}" ry="64" fill="${progress > 0.5 ? shadowFill : "url(#share-lit-grad)"}" />`
      }
    </g>
  `
}

function getStarfield(day: CalendarDayInfo): string {
  const { star } = getMoonAccent(day.moonPhase)
  const stars = [
    { x: 54, y: 68, r: 2.8, o: 0.9 },
    { x: 78, y: 45, r: 1.7, o: 0.7 },
    { x: 214, y: 64, r: 1.9, o: 0.65 },
    { x: 182, y: 48, r: 1.4, o: 0.55 },
    { x: 199, y: 199, r: 1.4, o: 0.5 },
    { x: 62, y: 206, r: 1.6, o: 0.52 },
  ]
  return stars
    .map(
      (s) =>
        `<circle cx="${s.x}" cy="${s.y}" r="${s.r}" fill="${star}" fill-opacity="${s.o.toFixed(2)}" />`,
    )
    .join("")
}

function getYearLine(day: CalendarDayInfo, t: Locale, localeCode: LocaleCode): string {
  const formatYear = t.formatNumber(day.gregorian.year)
  return localeCode === "en" ? formatYear : `${formatYear}`
}

export function buildShareCardSvg(day: CalendarDayInfo, t: Locale, localeCode: LocaleCode): string {
  const monthName = t.myanmarMonths[day.myanmar.mm] ?? day.monthName
  const gregorianMonth = getGregorianMonthLabel(day, t, localeCode)
  const gregorianDay = t.formatNumber(day.gregorian.day)
  const weekday = t.weekdays[day.weekday] ?? day.weekdayName
  const moonLabel = t.moonPhases[day.moonPhase] ?? day.moonPhaseName
  const yearLine = getYearLine(day, t, localeCode)
  const firstHoliday = day.holidays[0] ?? day.holidays2[0]
  const holidayLabel = firstHoliday ? (t.holidays[firstHoliday] ?? firstHoliday) : ""

  const highlightTokens = [
    cal_yatyaza(day.myanmar.mm, day.weekday) === 1 ? (t.astro.Yatyaza ?? "Yatyaza") : "",
    cal_pyathada(day.myanmar.mm, day.weekday) > 0
      ? cal_pyathada(day.myanmar.mm, day.weekday) === 2
        ? (t.astro["Afternoon Pyathada"] ?? "Afternoon Pyathada")
        : (t.astro.Pyathada ?? "Pyathada")
      : "",
    day.sabbath === 1
      ? (t.astro.Sabbath ?? "Sabbath")
      : day.sabbath === 2
        ? (t.astro["Sabbath Eve"] ?? "Sabbath Eve")
        : "",
    holidayLabel,
  ].filter(Boolean)

  const badges = highlightTokens
    .slice(0, 3)
    .map(
      (token, index) => `
      <g transform="translate(${268 + index * 196} 502)">
        <rect x="0" y="0" width="182" height="38" rx="19" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.14)" />
        <text x="91" y="24" text-anchor="middle" fill="rgba(238,241,247,0.9)" font-size="20" font-weight="550">${escapeXml(token)}</text>
      </g>
    `,
    )
    .join("")

  const fontFamily =
    localeCode === "en"
      ? "'Geist Mono','IBM Plex Mono',monospace"
      : "'MiSans Myanmar','Geist',sans-serif"

  return `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Myanmar calendar share card">
  <defs>
    <linearGradient id="share-bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#070a10" />
      <stop offset="60%" stop-color="#0c111a" />
      <stop offset="100%" stop-color="#111824" />
    </linearGradient>
    <radialGradient id="share-glow" cx="18%" cy="16%" r="70%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.12)" />
      <stop offset="100%" stop-color="rgba(255,255,255,0)" />
    </radialGradient>
  </defs>

  <rect x="0" y="0" width="1200" height="630" fill="url(#share-bg)" />
  <rect x="24" y="24" width="1152" height="582" rx="32" fill="rgba(5,9,15,0.55)" stroke="rgba(255,255,255,0.16)" stroke-width="1.5" />
  <rect x="36" y="36" width="1128" height="558" rx="28" fill="url(#share-glow)" />
  <line x1="36" y1="452" x2="1164" y2="452" stroke="rgba(255,255,255,0.1)" />

  <g transform="translate(0 0)">
    ${renderMoon(day)}
    ${getStarfield(day)}
  </g>

  <g style="font-family:${fontFamily}; letter-spacing:0.02em">
    <text x="268" y="124" fill="rgba(209,214,223,0.82)" font-size="40" font-weight="520">${escapeXml(weekday)}</text>
    <text x="268" y="242" fill="#ecf0f7" font-size="88" font-weight="670">${escapeXml(`${gregorianMonth} ${gregorianDay}`)}</text>
    <text x="268" y="310" fill="rgba(209,214,223,0.58)" font-size="48" font-weight="460">${escapeXml(yearLine)}</text>
    <text x="268" y="386" fill="rgba(196,202,213,0.86)" font-size="42" font-weight="520">${escapeXml(`${monthName} ${moonLabel} ${t.formatNumber(day.fortnightDay)}`)}</text>
    <text x="1140" y="585" text-anchor="end" fill="rgba(192,198,210,0.55)" font-size="22" font-weight="500">mmcal • ${escapeXml(t.ui.appTitle ?? "Myanmar Calendar")}</text>
  </g>
  ${badges}
</svg>
  `.trim()
}

export function buildShareText(day: CalendarDayInfo, t: Locale, localeCode: LocaleCode): string {
  const weekday = t.weekdays[day.weekday] ?? day.weekdayName
  const monthName = t.myanmarMonths[day.myanmar.mm] ?? day.monthName
  const gregorianMonth = getGregorianMonthLabel(day, t, localeCode)
  const holiday = day.holidays[0] ?? day.holidays2[0]
  const holidayLabel = holiday ? (t.holidays[holiday] ?? holiday) : ""
  const moonLabel = t.moonPhases[day.moonPhase] ?? day.moonPhaseName

  const lines = [
    `${weekday}, ${gregorianMonth} ${t.formatNumber(day.gregorian.day)}, ${t.formatNumber(day.gregorian.year)}`,
    `${monthName} ${moonLabel} ${t.formatNumber(day.fortnightDay)}`,
  ]

  if (holidayLabel) lines.push(holidayLabel)

  return lines.join("\n")
}

export function getShareFilename(day: CalendarDayInfo): string {
  const m = String(day.gregorian.month).padStart(2, "0")
  const d = String(day.gregorian.day).padStart(2, "0")
  return `mmcal-${day.gregorian.year}-${m}-${d}.png`
}

export async function renderShareCardPng(svg: string): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Failed to load share card image"))
    }
    img.src = url
  })

  const width = 1200
  const height = 630
  const ratio =
    typeof window !== "undefined" ? Math.min(3, Math.max(1, window.devicePixelRatio || 2)) : 2

  const canvas = document.createElement("canvas")
  canvas.width = Math.round(width * ratio)
  canvas.height = Math.round(height * ratio)

  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas context not available")
  ctx.scale(ratio, ratio)
  ctx.drawImage(image, 0, 0, width, height)

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Failed to export share card"))
        return
      }
      resolve(blob)
    }, "image/png")
  })
}

export async function downloadShareCardPng(svg: string, filename: string): Promise<void> {
  const pngBlob = await renderShareCardPng(svg)
  const url = URL.createObjectURL(pngBlob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  anchor.rel = "noopener"
  anchor.click()
  setTimeout(() => URL.revokeObjectURL(url), 900)
}
