import { AppHeader } from "@/components/app-header"
import { CalendarGrid } from "@/components/calendar-grid"
import { CalendarHeader } from "@/components/calendar-header"
import { DayDetailPanel } from "@/components/day-detail-panel"
import { MoonPhaseIcon } from "@/components/moon-phase-icon"
import { ThemeProvider } from "@/components/theme-toggle"
import { TodayWidget } from "@/components/today-widget"
import { WeekView } from "@/components/week-view"
import { badgeStagger, fadeInUp, fadeInUpTransition } from "@/lib/animations"
import { I18nProvider, useI18n } from "@/lib/i18n/context"
import { AnimatePresence, motion } from "framer-motion"
import { Suspense, lazy, useCallback, useEffect, useRef, useState } from "react"

const YearView = lazy(() => import("@/components/year-view").then((m) => ({ default: m.YearView })))
const CommandPalette = lazy(() =>
  import("@/components/command-palette").then((m) => ({
    default: m.CommandPalette,
  })),
)
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useCalendarState } from "@/hooks/use-calendar-state"
import { useKeyboardNav } from "@/hooks/use-keyboard-nav"
import { useSwipeNav } from "@/hooks/use-swipe-nav"
import { cal_my, getMonthName, j2m, my2sy, w2j } from "@/lib/burmese-calendar"
import { readURLState, writeURLState } from "@/lib/url-state"
import {
  isSwipeNavigationEnabled,
  shouldHideDetailHero,
  shouldShowTodayWidget,
} from "@/lib/view-interactions"

function CalendarApp() {
  const { state, dispatch, todayJdn, todayInfo } = useCalendarState()
  const { t, localeCode, setLocale } = useI18n()
  const [cmdOpen, setCmdOpen] = useState(false)
  const directionRef = useRef(0)

  // URL state: hydrate on mount
  useEffect(() => {
    const urlState = readURLState()
    if (urlState.year && urlState.month) {
      dispatch({
        type: "GO_TO_DATE",
        year: urlState.year,
        month: urlState.month,
        day: urlState.day ?? 1,
      })
    }
    if (urlState.view) {
      dispatch({ type: "SET_VIEW", view: urlState.view })
    }
  }, [dispatch])

  // URL state: sync on change
  useEffect(() => {
    writeURLState({
      year: state.year,
      month: state.month,
      day: state.day,
      view: state.view,
    })
  }, [state.year, state.month, state.day, state.view])

  // Counter that increments on explicit navigation — forces infinite list to re-center
  const [navKey, setNavKey] = useState(0)

  const handlePrev = useCallback(() => {
    directionRef.current = -1
    dispatch({ type: "PREV" })
    setNavKey((k) => k + 1)
  }, [dispatch])

  const handleNext = useCallback(() => {
    directionRef.current = 1
    dispatch({ type: "NEXT" })
    setNavKey((k) => k + 1)
  }, [dispatch])

  const handleToday = useCallback(() => {
    directionRef.current = 0
    dispatch({ type: "TODAY" })
    setNavKey((k) => k + 1)
  }, [dispatch])

  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  useKeyboardNav({
    onPrev: handlePrev,
    onNext: handleNext,
    onToday: handleToday,
    onSetView: (v) => dispatch({ type: "SET_VIEW", view: v }),
    onOpenCommandPalette: () => setCmdOpen(true),
    onEscape: () => {
      if (cmdOpen) setCmdOpen(false)
    },
  })

  // Myanmar year info for the current month
  const midMonthJdn = Math.round(w2j(state.year, state.month, 15))
  const midMonthMm = j2m(midMonthJdn)
  const myYearInfo = cal_my(midMonthMm.my)
  const mmMonthName = t.myanmarMonths[midMonthMm.mm] ?? getMonthName(midMonthMm.mm, midMonthMm.myt)

  // Mobile detection for touch swipe support
  const [isMobile, setIsMobile] = useState(() => window.matchMedia("(max-width: 767px)").matches)
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)")
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  // Swipe / mousewheel navigation
  const swipeRef = useSwipeNav({
    onPrev: handlePrev,
    onNext: handleNext,
    axis: "x",
    enabled: isSwipeNavigationEnabled(state.view, isMobile),
  })
  const showTodayWidget = shouldShowTodayWidget(isMobile)
  const legendDay = state.selectedDay ?? todayInfo
  const fullMoonTone =
    (legendDay.holidays.length > 0 || legendDay.holidays2.length > 0) &&
    legendDay.moonPhase === 1 &&
    legendDay.jdn === state.selectedJdn
      ? "holiday"
      : "neutral"

  return (
    <main className="relative min-h-screen bg-background flex flex-col overflow-x-clip">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -top-28 -left-20 h-72 w-72 rounded-full bg-foreground/[0.045] blur-3xl dark:bg-foreground/[0.05]" />
        <div className="absolute -top-24 right-[-5rem] h-64 w-64 rounded-full bg-foreground/[0.04] blur-3xl dark:bg-foreground/[0.04]" />
      </div>

      <div className="print:hidden">
        <AppHeader todayInfo={todayInfo} />
      </div>

      <div className="relative z-[1] max-w-[1440px] mx-auto px-4 md:px-6 py-4 md:py-8 xl:py-12 print:px-0 print:py-0 w-full flex-1 flex flex-col">
        {/* Myanmar Year Summary */}
        <motion.div
          variants={badgeStagger.container}
          initial="hidden"
          animate="visible"
          className="surface-panel mb-4 rounded-2xl px-3 py-2.5 md:px-4 md:py-3 flex flex-wrap items-center gap-2 md:gap-4 text-sm"
        >
          <motion.div variants={badgeStagger.item}>
            <Badge variant="secondary" className="gap-1 text-xs font-medium leading-relaxed">
              {t.ui.myanmarYear} {t.formatNumber(midMonthMm.my)}
            </Badge>
          </motion.div>
          <motion.div variants={badgeStagger.item}>
            <Badge variant="secondary" className="gap-1 text-xs font-medium leading-relaxed">
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
          onPrint={handlePrint}
        />

        <div className="divider-gradient mt-5 print:mt-3" />

        <div className="mt-5 print:mt-3 flex flex-col lg:flex-row gap-5 print:gap-3 lg:items-start print:items-start">
          {/* Calendar view — stable min-h prevents footer jumping between 4/5/6 row months */}
          <div ref={swipeRef} className="flex-1 min-w-0 md:min-h-[640px] print:min-h-0 relative">
            {state.view === "month" && (
              <div className="relative z-[2]">
                <CalendarGrid
                  year={state.year}
                  month={state.month}
                  selectedJdn={state.selectedJdn}
                  onSelectDay={(day) => dispatch({ type: "SELECT_DAY", day })}
                  todayJdn={todayJdn}
                  direction={directionRef.current}
                />
              </div>
            )}
            {state.view === "week" && (
              <div className="relative z-[2]">
                <WeekView
                  year={state.year}
                  month={state.month}
                  day={state.day}
                  selectedJdn={state.selectedJdn}
                  onSelectDay={(day) => dispatch({ type: "SELECT_DAY", day })}
                  todayJdn={todayJdn}
                  direction={directionRef.current}
                  vertical={isMobile}
                  scrollKey={navKey}
                />
              </div>
            )}
            {state.view === "year" && (
              <div className="relative z-[2]">
                <Suspense fallback={null}>
                  <YearView
                    year={state.year}
                    selectedJdn={state.selectedJdn}
                    todayJdn={todayJdn}
                    onSelectDay={(day) => dispatch({ type: "SELECT_DAY", day })}
                    onGoToMonth={(m) => {
                      dispatch({
                        type: "SET_MONTH",
                        month: m,
                      })
                      dispatch({
                        type: "SET_VIEW",
                        view: "month",
                      })
                    }}
                  />
                </Suspense>
              </div>
            )}
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
                className="lg:w-[380px] print:w-[360px] shrink-0"
              >
                <Card className="surface-shell sticky top-4 print:static min-h-[360px] print:min-h-0 rounded-3xl print:bg-card print:shadow-none print:backdrop-blur-none !py-3">
                  <CardContent className="px-4 pt-1 pb-4 md:px-5 md:pt-1.5 md:pb-5">
                    {showTodayWidget && (
                      <div className="print:hidden">
                        <TodayWidget day={todayInfo} />
                        <Separator className="my-3" />
                      </div>
                    )}
                    {state.selectedDay ? (
                      <DayDetailPanel
                        day={state.selectedDay}
                        hideHero={shouldHideDetailHero(
                          state.selectedDay?.jdn ?? null,
                          todayJdn,
                          isMobile,
                        )}
                      />
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

        {/* Moon legend */}
        {state.view !== "year" && (
          <div className="mt-auto pt-6 pb-6">
            <Separator className="mb-4" />
            <p className="mb-2 text-[11px] text-muted-foreground/75">
              {t.ui.moonLegend ?? "Moon Legend"}
            </p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
              {[0, 1, 2, 3].map((phase) => {
                const isActive = legendDay.moonPhase === phase
                return (
                  <motion.div
                    key={phase}
                    className="inline-flex items-center gap-1.5"
                    animate={{
                      opacity: isActive ? 1 : 0.58,
                      scale: isActive ? 1.06 : 1,
                      y: isActive ? -1 : 0,
                    }}
                    transition={{ type: "spring", stiffness: 360, damping: 28, mass: 0.55 }}
                  >
                    <MoonPhaseIcon
                      phase={phase}
                      size={12}
                      fullMoonTone={phase === 1 ? fullMoonTone : "neutral"}
                    />
                    <span>{t.moonPhases[phase]}</span>
                  </motion.div>
                )
              })}
              <motion.div
                className="inline-flex items-center gap-1.5"
                animate={{
                  opacity: legendDay.sabbath === 1 ? 1 : 0.58,
                  scale: legendDay.sabbath === 1 ? 1.06 : 1,
                  y: legendDay.sabbath === 1 ? -1 : 0,
                }}
                transition={{ type: "spring", stiffness: 360, damping: 28, mass: 0.55 }}
              >
                <motion.span
                  className="w-2 h-2 rounded-full bg-destructive inline-block"
                  animate={{
                    boxShadow:
                      legendDay.sabbath === 1
                        ? "0 0 0 4px rgba(239,68,68,0.16)"
                        : "0 0 0 0 rgba(239,68,68,0)",
                  }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                />
                {t.astro.Sabbath ?? "Sabbath"}
              </motion.div>
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
            onGoToDate={(y, m, d) => dispatch({ type: "GO_TO_DATE", year: y, month: m, day: d })}
            onSetView={(v) => dispatch({ type: "SET_VIEW", view: v })}
            onToday={handleToday}
            onToggleLocale={() => setLocale(localeCode === "mm" ? "en" : "mm")}
          />
        </Suspense>
      )}
    </main>
  )
}

export function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <CalendarApp />
      </I18nProvider>
    </ThemeProvider>
  )
}
