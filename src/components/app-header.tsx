import { Button } from "@/components/ui/button";
import type { CalendarDayInfo } from "@/lib/burmese-calendar";
import { useI18n } from "@/lib/i18n/context";
import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { LanguageToggle } from "./language-toggle";
import { MoonPhaseIcon } from "./moon-phase-icon";
import { useTheme } from "./theme-toggle";

interface AppHeaderProps {
  todayInfo: CalendarDayInfo;
}

export function AppHeader({ todayInfo }: AppHeaderProps) {
  const { theme, setTheme } = useTheme();
  const { t } = useI18n();

  const monthName =
    t.myanmarMonths[todayInfo.myanmar.mm] ?? todayInfo.monthName;
  const moonPhaseName = t.moonPhases[todayInfo.moonPhase];

  return (
    <header className="border-b border-border bg-card">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MoonPhaseIcon phase={1} size={24} />
          <h1 className="text-lg font-bold text-foreground tracking-tight leading-relaxed">
            {t.ui.appTitle}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="hidden md:inline text-xs text-muted-foreground leading-loose"
          >
            {monthName} {moonPhaseName} {t.formatNumber(todayInfo.fortnightDay)}
            , {t.formatNumber(todayInfo.myanmar.my)} {t.ui.me}
          </motion.span>
          <LanguageToggle />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 overflow-hidden"
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
    </header>
  );
}
