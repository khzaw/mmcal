import { springPresets } from "@/lib/animations"
import type { CalendarDayInfo } from "@/lib/burmese-calendar"
import { getGregorianMonthDays } from "@/lib/burmese-calendar"
import { getCircledDayDigitOffsetClass } from "@/lib/burmese-digit-offset"
import { useI18n } from "@/lib/i18n/context"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"
import { useMemo } from "react"

interface CalendarGridProps {
  year: number
  month: number
  selectedJdn: number | null
  onSelectDay: (day: CalendarDayInfo) => void
  todayJdn: number
  direction?: number
}

// Algorithm weekday indices in Sunday-first display order
const SUNDAY_FIRST = [1, 2, 3, 4, 5, 6, 0] // Sun, Mon, Tue, Wed, Thu, Fri, Sat

// Convert algorithm weekday (0=Sat,1=Sun,...,6=Fri) to display column (0=Sun,...,6=Sat)
function displayColumn(weekday: number): number {
  return (weekday + 6) % 7
}

export function CalendarGrid({
  year,
  month,
  selectedJdn,
  onSelectDay,
  todayJdn,
  direction = 0,
}: CalendarGridProps) {
  const { t, localeCode } = useI18n()
  const days = useMemo(() => getGregorianMonthDays(year, month), [year, month])

  const firstDayWeekday = days[0]?.weekday ?? 0
  const blanks = displayColumn(firstDayWeekday)
  const cells: (CalendarDayInfo | null)[] = [...Array(blanks).fill(null), ...days]
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div className="w-full">
      {/* Weekday headers — Sunday first */}
      <div className="grid grid-cols-7 gap-px mb-1">
        {SUNDAY_FIRST.map((wd, i) => (
          <div
            key={wd}
            className={cn(
              "text-left text-[11px] py-2.5 pl-1.5 md:pl-2 leading-relaxed",
              "tracking-[0.08em]",
              i === 0 || i === 6 ? "text-destructive/70" : "text-muted-foreground/70",
            )}
          >
            {t.weekdaysShort[wd]}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={`${year}-${month}`}
          initial={{
            x: direction > 0 ? 80 : direction < 0 ? -80 : 0,
            opacity: 0,
          }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: direction > 0 ? -80 : 80, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="grid grid-cols-7 gap-px rounded-2xl border border-border/70 bg-border/15 p-px"
        >
          {cells.map((day, index) => {
            if (!day) {
              return (
                <div
                  key={`blank-${index}`}
                  className="bg-card/55 h-[78px] md:h-[108px] overflow-hidden"
                />
              )
            }

            const isToday = day.jdn === todayJdn
            const isSelected = day.jdn === selectedJdn
            const isSunday = day.weekday === 1
            const isSaturday = day.weekday === 0
            const hasHoliday = day.holidays.length > 0
            const isFullMoon = day.moonPhase === 1
            const isHolidayFullMoon = isFullMoon && hasHoliday
            const isNewMoon = day.moonPhase === 3

            const monthName = t.myanmarMonths[day.myanmar.mm] ?? day.monthName

            const myanmarLabel =
              day.fortnightDay === 1 && day.moonPhase === 0
                ? `${monthName} ${t.moonPhases[0]} ${t.formatNumber(1)}`
                : isFullMoon
                  ? `${monthName} ${t.moonPhases[1]}`
                  : isNewMoon
                    ? `${monthName} ${t.moonPhases[3]}`
                    : `${t.moonPhases[day.moonPhase]} ${t.formatNumber(day.fortnightDay)}`

            const holidayLabel = day.holidays[0]
              ? (t.holidays[day.holidays[0]] ?? day.holidays[0])
              : undefined
            const dayNumberLabel = t.formatNumber(day.gregorian.day)
            const circledDigitOffsetClass = getCircledDayDigitOffsetClass(
              dayNumberLabel,
              localeCode,
            )

            return (
              <motion.button
                type="button"
                key={day.jdn}
                onClick={() => onSelectDay(day)}
                whileHover={{ scale: 1.024, y: -1.5, zIndex: 2 }}
                whileTap={{ scale: 0.98 }}
                transition={{
                  type: "spring",
                  stiffness: 270,
                  damping: 24,
                  mass: 0.62,
                }}
                className={cn(
                  "bg-card/78 h-[78px] md:h-[108px] p-1.5 md:p-2 text-left relative group overflow-hidden",
                  "transition-[transform,background-color,box-shadow] duration-300 ease-out will-change-transform",
                  "cursor-pointer",
                  "hover:bg-accent/68 hover:shadow-[0_12px_26px_-16px_rgba(0,0,0,0.65)] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                  isToday && !isSelected && "bg-primary/5",
                  hasHoliday && !isSelected && "bg-destructive/10",
                  isSelected && "bg-primary/10",
                )}
              >
                {/* Selected day indicator */}
                {isSelected && (
                  <motion.div
                    layoutId={`month-selected-indicator-${year}-${month}`}
                    transition={{ type: "spring", stiffness: 430, damping: 34, mass: 0.52 }}
                    className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-primary/80 bg-primary/[0.07]"
                  />
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Gregorian day number */}
                <div
                  className={cn(
                    "relative z-10 flex items-start justify-between gap-0.5 h-7 md:h-9",
                    (isFullMoon || isNewMoon) && "h-9 md:h-11 mb-0.5",
                  )}
                >
                  <span
                    className={cn(
                      "text-xl md:text-2xl leading-none inline-flex items-center justify-center",
                      isHolidayFullMoon &&
                        "bg-[var(--moon-full)] text-white font-bold rounded-full w-7 h-7 md:w-9 md:h-9 text-base md:text-lg",
                      isFullMoon &&
                        !hasHoliday &&
                        "bg-foreground text-background font-bold rounded-full w-7 h-7 md:w-9 md:h-9 text-base md:text-lg",
                      isNewMoon &&
                        "bg-background text-foreground border border-foreground/55 font-bold rounded-full w-7 h-7 md:w-9 md:h-9 text-base md:text-lg",
                      !isFullMoon && !isNewMoon && "font-semibold",
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
                </div>

                {/* Myanmar info */}
                <div className="relative z-10">
                  <p
                    className={cn(
                      "text-[10px] md:text-[11px] leading-relaxed truncate",
                      isHolidayFullMoon
                        ? "text-[var(--moon-full-text)]/70 font-medium"
                        : isFullMoon
                          ? "text-foreground/70"
                          : isNewMoon
                            ? "text-foreground/62"
                            : "text-muted-foreground/70",
                    )}
                  >
                    {myanmarLabel}
                  </p>
                  <p
                    aria-hidden={!holidayLabel}
                    className={cn(
                      "mt-0.5 min-h-[1.1em] text-[10px] md:text-[11px] leading-normal truncate",
                      holidayLabel
                        ? "text-destructive/70"
                        : "select-none pointer-events-none opacity-0",
                    )}
                  >
                    {holidayLabel ?? "\u00A0"}
                  </p>
                </div>

                {/* Sabbath indicator */}
                {day.sabbath === 1 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={springPresets.bouncy}
                    className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-destructive z-10"
                  />
                )}
              </motion.button>
            )
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
