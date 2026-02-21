import { AppHeader } from "@/components/app-header";
import { CalendarGrid } from "@/components/calendar-grid";
import { CalendarHeader } from "@/components/calendar-header";
import { DayDetailPanel } from "@/components/day-detail-panel";
import { ThemeProvider } from "@/components/theme-toggle";
import { badgeStagger, fadeInUp, fadeInUpTransition } from "@/lib/animations";
import { I18nProvider, useI18n } from "@/lib/i18n/context";
import { AnimatePresence, motion } from "framer-motion";
import {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const WeekView = lazy(() =>
  import("@/components/week-view").then((m) => ({ default: m.WeekView })),
);
const YearView = lazy(() =>
  import("@/components/year-view").then((m) => ({ default: m.YearView })),
);
const CommandPalette = lazy(() =>
  import("@/components/command-palette").then((m) => ({
    default: m.CommandPalette,
  })),
);
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCalendarState } from "@/hooks/use-calendar-state";
import { useKeyboardNav } from "@/hooks/use-keyboard-nav";
import { useSwipeNav } from "@/hooks/use-swipe-nav";
import {
  cal_my,
  getDayInfo,
  getGregorianMonthDays,
  getMonthName,
  j2m,
  my2sy,
  w2j,
} from "@/lib/burmese-calendar";
import { readURLState, writeURLState } from "@/lib/url-state";

function CalendarApp() {
  const { state, dispatch, todayJdn, todayInfo } = useCalendarState();
  const { t, localeCode, setLocale } = useI18n();
  const [cmdOpen, setCmdOpen] = useState(false);
  const directionRef = useRef(0);

  // URL state: hydrate on mount
  useEffect(() => {
    const urlState = readURLState();
    if (urlState.year && urlState.month) {
      dispatch({
        type: "GO_TO_DATE",
        year: urlState.year,
        month: urlState.month,
        day: urlState.day ?? 1,
      });
    }
    if (urlState.view) {
      dispatch({ type: "SET_VIEW", view: urlState.view });
    }
  }, [dispatch]);

  // URL state: sync on change
  useEffect(() => {
    writeURLState({
      year: state.year,
      month: state.month,
      day: state.day,
      view: state.view,
    });
  }, [state.year, state.month, state.day, state.view]);

  // Counter that increments on explicit navigation — forces infinite list to re-center
  const [navKey, setNavKey] = useState(0);

  const handlePrev = useCallback(() => {
    directionRef.current = -1;
    dispatch({ type: "PREV" });
    setNavKey((k) => k + 1);
  }, [dispatch]);

  const handleNext = useCallback(() => {
    directionRef.current = 1;
    dispatch({ type: "NEXT" });
    setNavKey((k) => k + 1);
  }, [dispatch]);

  const handleToday = useCallback(() => {
    directionRef.current = 0;
    dispatch({ type: "TODAY" });
    setNavKey((k) => k + 1);
  }, [dispatch]);

  useKeyboardNav({
    onPrev: handlePrev,
    onNext: handleNext,
    onToday: handleToday,
    onSetView: (v) => dispatch({ type: "SET_VIEW", view: v }),
    onOpenCommandPalette: () => setCmdOpen(true),
    onEscape: () => {
      if (cmdOpen) setCmdOpen(false);
    },
  });

  // Myanmar year info for the current month
  const midMonthJdn = Math.round(w2j(state.year, state.month, 15));
  const midMonthMm = j2m(midMonthJdn);
  const myYearInfo = cal_my(midMonthMm.my);
  const mmMonthName =
    t.myanmarMonths[midMonthMm.mm] ??
    getMonthName(midMonthMm.mm, midMonthMm.myt);

  // Mobile detection for week-view swipe axis
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia("(max-width: 767px)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Swipe / mousewheel navigation
  const swipeRef = useSwipeNav({
    onPrev: handlePrev,
    onNext: handleNext,
    axis: "x",
    enabled: state.view !== "year" && !(state.view === "week" && isMobile),
  });

  // Check if current view has any sabbath days
  const hasSabbath = useMemo(() => {
    if (state.view === "year") return false;
    if (state.view === "month") {
      return getGregorianMonthDays(state.year, state.month).some(
        (d) => d.sabbath === 1,
      );
    }
    // week view
    const centerJdn = Math.round(w2j(state.year, state.month, state.day));
    const info = getDayInfo(centerJdn);
    const startJdn = centerJdn - ((info.weekday + 6) % 7);
    for (let i = 0; i < 7; i++) {
      if (getDayInfo(startJdn + i).sabbath === 1) return true;
    }
    return false;
  }, [state.view, state.year, state.month, state.day]);

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <AppHeader todayInfo={todayInfo} />

      <div className="max-w-7xl mx-auto px-4 py-4 md:py-8 xl:py-14 w-full flex-1 flex flex-col">
        {/* Myanmar Year Summary */}
        <motion.div
          variants={badgeStagger.container}
          initial="hidden"
          animate="visible"
          className="mb-4 flex flex-wrap items-center gap-2 md:gap-4 text-sm"
        >
          <motion.div variants={badgeStagger.item}>
            <Badge
              variant="secondary"
              className="gap-1 text-xs font-medium leading-relaxed"
            >
              {t.ui.myanmarYear} {t.formatNumber(midMonthMm.my)}
            </Badge>
          </motion.div>
          <motion.div variants={badgeStagger.item}>
            <Badge
              variant="secondary"
              className="gap-1 text-xs font-medium leading-relaxed"
            >
              {t.ui.sasanaYear} {t.formatNumber(my2sy(midMonthMm.my))}
            </Badge>
          </motion.div>
          <motion.div variants={badgeStagger.item}>
            <Badge variant="outline" className="gap-1 text-xs leading-relaxed">
              {t.yearTypes[myYearInfo.myt]}
            </Badge>
          </motion.div>
          <motion.div variants={badgeStagger.item}>
            <Badge variant="outline" className="gap-1 text-xs leading-relaxed">
              {mmMonthName}
            </Badge>
          </motion.div>
        </motion.div>

        {/* Calendar Header */}
        <CalendarHeader
          year={state.year}
          month={state.month}
          view={state.view}
          onPrev={handlePrev}
          onNext={handleNext}
          onToday={handleToday}
          onYearChange={(y) => dispatch({ type: "SET_YEAR", year: y })}
          onMonthChange={(m) => dispatch({ type: "SET_MONTH", month: m })}
          onViewChange={(v) => dispatch({ type: "SET_VIEW", view: v })}
          onOpenCommandPalette={() => setCmdOpen(true)}
        />

        <div className="mt-4 flex flex-col lg:flex-row gap-4">
          {/* Calendar view — stable min-h prevents footer jumping between 4/5/6 row months */}
          <div ref={swipeRef} className="flex-1 min-w-0 md:min-h-[640px]">
            <AnimatePresence mode="wait">
              {state.view === "month" && (
                <motion.div
                  key="month"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.12 }}
                >
                  <CalendarGrid
                    year={state.year}
                    month={state.month}
                    selectedJdn={state.selectedJdn}
                    onSelectDay={(day) => dispatch({ type: "SELECT_DAY", day })}
                    todayJdn={todayJdn}
                    direction={directionRef.current}
                  />
                </motion.div>
              )}
              {state.view === "week" && (
                <motion.div
                  key="week"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.12 }}
                >
                  <Suspense fallback={null}>
                    <WeekView
                      year={state.year}
                      month={state.month}
                      day={state.day}
                      selectedJdn={state.selectedJdn}
                      onSelectDay={(day) =>
                        dispatch({ type: "SELECT_DAY", day })
                      }
                      todayJdn={todayJdn}
                      direction={directionRef.current}
                      vertical={isMobile}
                      scrollKey={navKey}
                    />
                  </Suspense>
                </motion.div>
              )}
              {state.view === "year" && (
                <motion.div
                  key="year"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.12 }}
                >
                  <Suspense fallback={null}>
                    <YearView
                      year={state.year}
                      selectedJdn={state.selectedJdn}
                      todayJdn={todayJdn}
                      onSelectDay={(day) =>
                        dispatch({ type: "SELECT_DAY", day })
                      }
                      onGoToMonth={(m) => {
                        dispatch({
                          type: "SET_MONTH",
                          month: m,
                        });
                        dispatch({
                          type: "SET_VIEW",
                          view: "month",
                        });
                      }}
                    />
                  </Suspense>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Day detail sidebar */}
          <AnimatePresence>
            {state.view !== "year" && (
              <motion.div
                key="sidebar"
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={fadeInUpTransition}
                className="lg:w-[320px] shrink-0"
              >
                <Card className="sticky top-4 min-h-[360px]">
                  <CardContent className="p-4 md:p-5">
                    {state.selectedDay ? (
                      <DayDetailPanel day={state.selectedDay} />
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        {t.ui.selectDay}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sabbath legend — only when visible days have sabbath */}
        {hasSabbath && (
          <div className="mt-auto pt-6 pb-6">
            <Separator className="mb-4" />
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-destructive inline-block" />
              {t.astro.Sabbath ?? "Sabbath"}
            </div>
          </div>
        )}
      </div>

      {/* Command palette */}
      {cmdOpen && (
        <Suspense fallback={null}>
          <CommandPalette
            open={cmdOpen}
            onClose={() => setCmdOpen(false)}
            onGoToDate={(y, m, d) =>
              dispatch({ type: "GO_TO_DATE", year: y, month: m, day: d })
            }
            onSetView={(v) => dispatch({ type: "SET_VIEW", view: v })}
            onToday={handleToday}
            onToggleLocale={() => setLocale(localeCode === "mm" ? "en" : "mm")}
          />
        </Suspense>
      )}
    </main>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <CalendarApp />
      </I18nProvider>
    </ThemeProvider>
  );
}
