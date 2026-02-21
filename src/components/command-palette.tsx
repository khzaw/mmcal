import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { ViewMode } from "@/hooks/use-calendar-state";
import { commandItemStagger } from "@/lib/animations";
import { useI18n } from "@/lib/i18n/context";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Command } from "cmdk";
import { motion } from "framer-motion";
import { CalendarDays, Eye, Globe, Search } from "lucide-react";
import { useCallback, useState } from "react";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onGoToDate: (year: number, month: number, day: number) => void;
  onSetView: (view: ViewMode) => void;
  onToday: () => void;
  onToggleLocale: () => void;
}

export function CommandPalette({
  open,
  onClose,
  onGoToDate,
  onSetView,
  onToday,
  onToggleLocale,
}: CommandPaletteProps) {
  const { t, localeCode } = useI18n();
  const [search, setSearch] = useState("");

  const handleSelect = useCallback(
    (value: string) => {
      if (value === "today") {
        onToday();
      } else if (value === "month" || value === "week" || value === "year") {
        onSetView(value);
      } else if (value === "toggle-locale") {
        onToggleLocale();
      } else if (value.startsWith("date:")) {
        const parts = value.replace("date:", "").split("-");
        if (parts.length === 3) {
          onGoToDate(Number(parts[0]), Number(parts[1]), Number(parts[2]));
        }
      }
      setSearch("");
      onClose();
    },
    [onToday, onSetView, onToggleLocale, onGoToDate, onClose],
  );

  // Try to parse search as a date
  const parsedDate = tryParseDate(search);

  const itemClass =
    "flex items-center gap-2.5 px-3 py-2 text-sm leading-relaxed rounded-md cursor-pointer transition-colors text-foreground data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="p-0 gap-0 max-w-md overflow-hidden bg-card border-border"
        showCloseButton={false}
      >
        <VisuallyHidden>
          <DialogTitle>{t.ui.goToDate}</DialogTitle>
        </VisuallyHidden>
        <Command className="bg-transparent" loop shouldFilter={true}>
          <div className="flex items-center border-b border-border px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder={t.ui.goToDate}
              className="flex h-12 w-full bg-transparent py-3 text-sm leading-relaxed outline-none placeholder:text-muted-foreground text-foreground"
            />
          </div>
          <Command.List className="max-h-[320px] overflow-y-auto p-2">
            <Command.Empty className="py-8 text-center text-sm text-muted-foreground leading-relaxed">
              {t.ui.noResults}
            </Command.Empty>

            <motion.div
              variants={commandItemStagger.container}
              initial="hidden"
              animate="visible"
            >
              {/* Go to parsed date */}
              {parsedDate && (
                <Command.Group
                  heading={t.ui.goToDate}
                  className="[&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:leading-relaxed [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2"
                >
                  <motion.div variants={commandItemStagger.item}>
                    <Command.Item
                      value={`date:${parsedDate.year}-${parsedDate.month}-${parsedDate.day}`}
                      onSelect={handleSelect}
                      className={itemClass}
                    >
                      <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
                      {t.gregorianMonths[parsedDate.month - 1]}{" "}
                      {t.formatNumber(parsedDate.day)},{" "}
                      {t.formatNumber(parsedDate.year)}
                    </Command.Item>
                  </motion.div>
                </Command.Group>
              )}

              {/* Quick actions */}
              <Command.Group
                heading={t.ui.actions}
                className="[&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:leading-relaxed [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2"
              >
                <motion.div variants={commandItemStagger.item}>
                  <Command.Item
                    value="today"
                    onSelect={handleSelect}
                    className={itemClass}
                  >
                    <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
                    {t.ui.today}
                  </Command.Item>
                </motion.div>
                <motion.div variants={commandItemStagger.item}>
                  <Command.Item
                    value="toggle-locale"
                    onSelect={handleSelect}
                    className={itemClass}
                  >
                    <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                    {localeCode === "mm"
                      ? "Switch to English"
                      : "မြန်မာသို့ ပြောင်းမည်"}
                  </Command.Item>
                </motion.div>
              </Command.Group>

              <Command.Group
                heading={t.ui.views}
                className="[&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:leading-relaxed [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2"
              >
                <motion.div variants={commandItemStagger.item}>
                  <Command.Item
                    value="month"
                    onSelect={handleSelect}
                    className={itemClass}
                  >
                    <Eye className="h-4 w-4 text-muted-foreground shrink-0" />
                    {t.ui.monthView}
                  </Command.Item>
                </motion.div>
                <motion.div variants={commandItemStagger.item}>
                  <Command.Item
                    value="week"
                    onSelect={handleSelect}
                    className={itemClass}
                  >
                    <Eye className="h-4 w-4 text-muted-foreground shrink-0" />
                    {t.ui.weekView}
                  </Command.Item>
                </motion.div>
                <motion.div variants={commandItemStagger.item}>
                  <Command.Item
                    value="year"
                    onSelect={handleSelect}
                    className={itemClass}
                  >
                    <Eye className="h-4 w-4 text-muted-foreground shrink-0" />
                    {t.ui.yearView}
                  </Command.Item>
                </motion.div>
              </Command.Group>
            </motion.div>
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

function tryParseDate(
  input: string,
): { year: number; month: number; day: number } | null {
  if (!input) return null;

  // Try YYYY-MM-DD or YYYY/MM/DD
  const isoMatch = input.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    const year = Number(y);
    const month = Number(m);
    const day = Number(d);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return { year, month, day };
    }
  }

  // Try MM/DD/YYYY or DD/MM/YYYY (assume MM/DD)
  const usMatch = input.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (usMatch) {
    const [, a, b, y] = usMatch;
    const month = Number(a);
    const day = Number(b);
    const year = Number(y);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return { year, month, day };
    }
  }

  return null;
}
