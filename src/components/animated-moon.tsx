import { type OrbitalStarSpec, getNewMoonInnerStars, getOrbitalStars } from "@/lib/moon-starfield"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { useId } from "react"

interface AnimatedMoonProps {
  phase: number // 0=waxing, 1=full moon, 2=waning, 3=new moon
  fortnightDay: number // 1-15
  size?: number
  className?: string
}

/** 4-pointed star path centered at (0,0) */
function starPath(outerR: number, innerR: number): string {
  const pts: string[] = []
  for (let i = 0; i < 8; i++) {
    const r = i % 2 === 0 ? outerR : innerR
    const a = (i * Math.PI) / 4 - Math.PI / 2
    pts.push(`${r * Math.cos(a)},${r * Math.sin(a)}`)
  }
  return `M${pts.join("L")}Z`
}

/**
 * Whimsical animated moon phase display for the day detail panel.
 * Full moon renders as warm gold (not red — red is only for the calendar grid).
 */
export function AnimatedMoon({ phase, fortnightDay, size = 64, className }: AnimatedMoonProps) {
  const id = useId()
  const half = size / 2
  const r = half - 4

  const progress = fortnightDay / 15
  const terminatorRx = r * Math.abs(1 - 2 * progress)

  const isWaxing = phase === 0
  const isFullMoon = phase === 1
  const isNewMoon = phase === 3

  const pad = 14
  const vb = size + pad * 2

  const outerStars = getOrbitalStars(phase)

  function renderStars(color: string, baseOpacity: number) {
    return outerStars.map((star, i) => {
      const s = star as OrbitalStarSpec
      const dist = r + s.distOffset
      const sx = half + Math.cos((s.angle * Math.PI) / 180) * dist
      const sy = half + Math.sin((s.angle * Math.PI) / 180) * dist
      return (
        <motion.g
          key={i}
          transform={`translate(${sx},${sy})`}
          animate={{
            opacity: [0, baseOpacity * (s.opacityMul ?? 1), 0],
            scale: [0.5, 1.2, 0.5],
          }}
          transition={{
            duration: 2.6,
            delay: s.delay + 0.4,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          <path d={starPath(s.size, s.size * 0.35)} fill={color} />
        </motion.g>
      )
    })
  }

  if (isFullMoon) {
    const sparkles = [
      { angle: 20, dist: r + 6, delay: 0, size: 1.3 },
      { angle: 85, dist: r + 7, delay: 0.4, size: 1.0 },
      { angle: 150, dist: r + 5, delay: 0.8, size: 1.5 },
      { angle: 210, dist: r + 8, delay: 0.2, size: 1.1 },
      { angle: 280, dist: r + 6, delay: 0.6, size: 1.2 },
      { angle: 340, dist: r + 7, delay: 1.0, size: 0.9 },
    ]

    return (
      <motion.div
        key={`full-${id}`}
        initial={{ scale: 0, rotate: -360 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 8, mass: 1.2 }}
        className={cn("shrink-0", className)}
      >
        <motion.div
          animate={{ y: [0, -3, 0, 2, 0] }}
          transition={{
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          <svg
            width={size}
            height={size}
            viewBox={`${-pad} ${-pad} ${vb} ${vb}`}
            role="img"
            aria-label="Full Moon"
            className="overflow-visible"
          >
            <defs>
              <radialGradient id={`glow-outer-${id}`} cx="50%" cy="50%" r="50%">
                <stop offset="40%" stopColor="#E8B830" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#D4A017" stopOpacity="0" />
              </radialGradient>
              <radialGradient id={`glow-inner-${id}`} cx="36%" cy="30%" r="55%">
                <stop offset="0%" stopColor="white" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#D4A017" stopOpacity="0" />
              </radialGradient>
              <radialGradient id={`surface-${id}`} cx="45%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#F5D060" />
                <stop offset="60%" stopColor="#E8B830" />
                <stop offset="100%" stopColor="#D4A017" />
              </radialGradient>
              <filter id={`blur-${id}`}>
                <feGaussianBlur stdDeviation="3" />
              </filter>
            </defs>

            {/* Twinkling stars */}
            {renderStars("#F5D060", 0.78)}

            {/* Outer glow pulse */}
            <motion.circle
              cx={half}
              cy={half}
              fill={`url(#glow-outer-${id})`}
              initial={{ r: r }}
              animate={{ r: [r, r + 12, r + 6] }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            />

            {/* Blurred warm halo */}
            <motion.circle
              cx={half}
              cy={half}
              r={r + 3}
              fill="#D4A017"
              opacity={0.1}
              filter={`url(#blur-${id})`}
              animate={{ opacity: [0.06, 0.18, 0.06] }}
              transition={{
                duration: 4,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />

            {/* Main moon body — warm gold */}
            <circle cx={half} cy={half} r={r} fill={`url(#surface-${id})`} />

            {/* Specular highlight */}
            <circle cx={half} cy={half} r={r} fill={`url(#glow-inner-${id})`} />

            {/* Orbiting sparkles */}
            {sparkles.map((s, i) => {
              const sx = half + Math.cos((s.angle * Math.PI) / 180) * s.dist
              const sy = half + Math.sin((s.angle * Math.PI) / 180) * s.dist
              return (
                <motion.circle
                  key={`sparkle-${i}`}
                  cx={sx}
                  cy={sy}
                  r={s.size}
                  fill="#F5D060"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: [0, 0.9, 0],
                    r: [s.size * 0.4, s.size * 1.4, s.size * 0.4],
                  }}
                  transition={{
                    duration: 2.2,
                    delay: s.delay + 0.6,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                />
              )
            })}
          </svg>
        </motion.div>
      </motion.div>
    )
  }

  if (isNewMoon) {
    return (
      <motion.div
        key={`new-${id}`}
        initial={{ scale: 0.2, opacity: 0, rotate: 180 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 10, mass: 1.5 }}
        className={cn("shrink-0", className)}
      >
        <motion.div
          animate={{ y: [0, 2, 0, -2, 0] }}
          transition={{
            duration: 5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          <svg
            width={size}
            height={size}
            viewBox={`${-pad} ${-pad} ${vb} ${vb}`}
            role="img"
            aria-label="New Moon"
            className="overflow-visible"
          >
            <defs>
              <radialGradient id={`rim-${id}`} cx="28%" cy="22%" r="75%">
                <stop offset="75%" stopColor="transparent" />
                <stop offset="100%" stopColor="var(--muted-foreground)" stopOpacity="0.25" />
              </radialGradient>
              <radialGradient id={`inner-${id}`} cx="55%" cy="60%" r="50%">
                <stop offset="0%" stopColor="var(--muted-foreground)" stopOpacity="0.06" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>

            {/* Twinkling stars (new moon gets denser, closer stars) */}
            {renderStars("var(--muted-foreground)", 0.68)}

            {/* Expanding ring pulse */}
            <motion.circle
              cx={half}
              cy={half}
              fill="none"
              stroke="var(--muted-foreground)"
              strokeWidth="0.5"
              initial={{ r: r, opacity: 0.2 }}
              animate={{ r: [r, r + 10, r], opacity: [0.15, 0, 0.15] }}
              transition={{
                duration: 3.5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeOut",
              }}
            />

            {/* Second ring with offset timing */}
            <motion.circle
              cx={half}
              cy={half}
              fill="none"
              stroke="var(--muted-foreground)"
              strokeWidth="0.3"
              initial={{ r: r, opacity: 0 }}
              animate={{ r: [r, r + 14, r], opacity: [0.1, 0, 0.1] }}
              transition={{
                duration: 3.5,
                delay: 1.75,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeOut",
              }}
            />

            {/* Main body */}
            <circle
              cx={half}
              cy={half}
              r={r}
              fill="var(--moon-new)"
              stroke="var(--muted-foreground)"
              strokeWidth="0.5"
            />

            {/* Rim light */}
            <circle cx={half} cy={half} r={r} fill={`url(#rim-${id})`} />

            {/* Inner gradient */}
            <circle cx={half} cy={half} r={r} fill={`url(#inner-${id})`} />

            {/* Twinkling stars inside */}
            {getNewMoonInnerStars(half, r).map((star, i) => (
              <motion.circle
                key={`inner-star-${i}`}
                cx={star.x}
                cy={star.y}
                r={star.size}
                fill="var(--muted-foreground)"
                animate={{ opacity: [0, star.maxOpacity, 0] }}
                transition={{
                  duration: 2.8,
                  delay: star.delay,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              />
            ))}
          </svg>
        </motion.div>
      </motion.div>
    )
  }

  // Waxing or Waning — animated terminator sweep with gentle float
  const clipId = `moon-clip-${id}`
  const litGradId = `lit-grad-${id}`
  const litColor = "#D4A017"

  return (
    <motion.div
      key={`phase-${phase}-${fortnightDay}-${id}`}
      initial={{ scale: 0.3, opacity: 0, rotate: isWaxing ? -120 : 120 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 130, damping: 10, mass: 1 }}
      className={cn("shrink-0", className)}
    >
      <motion.div
        animate={{ rotate: [0, 1.5, 0, -1.5, 0], y: [0, -1.5, 0, 1.5, 0] }}
        transition={{
          duration: 6,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      >
        <svg
          width={size}
          height={size}
          viewBox={`${-pad} ${-pad} ${vb} ${vb}`}
          role="img"
          aria-label={isWaxing ? "Waxing Moon" : "Waning Moon"}
          className="overflow-visible"
        >
          <defs>
            <clipPath id={clipId}>
              <circle cx={half} cy={half} r={r} />
            </clipPath>
            <radialGradient id={litGradId} cx={isWaxing ? "65%" : "35%"} cy="38%" r="65%">
              <stop offset="0%" stopColor="#F5D060" />
              <stop offset="50%" stopColor="#E8C030" />
              <stop offset="100%" stopColor={litColor} />
            </radialGradient>
            <filter id={`glow-lit-${id}`}>
              <feGaussianBlur stdDeviation="2" />
            </filter>
          </defs>

          {/* Twinkling stars */}
          {renderStars("#E8C030", 0.72)}

          {/* Subtle glow behind lit portion */}
          <motion.circle
            cx={half}
            cy={half}
            r={r + 3}
            fill={litColor}
            opacity={0.06}
            filter={`url(#glow-lit-${id})`}
            animate={{ opacity: [0.04, 0.1, 0.04] }}
            transition={{
              duration: 3.5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />

          {/* Subtle outline only — no filled dark base */}
          <circle
            cx={half}
            cy={half}
            r={r}
            fill="none"
            stroke="var(--muted-foreground)"
            strokeWidth="0.4"
            opacity={0.25}
          />

          {/* Lit portion with animated terminator */}
          <g clipPath={`url(#${clipId})`}>
            {isWaxing ? (
              <>
                <rect x={half} y={half - r} width={r} height={r * 2} fill={`url(#${litGradId})`} />
                <motion.ellipse
                  cx={half}
                  cy={half}
                  ry={r}
                  fill={progress > 0.5 ? `url(#${litGradId})` : "var(--moon-new)"}
                  initial={{ rx: 0 }}
                  animate={{ rx: terminatorRx }}
                  transition={{
                    type: "spring",
                    stiffness: 80,
                    damping: 12,
                    mass: 1.2,
                  }}
                />
              </>
            ) : (
              <>
                <rect
                  x={half - r}
                  y={half - r}
                  width={r}
                  height={r * 2}
                  fill={`url(#${litGradId})`}
                />
                <motion.ellipse
                  cx={half}
                  cy={half}
                  ry={r}
                  fill={progress > 0.5 ? "var(--moon-new)" : `url(#${litGradId})`}
                  initial={{ rx: 0 }}
                  animate={{ rx: terminatorRx }}
                  transition={{
                    type: "spring",
                    stiffness: 80,
                    damping: 12,
                    mass: 1.2,
                  }}
                />
              </>
            )}
          </g>
        </svg>
      </motion.div>
    </motion.div>
  )
}
