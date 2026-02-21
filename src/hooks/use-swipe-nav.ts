import { useCallback, useEffect, useRef } from "react";

interface UseSwipeNavOptions {
  onPrev: () => void;
  onNext: () => void;
  /** Touch swipe axis — "x" for horizontal, "y" for vertical */
  axis?: "x" | "y";
  /** Minimum touch swipe distance in px (default: 50) */
  swipeThreshold?: number;
  /** Accumulated wheel delta needed to trigger (default: 80) */
  wheelThreshold?: number;
  /** Cooldown between triggers in ms */
  cooldownMs?: number;
  enabled?: boolean;
}

export function useSwipeNav({
  onPrev,
  onNext,
  axis = "x",
  swipeThreshold = 50,
  wheelThreshold = 80,
  cooldownMs = 400,
  enabled = true,
}: UseSwipeNavOptions) {
  const ref = useRef<HTMLDivElement>(null);
  const lastTrigger = useRef(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const wheelDelta = useRef(0);
  const wheelTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  const fire = useCallback(
    (direction: "prev" | "next") => {
      const now = Date.now();
      if (now - lastTrigger.current < cooldownMs) return;
      lastTrigger.current = now;
      direction === "prev" ? onPrev() : onNext();
    },
    [onPrev, onNext, cooldownMs],
  );

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;

    // --- Wheel / trackpad ---
    const handleWheel = (e: WheelEvent) => {
      // Use whichever axis has greater movement
      const delta =
        Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;

      wheelDelta.current += delta;

      // Reset after gesture pause
      clearTimeout(wheelTimeout.current);
      wheelTimeout.current = setTimeout(() => {
        wheelDelta.current = 0;
      }, 120);

      if (Math.abs(wheelDelta.current) >= wheelThreshold) {
        e.preventDefault();
        fire(wheelDelta.current > 0 ? "next" : "prev");
        wheelDelta.current = 0;
      }
    };

    // --- Touch swipe ---
    const handleTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      touchStart.current = { x: t.clientX, y: t.clientY };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStart.current) return;
      const touch = e.changedTouches[0];
      if (!touch) return;
      const dx = touch.clientX - touchStart.current.x;
      const dy = touch.clientY - touchStart.current.y;
      touchStart.current = null;

      const primary = axis === "x" ? dx : dy;
      const cross = axis === "x" ? dy : dx;

      // Must exceed threshold and be clearly intentional (not a diagonal)
      if (
        Math.abs(primary) < swipeThreshold ||
        Math.abs(primary) < Math.abs(cross) * 1.2
      )
        return;

      // Swipe right / down → prev · Swipe left / up → next
      fire(primary > 0 ? "prev" : "next");
    };

    // Prevent page scroll when a swipe gesture is in progress
    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStart.current) return;
      const t = e.touches[0];
      if (!t) return;
      const dx = t.clientX - touchStart.current.x;
      const dy = t.clientY - touchStart.current.y;
      const primary = axis === "x" ? dx : dy;
      const cross = axis === "x" ? dy : dx;

      // Once we detect an intentional swipe along the primary axis, block scroll
      if (Math.abs(primary) > 10 && Math.abs(primary) > Math.abs(cross) * 1.2) {
        e.preventDefault();
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      clearTimeout(wheelTimeout.current);
      el.removeEventListener("wheel", handleWheel);
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, [enabled, axis, swipeThreshold, wheelThreshold, fire]);

  return ref;
}
