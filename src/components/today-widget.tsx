import { Badge } from "@/components/ui/badge"
import type { CalendarDayInfo } from "@/lib/burmese-calendar"
import { my2sy } from "@/lib/burmese-calendar"
import { useI18n } from "@/lib/i18n/context"
import { buildTodayBrief } from "@/lib/today-brief"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { AnimatedMoon } from "./animated-moon"

interface TodayWidgetProps {
  day: CalendarDayInfo
}

export function TodayWidget({ day }: TodayWidgetProps) {
  const { t, localeCode } = useI18n()

  const monthName = t.myanmarMonths[day.myanmar.mm] ?? day.monthName
  const gregorianMonthName = t.gregorianMonths[day.gregorian.month - 1] ?? ""
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
  const gregorianMonthLabel =
    localeCode === "en"
      ? (EN_MONTH_SHORT[day.gregorian.month - 1] ?? gregorianMonthName)
      : gregorianMonthName
  const dailyBrief = buildTodayBrief(day, t)

  return (
    <motion.section
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.16, ease: "easeOut" }}
      className="rounded-2xl border border-border/60 bg-background/45 px-4 py-3"
    >
      <div className="flex items-center justify-between gap-2">
        <p
          className={cn(
            "text-[11px] text-muted-foreground/75",
            localeCode === "en" && "tracking-[0.06em]",
          )}
        >
          {t.ui.today}
        </p>
        <Badge
          variant="outline"
          className="h-5 rounded-full px-2 text-[10px] text-muted-foreground border-border/65 bg-background/60"
        >
          {t.weekdays[day.weekday]}
        </Badge>
      </div>

      <div className="mt-2 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3">
        <AnimatedMoon phase={day.moonPhase} fortnightDay={day.fortnightDay} size={58} />
        <div className="min-w-0">
          <h3 className="truncate whitespace-nowrap text-[clamp(1.05rem,2.1vw,1.25rem)] font-semibold text-foreground leading-tight">
            {gregorianMonthLabel} {t.formatNumber(day.gregorian.day)},{" "}
            {t.formatNumber(day.gregorian.year)}
          </h3>
          <p
            className={cn(
              "text-[0.92rem] mt-0.5 text-muted-foreground/90",
              localeCode === "mm" ? "leading-[1.85]" : "leading-relaxed",
            )}
          >
            {monthName} {t.moonPhases[day.moonPhase]} {t.formatNumber(day.fortnightDay)}
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-background/55 px-2 py-1.5">
          <p className="text-[10px] text-muted-foreground/80">{t.ui.myanmarYear}</p>
          <p className="text-xs text-foreground">{t.formatNumber(day.myanmar.my)}</p>
        </div>
        <div className="rounded-lg bg-background/55 px-2 py-1.5">
          <p className="text-[10px] text-muted-foreground/80">{t.ui.sasanaYear}</p>
          <p className="text-xs text-foreground">{t.formatNumber(my2sy(day.myanmar.my))}</p>
        </div>
        <div className="rounded-lg bg-background/55 px-2 py-1.5">
          <p className="text-[10px] text-muted-foreground/80">{t.ui.yearType}</p>
          <p className="text-xs text-foreground truncate">{t.yearTypes[day.myanmar.myt]}</p>
        </div>
      </div>

      <div className="mt-3">
        <p
          className={cn(
            "text-[10px] text-muted-foreground/75 mb-1.5",
            localeCode === "en" && "tracking-[0.06em]",
          )}
        >
          {localeCode === "mm" ? "နေ့စဉ် အကျဉ်းချုပ်" : "Daily Brief"}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {dailyBrief.map((item) => (
            <Badge
              key={item.key}
              variant="outline"
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] border-border/65 bg-background/60",
                item.tone === "holiday" && "border-destructive/80 bg-destructive/85 text-white",
                item.tone === "warning" &&
                  "text-destructive border-destructive/40 bg-destructive/15",
                item.tone === "good" && "border-chart-2/45 bg-chart-2/14 text-chart-2",
                item.tone === "neutral" && "text-muted-foreground",
              )}
            >
              {item.label}
            </Badge>
          ))}
        </div>
      </div>
    </motion.section>
  )
}
