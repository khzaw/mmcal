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

const BASE_ORBITAL_STARS: OrbitalStarSpec[] = [
  { angle: 18, distOffset: 10, delay: 0, size: 2.3 },
  { angle: 44, distOffset: 12, delay: 0.2, size: 1.9 },
  { angle: 72, distOffset: 11, delay: 0.45, size: 1.8 },
  { angle: 101, distOffset: 13, delay: 0.8, size: 1.7 },
  { angle: 132, distOffset: 10, delay: 1.05, size: 2.0 },
  { angle: 164, distOffset: 14, delay: 1.3, size: 1.6 },
  { angle: 196, distOffset: 11, delay: 0.35, size: 1.8 },
  { angle: 224, distOffset: 12, delay: 0.7, size: 1.9 },
  { angle: 253, distOffset: 10, delay: 1.0, size: 2.1 },
  { angle: 286, distOffset: 13, delay: 1.4, size: 1.7 },
  { angle: 318, distOffset: 11, delay: 1.65, size: 1.8 },
  { angle: 346, distOffset: 9, delay: 0.55, size: 2.5 },
]

const NEW_MOON_EXTRA_ORBITAL_STARS: OrbitalStarSpec[] = [
  { angle: 4, distOffset: 6, delay: 0.1, size: 1.4, opacityMul: 1.1 },
  { angle: 22, distOffset: 5, delay: 0.35, size: 1.2, opacityMul: 1.2 },
  { angle: 40, distOffset: 7, delay: 0.62, size: 1.3, opacityMul: 1.1 },
  { angle: 58, distOffset: 4, delay: 0.82, size: 1.1, opacityMul: 1.3 },
  { angle: 78, distOffset: 6, delay: 1.06, size: 1.2, opacityMul: 1.2 },
  { angle: 96, distOffset: 5, delay: 1.32, size: 1.1, opacityMul: 1.2 },
  { angle: 116, distOffset: 4, delay: 1.58, size: 1.2, opacityMul: 1.3 },
  { angle: 138, distOffset: 7, delay: 1.84, size: 1.25, opacityMul: 1.1 },
  { angle: 158, distOffset: 5, delay: 0.24, size: 1.3, opacityMul: 1.2 },
  { angle: 178, distOffset: 6, delay: 0.46, size: 1.2, opacityMul: 1.2 },
  { angle: 198, distOffset: 4, delay: 0.7, size: 1.1, opacityMul: 1.3 },
  { angle: 218, distOffset: 6, delay: 0.94, size: 1.2, opacityMul: 1.2 },
  { angle: 240, distOffset: 5, delay: 1.18, size: 1.1, opacityMul: 1.3 },
  { angle: 262, distOffset: 4, delay: 1.43, size: 1.2, opacityMul: 1.3 },
  { angle: 282, distOffset: 7, delay: 1.67, size: 1.25, opacityMul: 1.1 },
  { angle: 302, distOffset: 5, delay: 1.92, size: 1.1, opacityMul: 1.2 },
  { angle: 324, distOffset: 6, delay: 0.15, size: 1.2, opacityMul: 1.2 },
  { angle: 344, distOffset: 4, delay: 0.38, size: 1.1, opacityMul: 1.3 },
]

const NEW_MOON_INNER_STAR_LAYOUT: Array<Omit<InnerStarSpec, "x" | "y"> & { xr: number; yr: number }> = [
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
