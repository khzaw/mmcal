import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ViewMode } from "@/hooks/use-calendar-state"
import { springPresets } from "@/lib/animations"
import { useI18n } from "@/lib/i18n/context"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"
import { CalendarDays, ChevronLeft, ChevronRight, Printer, Search } from "lucide-react"

interface CalendarHeaderProps {
  year: number
  month: number
  view: ViewMode
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  onYearChange: (year: number) => void
  onMonthChange: (month: number) => void
  onViewChange: (view: ViewMode) => void
  onOpenCommandPalette: () => void
  onPrint: () => void
}

const yearOptions = Array.from({ length: 301 }, (_, i) => 1900 + i)

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
  onPrint,
}: CalendarHeaderProps) {
  const { t, localeCode } = useI18n()

  return (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight leading-tight overflow-hidden">
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
              className={cn(
                view !== "year" ? "text-muted-foreground font-normal" : "",
                localeCode === "en" && "tracking-[-0.01em]",
              )}
            >
              {t.formatNumber(year)}
            </span>
          </motion.span>
        </AnimatePresence>
      </h2>

      <div className="print:hidden flex flex-col items-start xl:items-end gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center rounded-xl border border-border/70 bg-card/60 overflow-hidden">
            <motion.div whileTap={{ scale: 0.92 }} transition={springPresets.snappy}>
              <Button
                variant="ghost"
                size="icon"
                onClick={onPrev}
                aria-label="Previous"
                className="h-10 w-10 rounded-none border-0 hover:bg-accent/70"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </motion.div>
            <motion.div whileTap={{ scale: 0.92 }} transition={springPresets.snappy}>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToday}
                className={cn(
                  "h-10 rounded-none border-x border-border/70 px-4 gap-1.5 text-xs",
                  localeCode === "en" && "tracking-[0.06em]",
                )}
              >
                <CalendarDays className="h-3.5 w-3.5" />
                {t.ui.today}
              </Button>
            </motion.div>
            <motion.div whileTap={{ scale: 0.92 }} transition={springPresets.snappy}>
              <Button
                variant="ghost"
                size="icon"
                onClick={onNext}
                aria-label="Next"
                className="h-10 w-10 rounded-none border-0 hover:bg-accent/70"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>

          <Select
            value={month.toString()}
            onValueChange={(val) => onMonthChange(Number.parseInt(val))}
          >
            <SelectTrigger className="w-[150px] h-10 text-xs rounded-xl border-border/70 bg-card/60 hover:bg-accent/60 transition-colors">
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
            <SelectTrigger className="w-[110px] h-10 text-xs rounded-xl border-border/70 bg-card/60 hover:bg-accent/60 transition-colors">
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

          <motion.div whileTap={{ scale: 0.92 }} transition={springPresets.snappy}>
            <Button
              variant="ghost"
              size="icon"
              onClick={onOpenCommandPalette}
              className="h-10 w-10 rounded-xl border border-border/70 bg-card/60 hover:bg-accent/70"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </Button>
          </motion.div>

          <motion.div whileTap={{ scale: 0.92 }} transition={springPresets.snappy}>
            <Button
              variant="ghost"
              size="icon"
              onClick={onPrint}
              className="h-10 w-10 rounded-xl border border-border/70 bg-card/60 hover:bg-accent/70"
              aria-label={t.ui.print ?? "Print"}
            >
              <Printer className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>

        <Tabs value={view} onValueChange={(v) => onViewChange(v as ViewMode)}>
          <TabsList className="h-10 rounded-xl border border-border/70 bg-card/60 p-1">
            <TabsTrigger
              value="month"
              className={cn(
                "text-xs px-3 leading-relaxed",
                localeCode === "en" && "tracking-[0.06em]",
              )}
            >
              {t.ui.monthView}
            </TabsTrigger>
            <TabsTrigger
              value="week"
              className={cn(
                "text-xs px-3 leading-relaxed",
                localeCode === "en" && "tracking-[0.06em]",
              )}
            >
              {t.ui.weekView}
            </TabsTrigger>
            <TabsTrigger
              value="year"
              className={cn(
                "text-xs px-3 leading-relaxed",
                localeCode === "en" && "tracking-[0.06em]",
              )}
            >
              {t.ui.yearView}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  )
}
