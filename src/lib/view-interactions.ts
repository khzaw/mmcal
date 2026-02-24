import type { ViewMode } from "@/hooks/use-calendar-state"

export function isSwipeNavigationEnabled(view: ViewMode, isMobile: boolean): boolean {
  return isMobile && view === "month"
}

export function shouldHideDetailHero(selectedJdn: number | null, todayJdn: number): boolean {
  return selectedJdn === todayJdn
}
