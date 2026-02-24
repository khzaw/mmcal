import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { detailSectionStagger, springPresets } from "@/lib/animations"
import type { CalendarDayInfo } from "@/lib/burmese-calendar"
import {
  cal_mahabote,
  cal_nagahle,
  cal_nakhat,
  cal_pyathada,
  cal_yatyaza,
  my2sy,
} from "@/lib/burmese-calendar"
import { useI18n } from "@/lib/i18n/context"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"
import { AnimatedMoon } from "./animated-moon"

const badgeInnerStagger = {
  container: {
    hidden: {},
    visible: { transition: { staggerChildren: 0.03 } },
  },
  item: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: springPresets.snappy },
  },
}

interface DayDetailPanelProps {
  day: CalendarDayInfo
}

export function DayDetailPanel({ day }: DayDetailPanelProps) {
  const { t, localeCode } = useI18n()
  const { myanmar, gregorian, moonPhase, fortnightDay, weekday } = day
  const sasanaYear = my2sy(myanmar.my)
  const mahabote = t.mahabote[cal_mahabote(myanmar.my, weekday) % 7]
  const nakhat = t.nakhat[cal_nakhat(myanmar.my) % 3]
  const nagahle = t.nagahle[cal_nagahle(myanmar.mm) % 4]
  const yatyaza = cal_yatyaza(myanmar.mm, weekday)
  const pyathada = cal_pyathada(myanmar.mm, weekday)

  const allHolidays = [...day.holidays, ...day.holidays2]

  const moonPhaseName = t.moonPhases[moonPhase]
  const gregorianMonthName = t.gregorianMonths[gregorian.month - 1] ?? ""
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
      ? (EN_MONTH_SHORT[gregorian.month - 1] ?? gregorianMonthName)
      : gregorianMonthName
  const monthName = t.myanmarMonths[myanmar.mm] ?? day.monthName
  const sabbathLabel =
    day.sabbath === 1
      ? (t.astro.Sabbath ?? "Sabbath")
      : day.sabbath === 2
        ? (t.astro["Sabbath Eve"] ?? "Sabbath Eve")
        : "---"

  const detailRows = [
    { label: t.ui.myanmarYear, value: `${t.formatNumber(myanmar.my)} ${t.ui.me}` },
    { label: t.ui.sasanaYear, value: `${t.formatNumber(sasanaYear)} ${t.ui.be}` },
    { label: t.ui.yearType, value: t.yearTypes[myanmar.myt] },
    { label: t.ui.moonPhase, value: moonPhaseName },
    { label: t.ui.mahabote, value: mahabote },
    { label: t.ui.nakhat, value: nakhat },
    { label: t.ui.nagahle, value: nagahle },
    { label: t.ui.sabbath, value: sabbathLabel },
  ]

  const astroBadges = [
    ...(yatyaza === 1 ? [t.astro.Yatyaza ?? "Yatyaza"] : []),
    ...(pyathada === 1 ? [t.astro.Pyathada ?? "Pyathada"] : []),
    ...(pyathada === 2 ? [t.astro["Afternoon Pyathada"] ?? "Afternoon Pyathada"] : []),
    ...day.astro.map((a) => t.astro[a] ?? a),
  ]

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={day.jdn}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.15 }}
      >
        <motion.div
          variants={detailSectionStagger.container}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          <motion.div
            variants={detailSectionStagger.item}
            className="rounded-2xl bg-background/45 px-4 pt-2.5 pb-4 md:px-5 md:pt-3"
          >
            <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4">
              <AnimatedMoon phase={moonPhase} fortnightDay={fortnightDay} size={88} />
              <div className="min-w-0">
                <p
                  className={cn(
                    "text-[10px] md:text-[11px] text-muted-foreground/65",
                    localeCode === "en" && "uppercase tracking-[0.16em]",
                  )}
                >
                  {t.weekdays[weekday]}
                </p>
                <h3
                  className={cn(
                    "mt-1 min-w-0 text-foreground tracking-tight",
                    localeCode === "mm" ? "leading-[1.3]" : "leading-[1.08]",
                  )}
                >
                  <span className="block min-w-0 truncate whitespace-nowrap text-[clamp(1.3rem,2.9vw,1.8rem)] font-semibold">
                    {gregorianMonthLabel} {t.formatNumber(gregorian.day)}
                    {localeCode === "en" && ","}
                  </span>
                  <span className="mt-1 block whitespace-nowrap text-[clamp(0.9rem,1.8vw,1.15rem)] font-normal tabular-nums text-muted-foreground/48">
                    {t.formatNumber(gregorian.year)}
                  </span>
                </h3>
                <p
                  className={cn(
                    "mt-2 text-[clamp(0.95rem,1.9vw,1.05rem)]",
                    localeCode === "mm"
                      ? "w-full whitespace-normal break-words leading-[1.95]"
                      : "w-full overflow-hidden text-ellipsis whitespace-nowrap leading-relaxed",
                    moonPhase === 1
                      ? "text-[var(--moon-full-text)]/85"
                      : moonPhase === 3
                        ? "text-[var(--moon-new-text)]/85"
                        : "text-muted-foreground/90",
                  )}
                >
                  {monthName} {moonPhaseName} {t.formatNumber(fortnightDay)}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={detailSectionStagger.item}
            className="rounded-2xl bg-background/35 p-4"
          >
            {detailRows.map((row, idx) => (
              <div key={row.label}>
                <div className="flex items-center justify-between gap-4 py-2">
                  <span
                    className={cn(
                      "text-xs text-muted-foreground",
                      localeCode === "en" && "uppercase tracking-[0.14em]",
                    )}
                  >
                    {row.label}
                  </span>
                  <span className="min-w-0 max-w-[58%] break-words text-sm text-foreground text-right">
                    {row.value}
                  </span>
                </div>
                {idx < detailRows.length - 1 && <Separator />}
              </div>
            ))}
          </motion.div>

          {astroBadges.length > 0 && (
            <motion.div variants={detailSectionStagger.item}>
              <h4
                className={cn(
                  "text-xs mb-2 text-muted-foreground",
                  localeCode === "en" && "uppercase tracking-[0.16em]",
                )}
              >
                {t.ui.astroDays}
              </h4>
              <motion.div
                variants={badgeInnerStagger.container}
                initial="hidden"
                animate="visible"
                className="flex flex-wrap gap-2"
              >
                {astroBadges.map((astroLabel, i) => (
                  <motion.div key={`${astroLabel}-${i}`} variants={badgeInnerStagger.item}>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs rounded-full border-border/70 bg-secondary/35",
                        astroLabel === (t.astro.Pyathada ?? "Pyathada") ||
                          astroLabel === (t.astro["Afternoon Pyathada"] ?? "Afternoon Pyathada")
                          ? "text-destructive border-destructive/40 bg-destructive/15"
                          : "",
                      )}
                    >
                      {astroLabel}
                    </Badge>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}

          {allHolidays.length > 0 && (
            <motion.div variants={detailSectionStagger.item}>
              <h4
                className={cn(
                  "text-xs mb-2 text-muted-foreground",
                  localeCode === "en" && "uppercase tracking-[0.16em]",
                )}
              >
                {t.ui.holidays}
              </h4>
              <motion.div
                variants={badgeInnerStagger.container}
                initial="hidden"
                animate="visible"
                className="flex flex-wrap gap-2"
              >
                {allHolidays.map((h, i) => (
                  <motion.div key={i} variants={badgeInnerStagger.item}>
                    <Badge
                      variant="destructive"
                      className="text-xs rounded-full border-destructive/80 bg-destructive/85 text-white dark:bg-destructive/90 dark:text-white"
                    >
                      {t.holidays[h] ?? h}
                    </Badge>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
