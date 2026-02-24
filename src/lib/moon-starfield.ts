export interface OrbitalStarSpec {
  angle: number
  distOffset: number
  delay: number
  size: number
  opacityMul?: number
}

export interface InnerStarSpec {
  x: number
  y: number
  delay: number
  size: number
  maxOpacity: number
}

function createOrbitalStars({
  count,
  startAngle,
  step,
  distBase,
  distSpread,
  sizeBase,
  sizeSpread,
  delayOffset,
  delayStep,
  opacityMul,
}: {
  count: number
  startAngle: number
  step: number
  distBase: number
  distSpread: number
  sizeBase: number
  sizeSpread: number
  delayOffset: number
  delayStep: number
  opacityMul?: number
}): OrbitalStarSpec[] {
  return Array.from({ length: count }, (_, i) => ({
    angle: (startAngle + i * step) % 360,
    distOffset: distBase + (i % distSpread),
    delay: delayOffset + i * delayStep,
    size: sizeBase + ((i * 7) % 5) * sizeSpread * 0.2,
    opacityMul,
  }))
}

const BASE_ORBITAL_STARS: OrbitalStarSpec[] = [
  ...createOrbitalStars({
    count: 16,
    startAngle: 8,
    step: 22,
    distBase: 10,
    distSpread: 4,
    sizeBase: 1.45,
    sizeSpread: 1.05,
    delayOffset: 0,
    delayStep: 0.12,
  }),
  ...createOrbitalStars({
    count: 12,
    startAngle: 15,
    step: 30,
    distBase: 13,
    distSpread: 3,
    sizeBase: 1.2,
    sizeSpread: 0.85,
    delayOffset: 0.22,
    delayStep: 0.14,
  }),
]

const NEW_MOON_EXTRA_ORBITAL_STARS: OrbitalStarSpec[] = [
  ...createOrbitalStars({
    count: 24,
    startAngle: 4,
    step: 15,
    distBase: 4,
    distSpread: 4,
    sizeBase: 0.9,
    sizeSpread: 0.7,
    delayOffset: 0.05,
    delayStep: 0.1,
    opacityMul: 1.25,
  }),
]

const NEW_MOON_INNER_STAR_LAYOUT: Array<
  Omit<InnerStarSpec, "x" | "y"> & { xr: number; yr: number }
> = [
  { xr: -0.42, yr: -0.34, delay: 0.0, size: 0.72, maxOpacity: 0.56 },
  { xr: -0.25, yr: -0.18, delay: 0.42, size: 0.68, maxOpacity: 0.48 },
  { xr: -0.08, yr: -0.38, delay: 0.88, size: 0.7, maxOpacity: 0.52 },
  { xr: 0.12, yr: -0.12, delay: 1.2, size: 0.66, maxOpacity: 0.45 },
  { xr: 0.28, yr: -0.28, delay: 1.62, size: 0.74, maxOpacity: 0.54 },
  { xr: -0.34, yr: 0.06, delay: 0.25, size: 0.64, maxOpacity: 0.42 },
  { xr: -0.1, yr: 0.14, delay: 0.64, size: 0.62, maxOpacity: 0.4 },
  { xr: 0.2, yr: 0.1, delay: 1.02, size: 0.66, maxOpacity: 0.44 },
  { xr: 0.38, yr: 0.24, delay: 1.46, size: 0.7, maxOpacity: 0.5 },
  { xr: -0.22, yr: 0.34, delay: 1.86, size: 0.68, maxOpacity: 0.47 },
  { xr: 0.04, yr: 0.4, delay: 0.34, size: 0.65, maxOpacity: 0.43 },
  { xr: 0.3, yr: 0.4, delay: 1.12, size: 0.63, maxOpacity: 0.41 },
]

export function getOrbitalStars(phase: number): OrbitalStarSpec[] {
  if (phase === 3) {
    return [...BASE_ORBITAL_STARS, ...NEW_MOON_EXTRA_ORBITAL_STARS]
  }
  return BASE_ORBITAL_STARS
}

export function getNewMoonInnerStars(half: number, r: number): InnerStarSpec[] {
  return NEW_MOON_INNER_STAR_LAYOUT.map((s) => ({
    x: half + r * s.xr,
    y: half + r * s.yr,
    delay: s.delay,
    size: s.size,
    maxOpacity: s.maxOpacity,
  }))
}
