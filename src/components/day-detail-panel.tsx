import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { CalendarDayInfo } from "@/lib/burmese-calendar";
import {
  cal_mahabote,
  cal_nagahle,
  cal_nakhat,
  cal_pyathada,
  cal_yatyaza,
  my2sy,
} from "@/lib/burmese-calendar";
import { detailSectionStagger, springPresets } from "@/lib/animations";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { AnimatedMoon } from "./animated-moon";

const badgeInnerStagger = {
  container: {
    hidden: {},
    visible: { transition: { staggerChildren: 0.03 } },
  },
  item: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: springPresets.snappy },
  },
};

interface DayDetailPanelProps {
  day: CalendarDayInfo;
}

export function DayDetailPanel({ day }: DayDetailPanelProps) {
  const { t } = useI18n();
  const { myanmar, gregorian, moonPhase, fortnightDay, weekday } = day;
  const sasanaYear = my2sy(myanmar.my);
  const mahabote = t.mahabote[cal_mahabote(myanmar.my, weekday) % 7];
  const nakhat = t.nakhat[cal_nakhat(myanmar.my) % 3];
  const nagahle = t.nagahle[cal_nagahle(myanmar.mm) % 4];
  const yatyaza = cal_yatyaza(myanmar.mm, weekday);
  const pyathada = cal_pyathada(myanmar.mm, weekday);

  const allHolidays = [...day.holidays, ...day.holidays2];

  const moonPhaseName = t.moonPhases[moonPhase];
  const monthName = t.myanmarMonths[myanmar.mm] ?? day.monthName;

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
          {/* Header — Myanmar date is primary */}
          <motion.div
            variants={detailSectionStagger.item}
            className="flex items-start gap-3"
          >
            <AnimatedMoon
              phase={moonPhase}
              fortnightDay={fortnightDay}
              size={80}
            />
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-bold tracking-tight leading-relaxed text-foreground">
                {t.gregorianMonths[gregorian.month - 1]}{" "}
                {t.formatNumber(gregorian.day)},{" "}
                {t.formatNumber(gregorian.year)}
              </h3>
              <p className="text-sm text-foreground leading-relaxed">
                {t.weekdays[weekday]}
              </p>
              <p
                className={cn(
                  "text-xs leading-relaxed mt-0.5",
                  moonPhase === 1
                    ? "text-[var(--moon-full-text)]"
                    : moonPhase === 3
                      ? "text-[var(--moon-new-text)]"
                      : "text-muted-foreground",
                )}
              >
                {monthName} {moonPhaseName} {t.formatNumber(fortnightDay)}
              </p>
            </div>
          </motion.div>

          <Separator />

          {/* Myanmar year info — compact row */}
          <motion.div
            variants={detailSectionStagger.item}
            className="flex items-center gap-4 text-sm leading-relaxed"
          >
            <div>
              <span className="text-muted-foreground text-xs leading-relaxed">
                {t.ui.myanmarYear}
              </span>
              <p className="text-foreground leading-relaxed">
                {t.formatNumber(myanmar.my)}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs leading-relaxed">
                {t.ui.sasanaYear}
              </span>
              <p className="text-foreground leading-relaxed">
                {t.formatNumber(sasanaYear)}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs leading-relaxed">
                {t.ui.yearType}
              </span>
              <p className="text-foreground leading-relaxed">
                {t.yearTypes[myanmar.myt]}
              </p>
            </div>
          </motion.div>

          <Separator />

          {/* Astrology details */}
          <motion.div
            variants={detailSectionStagger.item}
            className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm"
          >
            <div>
              <span className="text-muted-foreground text-xs leading-relaxed">
                {t.ui.moonPhase}
              </span>
              <p className="text-foreground leading-relaxed">{moonPhaseName}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs leading-relaxed">
                {t.ui.sabbath}
              </span>
              <p className="text-foreground leading-relaxed">
                {day.sabbath === 1
                  ? (t.astro.Sabbath ?? "Sabbath")
                  : day.sabbath === 2
                    ? (t.astro["Sabbath Eve"] ?? "Sabbath Eve")
                    : "---"}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs leading-relaxed">
                {t.ui.mahabote}
              </span>
              <p className="text-foreground leading-relaxed">{mahabote}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs leading-relaxed">
                {t.ui.nakhat}
              </span>
              <p className="text-foreground leading-relaxed">{nakhat}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs leading-relaxed">
                {t.ui.nagahle}
              </span>
              <p className="text-foreground leading-relaxed">{nagahle}</p>
            </div>
          </motion.div>

          {/* Yatyaza / Pyathada */}
          {(yatyaza || pyathada > 0) && (
            <motion.div variants={detailSectionStagger.item}>
              <Separator className="mb-4" />
              <motion.div
                variants={badgeInnerStagger.container}
                initial="hidden"
                animate="visible"
                className="flex flex-wrap gap-2"
              >
                {yatyaza === 1 && (
                  <motion.div variants={badgeInnerStagger.item}>
                    <Badge
                      variant="secondary"
                      className="bg-chart-2/20 text-chart-2 border-chart-2/30"
                    >
                      {t.astro.Yatyaza ?? "Yatyaza"}
                    </Badge>
                  </motion.div>
                )}
                {pyathada === 1 && (
                  <motion.div variants={badgeInnerStagger.item}>
                    <Badge
                      variant="secondary"
                      className="bg-destructive/15 text-destructive border-destructive/30"
                    >
                      {t.astro.Pyathada ?? "Pyathada"}
                    </Badge>
                  </motion.div>
                )}
                {pyathada === 2 && (
                  <motion.div variants={badgeInnerStagger.item}>
                    <Badge
                      variant="secondary"
                      className="bg-destructive/15 text-destructive border-destructive/30"
                    >
                      {t.astro["Afternoon Pyathada"] ?? "Afternoon Pyathada"}
                    </Badge>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )}

          {/* Holidays */}
          {allHolidays.length > 0 && (
            <motion.div variants={detailSectionStagger.item}>
              <Separator className="mb-4" />
              <h4 className="text-xs font-semibold tracking-wide leading-relaxed text-muted-foreground mb-2">
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
                    <Badge variant="destructive" className="text-xs">
                      {t.holidays[h] ?? h}
                    </Badge>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}

          {/* Astrological */}
          {day.astro.length > 0 && (
            <motion.div variants={detailSectionStagger.item}>
              <Separator className="mb-4" />
              <h4 className="text-xs font-semibold tracking-wide leading-relaxed text-muted-foreground mb-2">
                {t.ui.astroDays}
              </h4>
              <motion.div
                variants={badgeInnerStagger.container}
                initial="hidden"
                animate="visible"
                className="flex flex-wrap gap-2"
              >
                {day.astro.map((a, i) => (
                  <motion.div key={i} variants={badgeInnerStagger.item}>
                    <Badge variant="outline" className="text-xs">
                      {t.astro[a] ?? a}
                    </Badge>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
