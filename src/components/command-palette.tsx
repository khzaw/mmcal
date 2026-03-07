import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { normalizeSearchInput, tryParseDate } from "@/components/command-palette.utils"
import type { ViewMode } from "@/hooks/use-calendar-state"
import { commandItemStagger } from "@/lib/animations"
import { useI18n } from "@/lib/i18n/context"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { Command } from "cmdk"
import { motion } from "framer-motion"
import { CalendarDays, Eye, Globe, Search } from "lucide-react"
import { useCallback, useState } from "react"

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
  onGoToDate: (year: number, month: number, day: number) => void
  onSetView: (view: ViewMode) => void
  onToday: () => void
  onToggleLocale: () => void
}

export function CommandPalette({
  open,
  onClose,
  onGoToDate,
  onSetView,
  onToday,
  onToggleLocale,
}: CommandPaletteProps) {
  const { t, localeCode } = useI18n()
  const [search, setSearch] = useState("")
  const normalizedSearch = normalizeSearchInput(search)
  const toggleLocaleLabel = localeCode === "mm" ? "Switch to English" : "မြန်မာသို့ ပြောင်းမည်"
  const todayLabel = t.ui.today ?? "Today"
  const monthLabel = t.ui.monthView ?? "Month"
  const weekLabel = t.ui.weekView ?? "Week"
  const yearLabel = t.ui.yearView ?? "Year"
  const searchHint =
    localeCode === "mm" ? "ဥပမာ: ယနေ့၊ လ၊ ၂၀၂၆-၃-၄" : "Examples: today, month, 2026-03-04"

  const handleSelect = useCallback(
    (value: string) => {
      if (value === "today") {
        onToday()
      } else if (value === "month" || value === "week" || value === "year") {
        onSetView(value)
      } else if (value === "toggle-locale") {
        onToggleLocale()
      } else if (value.startsWith("date:")) {
        const parts = value.replace("date:", "").split("-")
        if (parts.length === 3) {
          onGoToDate(Number(parts[0]), Number(parts[1]), Number(parts[2]))
        }
      }
      setSearch("")
      onClose()
    },
    [onToday, onSetView, onToggleLocale, onGoToDate, onClose],
  )

  // Try to parse search as a date
  const parsedDate = tryParseDate(normalizedSearch)

  const itemClass =
    "flex items-center gap-2.5 px-3 py-2 text-sm leading-relaxed rounded-md cursor-pointer transition-colors text-foreground data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="p-0 gap-0 max-w-md sm:max-w-md overflow-hidden bg-card border-border !top-1/2 !left-1/2 !-translate-x-1/2 !-translate-y-1/2"
        showCloseButton={false}
      >
        <VisuallyHidden>
          <DialogTitle>{t.ui.goToDate}</DialogTitle>
        </VisuallyHidden>
        <VisuallyHidden>
          <DialogDescription>{searchHint}</DialogDescription>
        </VisuallyHidden>
        <Command className="bg-transparent" loop shouldFilter={true}>
          <div className="border-b border-border">
            <div className="flex items-center px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
              <Command.Input
                value={search}
                onValueChange={setSearch}
                placeholder={t.ui.goToDate}
                className="flex h-12 w-full bg-transparent py-3 text-sm leading-relaxed outline-none placeholder:text-muted-foreground text-foreground"
              />
            </div>
            <p className="px-3 pb-2 text-xs leading-relaxed text-muted-foreground">{searchHint}</p>
          </div>
          <Command.List className="max-h-[320px] overflow-y-auto p-2">
            <Command.Empty className="py-8 text-center text-sm text-muted-foreground leading-relaxed">
              {t.ui.noResults}
            </Command.Empty>

            <motion.div variants={commandItemStagger.container} initial="hidden" animate="visible">
              {/* Go to parsed date */}
              {parsedDate && (
                <Command.Group
                  heading={t.ui.goToDate}
                  className="[&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:leading-relaxed [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2"
                >
                  <motion.div variants={commandItemStagger.item}>
                    <Command.Item
                      value={`date:${parsedDate.year}-${parsedDate.month}-${parsedDate.day}`}
                      keywords={[
                        search,
                        normalizedSearch,
                        `${parsedDate.year}-${parsedDate.month}-${parsedDate.day}`,
                        `${parsedDate.year}/${parsedDate.month}/${parsedDate.day}`,
                        `${parsedDate.year}-${String(parsedDate.month).padStart(2, "0")}-${String(parsedDate.day).padStart(2, "0")}`,
                      ]}
                      onSelect={handleSelect}
                      className={itemClass}
                    >
                      <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
                      {t.gregorianMonths[parsedDate.month - 1]} {t.formatNumber(parsedDate.day)},{" "}
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
                    keywords={[todayLabel, "today", "now"]}
                    onSelect={handleSelect}
                    className={itemClass}
                  >
                    <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
                    {todayLabel}
                  </Command.Item>
                </motion.div>
                <motion.div variants={commandItemStagger.item}>
                  <Command.Item
                    value="toggle-locale"
                    keywords={[
                      toggleLocaleLabel,
                      "toggle locale",
                      "switch language",
                      "language",
                      localeCode === "mm" ? "english" : "myanmar",
                      localeCode === "mm" ? "en" : "mm",
                    ]}
                    onSelect={handleSelect}
                    className={itemClass}
                  >
                    <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                    {toggleLocaleLabel}
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
                    keywords={[monthLabel, "month", "m"]}
                    onSelect={handleSelect}
                    className={itemClass}
                  >
                    <Eye className="h-4 w-4 text-muted-foreground shrink-0" />
                    {monthLabel}
                  </Command.Item>
                </motion.div>
                <motion.div variants={commandItemStagger.item}>
                  <Command.Item
                    value="week"
                    keywords={[weekLabel, "week", "w"]}
                    onSelect={handleSelect}
                    className={itemClass}
                  >
                    <Eye className="h-4 w-4 text-muted-foreground shrink-0" />
                    {weekLabel}
                  </Command.Item>
                </motion.div>
                <motion.div variants={commandItemStagger.item}>
                  <Command.Item
                    value="year"
                    keywords={[yearLabel, "year", "y"]}
                    onSelect={handleSelect}
                    className={itemClass}
                  >
                    <Eye className="h-4 w-4 text-muted-foreground shrink-0" />
                    {yearLabel}
                  </Command.Item>
                </motion.div>
              </Command.Group>
            </motion.div>
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
