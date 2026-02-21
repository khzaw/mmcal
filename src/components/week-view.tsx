import type { CalendarDayInfo } from "@/lib/burmese-calendar";
import {
  cal_pyathada,
  cal_yatyaza,
  getDayInfo,
  w2j,
} from "@/lib/burmese-calendar";
import { springPresets } from "@/lib/animations";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo } from "react";
import { MoonPhaseIcon } from "./moon-phase-icon";

interface WeekViewProps {
  year: number;
  month: number;
  day: number;
  selectedJdn: number | null;
  onSelectDay: (day: CalendarDayInfo) => void;
  todayJdn: number;
  direction?: number;
}

export function WeekView({
  year,
  month,
  day,
  selectedJdn,
  onSelectDay,
  todayJdn,
  direction = 0,
}: WeekViewProps) {
  const { t } = useI18n();

  const weekDays = useMemo(() => {
    const centerJdn = Math.round(w2j(year, month, day));
    // Find the Sunday (weekday=1) that starts the week containing this day
    const info = getDayInfo(centerJdn);
    const sundayOffset = (info.weekday + 6) % 7; // Sun=0, Mon=1, ..., Sat=6
    const startJdn = centerJdn - sundayOffset;
    const days: CalendarDayInfo[] = [];
    for (let i = 0; i < 7; i++) {
      days.push(getDayInfo(startJdn + i));
    }
    return days;
  }, [year, month, day]);

  return (
    <div className="w-full">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={weekDays[0]?.jdn}
          initial={{
            x: direction > 0 ? 80 : direction < 0 ? -80 : 0,
            opacity: 0,
          }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: direction > 0 ? -80 : 80, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="grid grid-cols-1 md:grid-cols-7 md:grid-rows-1 gap-px bg-border/10 rounded-lg overflow-hidden md:min-h-[580px]"
        >
          {weekDays.map((d) => {
            const isToday = d.jdn === todayJdn;
            const isSelected = d.jdn === selectedJdn;
            const isSunday = d.weekday === 1;
            const isSaturday = d.weekday === 0;
            const hasHoliday = d.holidays.length > 0;
            const isFullMoon = d.moonPhase === 1;
            const isNewMoon = d.moonPhase === 3;

            const monthName = t.myanmarMonths[d.myanmar.mm] ?? d.monthName;
            const moonPhaseName = t.moonPhases[d.moonPhase];
            const allHolidays = [...d.holidays, ...d.holidays2];
            const yatyaza = cal_yatyaza(d.myanmar.mm, d.weekday);
            const pyathada = cal_pyathada(d.myanmar.mm, d.weekday);

            return (
              <motion.button
                type="button"
                key={d.jdn}
                onClick={() => onSelectDay(d)}
                className={cn(
                  "bg-card px-3 py-2.5 md:p-3 text-left transition-colors relative overflow-hidden",
                  "flex flex-col",
                  "hover:bg-accent/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                  isToday && !isSelected && "bg-primary/5",
                  hasHoliday && !isSelected && "bg-destructive/10",
                  isSelected && "bg-accent/15",
                )}
              >
                {/* Selected day indicator */}
                {isSelected && (
                  <div className="absolute inset-y-0 left-0 w-[3px] md:inset-x-0 md:inset-y-auto md:top-0 md:w-auto md:h-[3px] bg-primary" />
                )}

                {/* === Mobile layout (hidden on md+) === */}
                <div className="flex md:hidden items-center gap-3 w-full min-w-0">
                  {/* Weekday + date */}
                  <div className="shrink-0 flex items-center gap-2 w-24">
                    <span
                      className={cn(
                        "text-[11px] font-medium w-14 truncate",
                        isSunday || isSaturday
                          ? "text-destructive"
                          : "text-muted-foreground",
                      )}
                    >
                      {t.weekdaysShort[d.weekday]}
                    </span>
                    <span
                      className={cn(
                        "text-sm font-semibold tabular-nums",
                        isFullMoon && "text-[var(--moon-full-text)]",
                        isNewMoon && "text-[var(--moon-new-text)]",
                        !isFullMoon &&
                          !isNewMoon &&
                          (isSunday || isSaturday || hasHoliday) &&
                          "text-destructive",
                        isToday &&
                          "text-primary underline underline-offset-2 decoration-2 decoration-primary",
                      )}
                    >
                      {t.formatNumber(d.gregorian.day)}
                    </span>
                    <MoonPhaseIcon phase={d.moonPhase} size={14} />
                  </div>

                  {/* Myanmar info */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-[11px] leading-snug truncate",
                        isFullMoon
                          ? "text-[var(--moon-full-text)]/70"
                          : isNewMoon
                            ? "text-[var(--moon-new-text)]/60"
                            : "text-muted-foreground/70",
                      )}
                    >
                      {monthName} {moonPhaseName}{" "}
                      {t.formatNumber(d.fortnightDay)}
                    </p>
                  </div>

                  {/* Tags (right-aligned) */}
                  <div className="shrink-0 flex flex-wrap gap-1 justify-end max-w-[40%]">
                    {allHolidays.slice(0, 1).map((h, i) => (
                      <span
                        key={i}
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
                    {d.astro.slice(0, 1).map((a, i) => (
                      <span
                        key={i}
                        className="text-[9px] text-muted-foreground/60 bg-secondary rounded px-1"
                      >
                        {t.astro[a] ?? a}
                      </span>
                    ))}
                  </div>
                </div>

                {/* === Desktop layout (hidden below md) === */}
                <div className="hidden md:contents">
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
                        isFullMoon &&
                          "bg-[var(--moon-full)] text-white font-bold rounded-full w-8 h-8",
                        isNewMoon &&
                          "bg-foreground text-background font-bold rounded-full w-8 h-8",
                        !isFullMoon && !isNewMoon && "text-lg font-semibold",
                        !isFullMoon &&
                          !isNewMoon &&
                          (isSunday || isSaturday || hasHoliday) &&
                          "text-destructive",
                        isToday &&
                          !isFullMoon &&
                          !isNewMoon &&
                          "text-primary font-bold underline underline-offset-4 decoration-2 decoration-primary",
                        isToday &&
                          (isFullMoon || isNewMoon) &&
                          "ring-2 ring-primary ring-offset-1 ring-offset-card",
                      )}
                    >
                      {t.formatNumber(d.gregorian.day)}
                    </span>
                    {!isFullMoon && !isNewMoon && (
                      <MoonPhaseIcon phase={d.moonPhase} size={16} />
                    )}
                  </div>

                  {/* Myanmar date */}
                  <div className="space-y-0.5 text-xs flex-1">
                    <p className="text-muted-foreground/80 text-[11px] leading-relaxed">
                      {monthName}
                    </p>
                    <p
                      className={cn(
                        "text-[11px] leading-relaxed",
                        isFullMoon
                          ? "text-[var(--moon-full-text)] font-medium"
                          : isNewMoon
                            ? "text-[var(--moon-new-text)]"
                            : "text-muted-foreground",
                      )}
                    >
                      {moonPhaseName} {t.formatNumber(d.fortnightDay)}
                    </p>
                  </div>

                  {/* Holidays + astro */}
                  <div className="mt-auto">
                    {allHolidays.length > 0 && (
                      <div className="md:pt-2 space-y-0.5">
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
                      <div className="mt-1 flex flex-wrap gap-1 justify-end md:justify-start">
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
                            {t.astro["Afternoon Pyathada"] ??
                              "Afternoon Pyathada"}
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
                </div>

                {/* Sabbath indicator */}
                {d.sabbath === 1 && (
                  <div className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-destructive" />
                )}
              </motion.button>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
