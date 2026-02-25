import { gridCardStagger, springPresets } from "@/lib/animations"
import { getGregorianMonthDays } from "@/lib/burmese-calendar"
import type { CalendarDayInfo } from "@/lib/burmese-calendar"
import { useI18n } from "@/lib/i18n/context"
import { cn } from "@/lib/utils"
import { getDayHeatBucket } from "@/lib/year-heatmap"
import { AnimatePresence, motion } from "framer-motion"
import { useMemo, useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs"

interface YearViewProps {
  year: number
  selectedJdn: number | null
  todayJdn: number
  onSelectDay: (day: CalendarDayInfo) => void
  onGoToMonth: (month: number) => void
}

interface MiniMonthProps {
  year: number
  month: number
  selectedJdn: number | null
  todayJdn: number
  onSelectDay: (day: CalendarDayInfo) => void
  onDoubleClickDay: () => void
  onHeaderClick: () => void
}

type YearLayoutMode = "calendar" | "heatmap"

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

const HEAT_BUCKET_CLASS: Record<number, string> = {
  0: "bg-background/55 border-border/55",
  1: "bg-primary/15 border-primary/25",
  2: "bg-chart-2/18 border-chart-2/40",
  3: "bg-[var(--moon-full)]/22 border-[var(--moon-full)]/50",
  4: "bg-destructive/28 border-destructive/60",
}

function MiniMonth({
  year,
  month,
  selectedJdn,
  todayJdn,
  onSelectDay,
  onDoubleClickDay,
  onHeaderClick,
}: MiniMonthProps) {
  const { t } = useI18n()
  const days = useMemo(() => getGregorianMonthDays(year, month), [year, month])

  const firstDayWeekday = days[0]?.weekday ?? 0
  const blanks = (firstDayWeekday + 6) % 7 // Sunday-first display column
  const cells: (CalendarDayInfo | null)[] = [...Array(blanks).fill(null), ...days]
  while (cells.length % 7 !== 0) cells.push(null)

  // Algorithm weekday indices in Sunday-first order
  const SUNDAY_FIRST = [1, 2, 3, 4, 5, 6, 0]

  return (
    <div className="p-2">
      <button
        type="button"
        onClick={onHeaderClick}
        className="text-xs font-semibold text-foreground hover:text-primary transition-colors mb-1.5 block leading-relaxed"
      >
        {t.gregorianMonths[month - 1]}
      </button>
      <div className="grid grid-cols-7 gap-0">
        {SUNDAY_FIRST.map((wd, i) => (
          <div
            key={wd}
            className={cn(
              "text-center text-[8px] font-medium py-0.5",
              i === 0 || i === 6 ? "text-destructive/70" : "text-muted-foreground/70",
            )}
          >
            {(t.weekdaysShort[wd] ?? "").charAt(0)}
          </div>
        ))}
        {cells.map((day, index) => {
          if (!day) return <div key={`b-${index}`} className="w-full aspect-square" />

          const isToday = day.jdn === todayJdn
          const isSelected = day.jdn === selectedJdn
          const isFullMoon = day.moonPhase === 1
          const isNewMoon = day.moonPhase === 3
          const isSunday = day.weekday === 1
          const isSaturday = day.weekday === 0
          const hasHoliday = day.holidays.length > 0
          const isHolidayFullMoon = isFullMoon && hasHoliday

          return (
            <button
              type="button"
              key={day.jdn}
              onClick={(e) => {
                e.stopPropagation()
                onSelectDay(day)
              }}
              onDoubleClick={(e) => {
                e.stopPropagation()
                onDoubleClickDay()
              }}
              className={cn(
                "w-full aspect-square flex items-center justify-center text-[9px] rounded-sm transition-colors relative",
                "cursor-pointer",
                "hover:bg-accent/60",
                isSelected && "bg-primary text-primary-foreground",
                isToday && !isSelected && "ring-1 ring-primary",
                (isSunday || isSaturday || hasHoliday) && !isSelected && "text-destructive",
              )}
            >
              {t.formatNumber(day.gregorian.day)}
              {isFullMoon && !isSelected && (
                <span
                  className={cn(
                    "absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full",
                    isHolidayFullMoon ? "bg-[var(--moon-full)]" : "bg-foreground",
                  )}
                />
              )}
              {isNewMoon && !isSelected && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-background ring-1 ring-foreground/70" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function YearHeatmap({ year, selectedJdn, todayJdn, onSelectDay, onGoToMonth }: YearViewProps) {
  const { t, localeCode } = useI18n()

  const rows = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        days: getGregorianMonthDays(year, i + 1),
      })),
    [year],
  )

  const heatLegend = [
    localeCode === "mm" ? "သာမန်" : "Calm",
    localeCode === "mm" ? "နည်း" : "Low",
    localeCode === "mm" ? "အသင့်" : "Moderate",
    localeCode === "mm" ? "မြင့်" : "High",
    localeCode === "mm" ? "ထူးခြား" : "Peak",
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.16, ease: "easeOut" }}
      className="rounded-2xl border border-border/65 bg-card/75 p-3 md:p-4"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground/80">
          {localeCode === "mm" ? "နှစ်အလိုက် ထူးခြားရက်များ" : "Year signal heatmap"}
        </p>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i} className="inline-flex items-center gap-1">
              <span className={cn("h-2 w-2 rounded-[3px] border", HEAT_BUCKET_CLASS[i])} />
              {heatLegend[i]}
            </span>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto pb-1">
        <div className="min-w-[740px] space-y-1.5">
          {rows.map((row) => {
            const monthLabel =
              localeCode === "en"
                ? (EN_MONTH_SHORT[row.month - 1] ?? t.gregorianMonths[row.month - 1])
                : (t.gregorianMonths[row.month - 1] ?? "")

            return (
              <div
                key={row.month}
                className="grid grid-cols-[70px_minmax(0,1fr)] items-center gap-2"
              >
                <button
                  type="button"
                  onClick={() => onGoToMonth(row.month)}
                  className="text-left text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  {monthLabel}
                </button>
                <div className="grid grid-cols-31 gap-[3px]">
                  {Array.from({ length: 31 }, (_, dayIndex) => {
                    const day = row.days[dayIndex]
                    if (!day) {
                      return (
                        <span
                          key={`blank-${row.month}-${dayIndex}`}
                          className="h-3.5 md:h-4 rounded-[4px] bg-transparent"
                        />
                      )
                    }

                    const bucket = getDayHeatBucket(day)
                    const isSelected = day.jdn === selectedJdn
                    const isToday = day.jdn === todayJdn
                    const holiday = day.holidays[0] ?? day.holidays2[0]
                    const summaryParts = [
                      `${t.gregorianMonths[day.gregorian.month - 1]} ${t.formatNumber(day.gregorian.day)}`,
                      `${t.moonPhases[day.moonPhase]} ${t.formatNumber(day.fortnightDay)}`,
                      holiday ? (t.holidays[holiday] ?? holiday) : "",
                    ].filter(Boolean)

                    return (
                      <button
                        type="button"
                        key={day.jdn}
                        onClick={() => onSelectDay(day)}
                        onDoubleClick={() => onGoToMonth(day.gregorian.month)}
                        title={summaryParts.join(" • ")}
                        className={cn(
                          "relative h-3.5 md:h-4 rounded-[4px] border transition-all duration-200",
                          "cursor-pointer hover:scale-[1.28] hover:z-10 hover:shadow-[0_8px_22px_-14px_rgba(0,0,0,0.8)]",
                          HEAT_BUCKET_CLASS[bucket],
                          isSelected && "ring-1 ring-primary/85 ring-offset-1 ring-offset-card",
                        )}
                        aria-label={summaryParts.join(" ")}
                      >
                        {isToday && (
                          <span className="absolute inset-0 m-auto h-1 w-1 rounded-full bg-primary/80" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}

export function YearView({ year, selectedJdn, todayJdn, onSelectDay, onGoToMonth }: YearViewProps) {
  const { t, localeCode } = useI18n()
  const [mode, setMode] = useState<YearLayoutMode>("calendar")

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-end">
        <Tabs
          value={mode}
          onValueChange={(value) => setMode(value as YearLayoutMode)}
          className="gap-0"
        >
          <TabsList className="h-9 rounded-xl border border-border/70 bg-card/60 p-1">
            <TabsTrigger
              value="calendar"
              className={cn("text-xs px-3", localeCode === "en" && "tracking-[0.05em]")}
            >
              {t.ui.calendarGrid ?? "Calendar"}
            </TabsTrigger>
            <TabsTrigger
              value="heatmap"
              className={cn("text-xs px-3", localeCode === "en" && "tracking-[0.05em]")}
            >
              {t.ui.heatmapView ?? "Heatmap"}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <AnimatePresence mode="wait">
        {mode === "calendar" ? (
          <motion.div
            key="calendar-grid"
            variants={gridCardStagger.container}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -8 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <motion.div
                key={i}
                variants={gridCardStagger.item}
                whileHover={{
                  scale: 1.02,
                  y: -2,
                  boxShadow: "0 18px 30px -22px rgba(0,0,0,0.9)",
                }}
                transition={springPresets.snappy}
                className="bg-card/75 rounded-xl border border-border/60 p-1"
              >
                <MiniMonth
                  year={year}
                  month={i + 1}
                  selectedJdn={selectedJdn}
                  todayJdn={todayJdn}
                  onSelectDay={onSelectDay}
                  onDoubleClickDay={() => onGoToMonth(i + 1)}
                  onHeaderClick={() => onGoToMonth(i + 1)}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <YearHeatmap
            key="year-heatmap"
            year={year}
            selectedJdn={selectedJdn}
            todayJdn={todayJdn}
            onSelectDay={onSelectDay}
            onGoToMonth={onGoToMonth}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
