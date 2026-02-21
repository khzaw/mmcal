import type { Transition, Variants } from "framer-motion"

// ── Spring presets ──────────────────────────────────────────────────────
export const springPresets = {
  /** Smooth entrances (~250ms feel) */
  soft: { type: "spring", stiffness: 260, damping: 28, mass: 0.8 } as const,
  /** Quick button feedback (~150ms feel) */
  snappy: { type: "spring", stiffness: 400, damping: 30, mass: 0.6 } as const,
  /** Cards with slight overshoot (~300ms feel) */
  bouncy: { type: "spring", stiffness: 300, damping: 22, mass: 0.8 } as const,
} satisfies Record<string, Transition>

// ── Tween presets ───────────────────────────────────────────────────────
export const tweenPresets = {
  fade: { duration: 0.15, ease: "easeOut" } as const,
  slide: { duration: 0.2, ease: "easeInOut" } as const,
} satisfies Record<string, Transition>

// ── Stagger factory ─────────────────────────────────────────────────────
export function createStaggerVariants(
  staggerMs: number,
  spring: Transition = springPresets.soft,
): { container: Variants; item: Variants } {
  return {
    container: {
      hidden: {},
      visible: {
        transition: { staggerChildren: staggerMs / 1000, ...spring },
      },
    },
    item: {
      hidden: { opacity: 0, y: 6 },
      visible: { opacity: 1, y: 0, transition: spring },
    },
  }
}

// ── Pre-built stagger sets ──────────────────────────────────────────────
export const badgeStagger = createStaggerVariants(50)
export const gridCardStagger = createStaggerVariants(35, springPresets.bouncy)
export const detailSectionStagger = createStaggerVariants(60)
export const legendStagger = createStaggerVariants(30)
export const commandItemStagger = createStaggerVariants(25, springPresets.snappy)

// ── Hover helpers ───────────────────────────────────────────────────────
export const hoverScale = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
  transition: springPresets.snappy,
}

export const hoverLift = {
  whileHover: { y: -1, scale: 1.02 },
  whileTap: { scale: 0.97 },
  transition: springPresets.snappy,
}

// ── View transition variant ─────────────────────────────────────────────
export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

export const fadeInUpTransition: Transition = {
  duration: 0.15,
  ease: "easeOut",
}
