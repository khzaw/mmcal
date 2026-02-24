import { Button } from "@/components/ui/button"
import type { CalendarDayInfo } from "@/lib/burmese-calendar"
import { useI18n } from "@/lib/i18n/context"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"
import { Moon, Sun } from "lucide-react"
import { LanguageToggle } from "./language-toggle"
import { useTheme } from "./theme-toggle"

interface AppHeaderProps {
  todayInfo: CalendarDayInfo
}

export function AppHeader({ todayInfo }: AppHeaderProps) {
  const { theme, setTheme } = useTheme()
  const { t, localeCode } = useI18n()

  const monthName = t.myanmarMonths[todayInfo.myanmar.mm] ?? todayInfo.monthName
  const moonPhaseName = t.moonPhases[todayInfo.moonPhase]

  return (
    <header className="border-b border-border/70 bg-card/85 backdrop-blur supports-[backdrop-filter]:bg-card/65">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="h-4 w-4 rounded-full bg-foreground/75 shrink-0" />
            <h1
              className={cn(
                "truncate text-foreground",
                localeCode === "en"
                  ? "text-sm md:text-base font-semibold uppercase tracking-[0.18em]"
                  : "text-lg font-bold tracking-tight leading-relaxed",
              )}
            >
              {t.ui.appTitle}
            </h1>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.24, duration: 0.3 }}
              className={cn(
                "hidden lg:inline text-xs text-muted-foreground whitespace-nowrap",
                localeCode === "en" && "uppercase tracking-[0.12em]",
              )}
            >
              • {monthName} {moonPhaseName} {t.formatNumber(todayInfo.fortnightDay)} |{" "}
              {t.formatNumber(todayInfo.myanmar.my)} {t.ui.me}
            </motion.span>
            <LanguageToggle />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 overflow-hidden rounded-full border border-border/70 bg-secondary/25 hover:bg-secondary/60"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              <AnimatePresence mode="wait">
                {theme === "dark" ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
                    animate={{ rotate: 0, scale: 1, opacity: 1 }}
                    exit={{ rotate: 90, scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun className="h-4 w-4" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
                    animate={{ rotate: 0, scale: 1, opacity: 1 }}
                    exit={{ rotate: 90, scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon className="h-4 w-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </div>
        </div>
        <div className="divider-gradient mt-3" />
      </div>
    </header>
  )
}
