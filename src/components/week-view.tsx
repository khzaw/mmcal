import { springPresets } from "@/lib/animations"
import type { CalendarDayInfo } from "@/lib/burmese-calendar"
import { cal_pyathada, cal_yatyaza, getDayInfo, w2j } from "@/lib/burmese-calendar"
import { getCircledDayDigitOffsetClass } from "@/lib/burmese-digit-offset"
import { useI18n } from "@/lib/i18n/context"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"
import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { MoonPhaseIcon } from "./moon-phase-icon"

interface WeekViewProps {
  year: number
  month: number
  day: number
  selectedJdn: number | null
  onSelectDay: (day: CalendarDayInfo) => void
  todayJdn: number
  direction?: number
  /** Use infinite vertical list (mobile) */
  vertical?: boolean
  /** Increments on explicit navigation — forces infinite list to re-center */
  scrollKey?: number
}

export function WeekView({
  year,
  month,
  day,
  selectedJdn,
  onSelectDay,
  todayJdn,
  direction = 0,
  vertical = false,
  scrollKey = 0,
}: WeekViewProps) {
  const { t, localeCode } = useI18n()
  const hasMountedWeekGridRef = useRef(false)

  const weekDays = useMemo(() => {
    const centerJdn = Math.round(w2j(year, month, day))
    const info = getDayInfo(centerJdn)
    const sundayOffset = (info.weekday + 6) % 7
    const startJdn = centerJdn - sundayOffset
    const days: CalendarDayInfo[] = []
    for (let i = 0; i < 7; i++) {
      days.push(getDayInfo(startJdn + i))
    }
    return days
  }, [year, month, day])

  useEffect(() => {
    hasMountedWeekGridRef.current = true
  }, [])

  if (vertical) {
    return (
      <InfiniteWeekList
        key={scrollKey}
        year={year}
        month={month}
        day={day}
        selectedJdn={selectedJdn}
        onSelectDay={onSelectDay}
        todayJdn={todayJdn}
      />
    )
  }

  return (
    <div className="w-full">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={weekDays[0]?.jdn}
          initial={
            hasMountedWeekGridRef.current
              ? {
                  x: direction > 0 ? 80 : direction < 0 ? -80 : 0,
                  opacity: 0,
                }
              : false
          }
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: direction > 0 ? -80 : 80, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="grid grid-cols-7 grid-rows-1 gap-px bg-border/10 rounded-lg overflow-hidden min-h-[580px]"
        >
          {weekDays.map((d) => {
            const isToday = d.jdn === todayJdn
            const isSelected = d.jdn === selectedJdn
            const isSunday = d.weekday === 1
            const isSaturday = d.weekday === 0
            const hasHoliday = d.holidays.length > 0
            const isFullMoon = d.moonPhase === 1
            const isHolidayFullMoon = isFullMoon && hasHoliday
            const isNewMoon = d.moonPhase === 3

            const monthName = t.myanmarMonths[d.myanmar.mm] ?? d.monthName
            const moonPhaseName = t.moonPhases[d.moonPhase]
            const allHolidays = [...d.holidays, ...d.holidays2]
            const yatyaza = cal_yatyaza(d.myanmar.mm, d.weekday)
            const pyathada = cal_pyathada(d.myanmar.mm, d.weekday)
            const dayNumberLabel = t.formatNumber(d.gregorian.day)
            const circledDigitOffsetClass = getCircledDayDigitOffsetClass(
              dayNumberLabel,
              localeCode,
            )

            return (
              <motion.button
                type="button"
                key={d.jdn}
                onClick={() => onSelectDay(d)}
                whileHover={{ scale: 1.018, y: -1 }}
                whileTap={{ scale: 0.985 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 24,
                  mass: 0.62,
                }}
                className={cn(
                  "bg-card p-3 text-left relative overflow-hidden",
                  "transition-[transform,background-color,box-shadow] duration-300 ease-out will-change-transform",
                  "flex flex-col",
                  "cursor-pointer",
                  "hover:bg-accent/60 hover:shadow-[0_12px_26px_-16px_rgba(0,0,0,0.65)] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                  isToday && !isSelected && "bg-primary/5",
                  hasHoliday && !isSelected && "bg-destructive/10",
                  isSelected && "bg-primary/10",
                )}
              >
                {/* Selected day indicator */}
                {isSelected && (
                  <motion.div
                    layoutId="week-selected-indicator"
                    transition={{ type: "spring", stiffness: 420, damping: 34, mass: 0.5 }}
                    className="absolute inset-x-0 inset-y-auto top-0 w-auto h-[3px] bg-primary"
                  />
                )}

                {/* Weekday header */}
                <div
                  className={cn(
                    "text-xs font-semibold tracking-wide leading-relaxed mb-1",
                    d.weekday === 1 || d.weekday === 0
                      ? "text-destructive"
                      : "text-muted-foreground",
                  )}
                >
                  {t.weekdaysShort[d.weekday]}
                </div>

                {/* Gregorian date */}
                <div className="flex items-center gap-1.5 mb-2">
                  <span
                    className={cn(
                      "text-base leading-none inline-flex items-center justify-center",
                      isHolidayFullMoon &&
                        "bg-[var(--moon-full)] text-white font-bold rounded-full w-8 h-8",
                      isFullMoon &&
                        !hasHoliday &&
                        "bg-foreground text-background font-bold rounded-full w-8 h-8",
                      isNewMoon &&
                        "bg-background text-foreground border border-foreground/55 font-bold rounded-full w-8 h-8",
                      !isFullMoon && !isNewMoon && "text-lg font-semibold",
                      !isFullMoon &&
                        !isNewMoon &&
                        (isSunday || isSaturday || hasHoliday) &&
                        "text-destructive",
                      isToday && !isFullMoon && !isNewMoon && "text-primary font-bold",
                      isToday &&
                        (isFullMoon || isNewMoon) &&
                        "ring-2 ring-primary ring-offset-1 ring-offset-card",
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block",
                        (isFullMoon || isNewMoon) && circledDigitOffsetClass,
                      )}
                    >
                      {dayNumberLabel}
                    </span>
                  </span>
                  {!isFullMoon && !isNewMoon && <MoonPhaseIcon phase={d.moonPhase} size={16} />}
                </div>

                {/* Myanmar date */}
                <div className="space-y-0.5 text-xs flex-1">
                  <p className="text-muted-foreground/80 text-[11px] leading-relaxed">
                    {monthName}
                  </p>
                  <p
                    className={cn(
                      "text-[11px] leading-relaxed",
                      isHolidayFullMoon
                        ? "text-[var(--moon-full-text)] font-medium"
                        : isFullMoon
                          ? "text-foreground/72"
                          : isNewMoon
                            ? "text-foreground/62"
                            : "text-muted-foreground",
                    )}
                  >
                    {moonPhaseName} {t.formatNumber(d.fortnightDay)}
                  </p>
                </div>

                {/* Holidays + astro */}
                <div className="mt-auto">
                  {allHolidays.length > 0 && (
                    <div className="pt-2 space-y-0.5">
                      {allHolidays.map((h, i) => (
                        <motion.p
                          key={i}
                          initial={{ opacity: 0, x: -4 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            delay: i * 0.03,
                            ...springPresets.snappy,
                          }}
                          className="text-[10px] text-destructive font-medium truncate"
                        >
                          {t.holidays[h] ?? h}
                        </motion.p>
                      ))}
                    </div>
                  )}

                  {(yatyaza === 1 || pyathada > 0 || d.astro.length > 0) && (
                    <div className="mt-1 flex flex-wrap gap-1 justify-start">
                      {yatyaza === 1 && (
                        <span className="text-[9px] text-chart-2/70 bg-chart-2/10 rounded px-1">
                          {t.astro.Yatyaza ?? "Yatyaza"}
                        </span>
                      )}
                      {pyathada === 1 && (
                        <span className="text-[9px] text-destructive/60 bg-destructive/8 rounded px-1">
                          {t.astro.Pyathada ?? "Pyathada"}
                        </span>
                      )}
                      {pyathada === 2 && (
                        <span className="text-[9px] text-destructive/60 bg-destructive/8 rounded px-1">
                          {t.astro["Afternoon Pyathada"] ?? "Afternoon Pyathada"}
                        </span>
                      )}
                      {d.astro.map((a, i) => (
                        <motion.span
                          key={i}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{
                            delay: i * 0.03,
                            ...springPresets.snappy,
                          }}
                          className="text-[9px] text-muted-foreground bg-secondary rounded px-1"
                        >
                          {t.astro[a] ?? a}
                        </motion.span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sabbath indicator */}
                {d.sabbath === 1 && (
                  <div className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-destructive" />
                )}
              </motion.button>
            )
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Mobile infinite list
// ---------------------------------------------------------------------------

function InfiniteWeekList({
  year,
  month,
  day,
  selectedJdn,
  onSelectDay,
  todayJdn,
}: {
  year: number
  month: number
  day: number
  selectedJdn: number | null
  onSelectDay: (day: CalendarDayInfo) => void
  todayJdn: number
}) {
  const { t } = useI18n()
  const scrollRef = useRef<HTMLDivElement>(null)
  const topSentinelRef = useRef<HTMLDivElement>(null)
  const bottomSentinelRef = useRef<HTMLDivElement>(null)
  const prevScrollHeight = useRef(0)
  const needsScroll = useRef(true)
  const isExtendingTop = useRef(false)

  // The actual navigated day (for scroll targeting)
  const targetJdn = useMemo(() => Math.round(w2j(year, month, day)), [year, month, day])

  // Sunday JDN of the current week (for range computation)
  const centerJdn = useMemo(() => {
    const info = getDayInfo(targetJdn)
    return targetJdn - ((info.weekday + 6) % 7)
  }, [targetJdn])

  const [rangeStart, setRangeStart] = useState(() => centerJdn - 14)
  const [rangeEnd, setRangeEnd] = useState(() => centerJdn + 21)

  // Reset when navigated externally (Today button, header arrows, etc.)
  useEffect(() => {
    setRangeStart(centerJdn - 14)
    setRangeEnd(centerJdn + 21)
    needsScroll.current = true
  }, [centerJdn])

  const days = useMemo(() => {
    const result: CalendarDayInfo[] = []
    for (let jdn = rangeStart; jdn < rangeEnd; jdn++) {
      result.push(getDayInfo(jdn))
    }
    return result
  }, [rangeStart, rangeEnd])

  // Scroll to center the current day in the viewport on mount / navigation
  useLayoutEffect(() => {
    if (!needsScroll.current) return
    needsScroll.current = false
    const container = scrollRef.current
    if (!container) return
    const el = container.querySelector(`[data-jdn="${targetJdn}"]`) as HTMLElement | null
    if (el) {
      container.scrollTop = el.offsetTop - container.clientHeight / 2 + el.offsetHeight / 2
    }
  })

  // Compensate scroll position after prepending days at the top
  useLayoutEffect(() => {
    // Keep this effect keyed to rangeStart so prepends restore scroll position.
    void rangeStart
    if (!prevScrollHeight.current) return
    const container = scrollRef.current
    if (!container) return
    const diff = container.scrollHeight - prevScrollHeight.current
    if (diff > 0) {
      container.scrollTop += diff
    }
    prevScrollHeight.current = 0
    isExtendingTop.current = false
  }, [rangeStart])

  // IntersectionObserver — load more days when sentinels enter viewport
  useEffect(() => {
    // Recreate observer when the visible range changes.
    void rangeStart
    void rangeEnd
    const container = scrollRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          if (entry.target === topSentinelRef.current && !isExtendingTop.current) {
            isExtendingTop.current = true
            prevScrollHeight.current = container.scrollHeight
            setRangeStart((prev) => prev - 7)
          } else if (entry.target === bottomSentinelRef.current) {
            setRangeEnd((prev) => prev + 7)
          }
        }
      },
      { root: container, rootMargin: "100px" },
    )

    if (topSentinelRef.current) observer.observe(topSentinelRef.current)
    if (bottomSentinelRef.current) observer.observe(bottomSentinelRef.current)

    return () => observer.disconnect()
  }, [rangeStart, rangeEnd])

  return (
    <div
      ref={scrollRef}
      className="relative overflow-y-auto rounded-lg h-[308px] overscroll-y-contain"
    >
      <div ref={topSentinelRef} className="h-px" />

      {days.map((d, i) => {
        const isToday = d.jdn === todayJdn
        const isSelected = d.jdn === selectedJdn
        const isSunday = d.weekday === 1
        const isSaturday = d.weekday === 0
        const hasHoliday = d.holidays.length > 0
        const isFullMoon = d.moonPhase === 1
        const isHolidayFullMoon = isFullMoon && hasHoliday
        const isNewMoon = d.moonPhase === 3
        const monthName = t.myanmarMonths[d.myanmar.mm] ?? d.monthName
        const moonPhaseName = t.moonPhases[d.moonPhase]
        const allHolidays = [...d.holidays, ...d.holidays2]
        const yatyaza = cal_yatyaza(d.myanmar.mm, d.weekday)
        const pyathada = cal_pyathada(d.myanmar.mm, d.weekday)
        const prevDay = i > 0 ? days[i - 1] : null
        const showMonthHeader =
          i === 0 ||
          !prevDay ||
          prevDay.gregorian.month !== d.gregorian.month ||
          prevDay.gregorian.year !== d.gregorian.year
        const showWeekSep = isSunday && i > 0 && !showMonthHeader

        return (
          <Fragment key={d.jdn}>
            {showMonthHeader && (
              <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-muted-foreground border-b border-border/30">
                {t.gregorianMonths[d.gregorian.month - 1]} {t.formatNumber(d.gregorian.year)}
              </div>
            )}
            {showWeekSep && <div className="h-px bg-border/20" />}

            <button
              type="button"
              data-jdn={d.jdn}
              onClick={() => onSelectDay(d)}
              className={cn(
                "w-full bg-card px-3 py-2.5 text-left transition-colors relative overflow-hidden",
                "cursor-pointer",
                "active:bg-accent/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                isToday && !isSelected && "bg-primary/5",
                hasHoliday && !isSelected && "bg-destructive/10",
                isSelected && "bg-primary/10",
              )}
            >
              {/* Selected indicator — left edge bar */}
              {isSelected && (
                <motion.div
                  layoutId="week-mobile-selected-indicator"
                  transition={{ type: "spring", stiffness: 420, damping: 34, mass: 0.5 }}
                  className="absolute inset-y-0 left-0 w-[3px] bg-primary"
                />
              )}

              <div className="flex items-center gap-3 w-full min-w-0">
                {/* Weekday + date */}
                <div className="shrink-0 flex items-center gap-2 w-24">
                  <span
                    className={cn(
                      "text-[11px] font-medium w-14 truncate",
                      isSunday || isSaturday ? "text-destructive" : "text-muted-foreground",
                    )}
                  >
                    {t.weekdaysShort[d.weekday]}
                  </span>
                  <span
                    className={cn(
                      "text-sm font-semibold tabular-nums",
                      isHolidayFullMoon && "text-[var(--moon-full-text)]",
                      isFullMoon && !hasHoliday && "text-foreground",
                      isNewMoon && "text-foreground/72",
                      !isFullMoon &&
                        !isNewMoon &&
                        (isSunday || isSaturday || hasHoliday) &&
                        "text-destructive",
                      isToday && "text-primary",
                    )}
                  >
                    {t.formatNumber(d.gregorian.day)}
                  </span>
                  <MoonPhaseIcon
                    phase={d.moonPhase}
                    size={14}
                    fullMoonTone={hasHoliday ? "holiday" : "neutral"}
                  />
                </div>

                {/* Myanmar date */}
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-[11px] leading-snug truncate",
                      isHolidayFullMoon
                        ? "text-[var(--moon-full-text)]/70"
                        : isFullMoon
                          ? "text-foreground/70"
                          : isNewMoon
                            ? "text-foreground/62"
                            : "text-muted-foreground/70",
                    )}
                  >
                    {monthName} {moonPhaseName} {t.formatNumber(d.fortnightDay)}
                  </p>
                </div>

                {/* Tags */}
                <div className="shrink-0 flex flex-wrap gap-1 justify-end max-w-[40%]">
                  {allHolidays.slice(0, 1).map((h, hi) => (
                    <span
                      key={hi}
                      className="text-[9px] text-destructive/70 truncate max-w-[120px]"
                    >
                      {t.holidays[h] ?? h}
                    </span>
                  ))}
                  {yatyaza === 1 && (
                    <span className="text-[9px] text-chart-2/60 bg-chart-2/8 rounded px-1">
                      {t.astro.Yatyaza ?? "Yatyaza"}
                    </span>
                  )}
                  {pyathada === 1 && (
                    <span className="text-[9px] text-destructive/50 bg-destructive/6 rounded px-1">
                      {t.astro.Pyathada ?? "Pyathada"}
                    </span>
                  )}
                  {pyathada === 2 && (
                    <span className="text-[9px] text-destructive/50 bg-destructive/6 rounded px-1">
                      {t.astro["Afternoon Pyathada"] ?? "Afternoon Pyathada"}
                    </span>
                  )}
                  {d.astro.slice(0, 1).map((a, ai) => (
                    <span
                      key={ai}
                      className="text-[9px] text-muted-foreground/60 bg-secondary rounded px-1"
                    >
                      {t.astro[a] ?? a}
                    </span>
                  ))}
                </div>
              </div>

              {/* Sabbath dot */}
              {d.sabbath === 1 && (
                <div className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-destructive" />
              )}
            </button>
          </Fragment>
        )
      })}

      <div ref={bottomSentinelRef} className="h-px" />
    </div>
  )
}
