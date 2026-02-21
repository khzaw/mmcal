import { getGregorianMonthDays } from "@/lib/burmese-calendar";
import type { CalendarDayInfo } from "@/lib/burmese-calendar";
import { gridCardStagger, springPresets } from "@/lib/animations";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useMemo } from "react";

interface YearViewProps {
  year: number;
  selectedJdn: number | null;
  todayJdn: number;
  onSelectDay: (day: CalendarDayInfo) => void;
  onGoToMonth: (month: number) => void;
}

interface MiniMonthProps {
  year: number;
  month: number;
  selectedJdn: number | null;
  todayJdn: number;
  onSelectDay: (day: CalendarDayInfo) => void;
  onDoubleClickDay: () => void;
  onHeaderClick: () => void;
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
  const { t } = useI18n();
  const days = useMemo(() => getGregorianMonthDays(year, month), [year, month]);

  const firstDayWeekday = days[0]?.weekday ?? 0;
  const blanks = (firstDayWeekday + 6) % 7; // Sunday-first display column
  const cells: (CalendarDayInfo | null)[] = [
    ...Array(blanks).fill(null),
    ...days,
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  // Algorithm weekday indices in Sunday-first order
  const SUNDAY_FIRST = [1, 2, 3, 4, 5, 6, 0];

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
              i === 0 || i === 6
                ? "text-destructive/70"
                : "text-muted-foreground/70",
            )}
          >
            {(t.weekdaysShort[wd] ?? "").charAt(0)}
          </div>
        ))}
        {cells.map((day, index) => {
          if (!day)
            return <div key={`b-${index}`} className="w-full aspect-square" />;

          const isToday = day.jdn === todayJdn;
          const isSelected = day.jdn === selectedJdn;
          const isFullMoon = day.moonPhase === 1;
          const isNewMoon = day.moonPhase === 3;
          const isSunday = day.weekday === 1;
          const isSaturday = day.weekday === 0;
          const hasHoliday = day.holidays.length > 0;

          return (
            <button
              type="button"
              key={day.jdn}
              onClick={(e) => {
                e.stopPropagation();
                onSelectDay(day);
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                onDoubleClickDay();
              }}
              className={cn(
                "w-full aspect-square flex items-center justify-center text-[9px] rounded-sm transition-colors relative",
                "hover:bg-accent/60",
                isSelected && "bg-primary text-primary-foreground",
                isToday && !isSelected && "ring-1 ring-primary",
                (isSunday || isSaturday || hasHoliday) &&
                  !isSelected &&
                  "text-destructive",
              )}
            >
              {t.formatNumber(day.gregorian.day)}
              {isFullMoon && !isSelected && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--moon-full)]" />
              )}
              {isNewMoon && !isSelected && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-foreground" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function YearView({
  year,
  selectedJdn,
  todayJdn,
  onSelectDay,
  onGoToMonth,
}: YearViewProps) {
  return (
    <motion.div
      variants={gridCardStagger.container}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2"
    >
      {Array.from({ length: 12 }, (_, i) => (
        <motion.div
          key={i}
          variants={gridCardStagger.item}
          whileHover={{ scale: 1.02, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
          transition={springPresets.snappy}
          className="bg-card rounded-lg border border-border/40 p-1"
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
  );
}
