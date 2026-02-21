import { useEffect } from "react"
import type { ViewMode } from "./use-calendar-state"

interface UseKeyboardNavOptions {
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  onSetView: (view: ViewMode) => void
  onOpenCommandPalette: () => void
  onEscape: () => void
}

export function useKeyboardNav({
  onPrev,
  onNext,
  onToday,
  onSetView,
  onOpenCommandPalette,
  onEscape,
}: UseKeyboardNavOptions) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't capture when typing in inputs
      const tag = (e.target as HTMLElement).tagName
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return

      // Cmd+K / Ctrl+K — command palette
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        onOpenCommandPalette()
        return
      }

      switch (e.key) {
        case "[":
        case "ArrowLeft":
        case "h":
          e.preventDefault()
          onPrev()
          break
        case "]":
        case "ArrowRight":
        case "l":
          e.preventDefault()
          onNext()
          break
        case "t":
          e.preventDefault()
          onToday()
          break
        case "1":
          e.preventDefault()
          onSetView("month")
          break
        case "2":
          e.preventDefault()
          onSetView("week")
          break
        case "3":
          e.preventDefault()
          onSetView("year")
          break
        case "Escape":
          onEscape()
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onPrev, onNext, onToday, onSetView, onOpenCommandPalette, onEscape])
}
