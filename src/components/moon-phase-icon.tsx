import { useId } from "react"

interface MoonPhaseIconProps {
  phase: number // 0=waxing, 1=full moon, 2=waning, 3=new moon
  size?: number
  className?: string
  fullMoonTone?: "holiday" | "neutral"
}

export function MoonPhaseIcon({
  phase,
  size = 16,
  className = "",
  fullMoonTone = "holiday",
}: MoonPhaseIconProps) {
  const id = useId()
  const half = size / 2
  const r = half - 1

  if (phase === 1) {
    // Full moon — holiday accent or neutral filled style
    const fullMoonFill = fullMoonTone === "holiday" ? "var(--moon-full)" : "var(--foreground)"
    const fullMoonStroke = fullMoonTone === "holiday" ? "var(--moon-full)" : "var(--foreground)"
    return (
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className={className}
        role="img"
        aria-label="Full Moon"
      >
        <circle
          cx={half}
          cy={half}
          r={r}
          fill={fullMoonFill}
          stroke={fullMoonStroke}
          strokeWidth="0.5"
        />
      </svg>
    )
  }

  if (phase === 3) {
    // New moon — neutral outlined (non-filled) circle
    return (
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className={className}
        role="img"
        aria-label="New Moon"
      >
        <circle
          cx={half}
          cy={half}
          r={r}
          fill="var(--background)"
          stroke="var(--foreground)"
          strokeWidth="0.9"
        />
      </svg>
    )
  }

  if (phase === 0) {
    // Waxing — right side lit
    const clipId = `wax-${id}`
    return (
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className={className}
        role="img"
        aria-label="Waxing Moon"
      >
        <circle
          cx={half}
          cy={half}
          r={r}
          fill="var(--moon-new)"
          stroke="var(--muted-foreground)"
          strokeWidth="0.5"
        />
        <clipPath id={clipId}>
          <rect x={half} y="0" width={half} height={size} />
        </clipPath>
        <circle cx={half} cy={half} r={r} fill="#D4A017" clipPath={`url(#${clipId})`} />
      </svg>
    )
  }

  // Waning — left side lit (phase === 2)
  const clipId = `wan-${id}`
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      role="img"
      aria-label="Waning Moon"
    >
      <circle
        cx={half}
        cy={half}
        r={r}
        fill="var(--moon-new)"
        stroke="var(--muted-foreground)"
        strokeWidth="0.5"
      />
      <clipPath id={clipId}>
        <rect x="0" y="0" width={half} height={size} />
      </clipPath>
      <circle cx={half} cy={half} r={r} fill="#D4A017" clipPath={`url(#${clipId})`} />
    </svg>
  )
}
