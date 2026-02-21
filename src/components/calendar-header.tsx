import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ViewMode } from "@/hooks/use-calendar-state";
import { springPresets } from "@/lib/animations";
import { useI18n } from "@/lib/i18n/context";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, ChevronLeft, ChevronRight, Search } from "lucide-react";

interface CalendarHeaderProps {
  year: number;
  month: number;
  view: ViewMode;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
  onViewChange: (view: ViewMode) => void;
  onOpenCommandPalette: () => void;
}

export function CalendarHeader({
  year,
  month,
  view,
  onPrev,
  onNext,
  onToday,
  onYearChange,
  onMonthChange,
  onViewChange,
  onOpenCommandPalette,
}: CalendarHeaderProps) {
  const { t } = useI18n();

  const yearOptions: number[] = [];
  for (let y = 1900; y <= 2200; y++) yearOptions.push(y);

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      {/* Left: Navigation */}
      <div className="flex items-center gap-2">
        <motion.div
          whileTap={{ scale: 0.92 }}
          transition={springPresets.snappy}
        >
          <Button
            variant="outline"
            size="icon"
            onClick={onPrev}
            aria-label="Previous"
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </motion.div>
        <motion.div
          whileTap={{ scale: 0.92 }}
          transition={springPresets.snappy}
        >
          <Button
            variant="outline"
            size="icon"
            onClick={onNext}
            aria-label="Next"
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </motion.div>
        <motion.div
          whileTap={{ scale: 0.92 }}
          transition={springPresets.snappy}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={onToday}
            className="gap-1.5 text-xs leading-relaxed"
          >
            <CalendarDays className="h-3.5 w-3.5" />
            {t.ui.today}
          </Button>
        </motion.div>
        <motion.div
          whileTap={{ scale: 0.92 }}
          transition={springPresets.snappy}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenCommandPalette}
            className="h-8 w-8 ml-1"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>

      {/* Center: Month/Year display */}
      <h2 className="text-xl md:text-2xl font-bold text-foreground tracking-tight leading-relaxed order-first md:order-none overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.span
            key={view === "year" ? `${year}` : `${year}-${month}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="inline-block"
          >
            {view !== "year" && <>{t.gregorianMonths[month - 1]} </>}
            <span
              className={
                view !== "year" ? "text-muted-foreground font-normal" : ""
              }
            >
              {t.formatNumber(year)}
            </span>
          </motion.span>
        </AnimatePresence>
      </h2>

      {/* Right: Selectors + view switch */}
      <div className="flex items-center gap-2">
        <Select
          value={month.toString()}
          onValueChange={(val) => onMonthChange(Number.parseInt(val))}
        >
          <SelectTrigger className="w-[140px] h-9 text-xs leading-relaxed border-0 bg-transparent shadow-none hover:bg-accent/50 transition-colors">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {t.gregorianMonths.map((name, i) => (
              <SelectItem key={i} value={(i + 1).toString()}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={year.toString()}
          onValueChange={(val) => onYearChange(Number.parseInt(val))}
        >
          <SelectTrigger className="w-[100px] h-9 text-xs leading-relaxed border-0 bg-transparent shadow-none hover:bg-accent/50 transition-colors">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-[240px]">
            {yearOptions.map((y) => (
              <SelectItem key={y} value={y.toString()}>
                {t.formatNumber(y)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Tabs value={view} onValueChange={(v) => onViewChange(v as ViewMode)}>
          <TabsList className="h-9">
            <TabsTrigger value="month" className="text-xs px-3 leading-relaxed">
              {t.ui.monthView}
            </TabsTrigger>
            <TabsTrigger value="week" className="text-xs px-3 leading-relaxed">
              {t.ui.weekView}
            </TabsTrigger>
            <TabsTrigger value="year" className="text-xs px-3 leading-relaxed">
              {t.ui.yearView}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
