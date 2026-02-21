import type { ViewMode } from "@/hooks/use-calendar-state"

interface URLState {
  year?: number
  month?: number
  day?: number
  view?: ViewMode
}

export function readURLState(): URLState {
  const params = new URLSearchParams(window.location.search)
  const result: URLState = {}

  const y = params.get("y")
  if (y) result.year = Number(y)

  const m = params.get("m")
  if (m) result.month = Number(m)

  const d = params.get("d")
  if (d) result.day = Number(d)

  const v = params.get("v") as ViewMode | null
  if (v && ["month", "week", "year"].includes(v)) result.view = v

  return result
}

export function writeURLState(state: { year: number; month: number; day: number; view: ViewMode }) {
  const params = new URLSearchParams()
  params.set("y", String(state.year))
  params.set("m", String(state.month))
  params.set("d", String(state.day))
  if (state.view !== "month") params.set("v", state.view)

  const url = `${window.location.pathname}?${params.toString()}`
  history.replaceState(null, "", url)
}
