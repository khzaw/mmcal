// Myanmar (Burmese) Calendar Calculation Engine
// Based on: http://cool-emerald.blogspot.com/2013/06/algorithm-program-and-calculation-of.html
// Original algorithm by Yan Naing Aye (MIT License)
// Adapted to TypeScript

// ============================================================
// Constants
// ============================================================
const SY = 1577917828.0 / 4320000.0 // solar year (365.2587565)
const LM = 1577917828.0 / 53433336.0 // lunar month (29.53058795)
const MO = 1954168.050623 // beginning of 0 ME for MMT
const SE3 = 1312 // beginning of 3rd Era

// ============================================================
// Types
// ============================================================
export interface MyanmarDate {
  myt: number // year type [0=common, 1=little watat, 2=big watat]
  my: number // Myanmar year
  mm: number // month [Tagu=1,...,Tabaung=12, 1st Waso=0, Late Tagu=13, Late Kason=14]
  md: number // day of the month [1-30]
}

export interface WesternDate {
  y: number
  m: number
  d: number
  h: number
  n: number
  s: number
}

export interface MyConst {
  EI: number
  WO: number
  NM: number
  EW: number
}

export interface CalMyResult {
  myt: number
  tg1: number
  fm: number
  werr: number
}

export interface CalWatatResult {
  fm: number
  watat: number
}

export interface ThingyanResult {
  ja: number
  jk: number
  atn: number
  akn: number
}

export interface CalendarDayInfo {
  jdn: number
  gregorian: { year: number; month: number; day: number }
  myanmar: MyanmarDate
  moonPhase: number // 0=waxing, 1=full moon, 2=waning, 3=new moon
  fortnightDay: number
  weekday: number // 0=sat, 1=sun, ..., 6=fri
  monthName: string
  moonPhaseName: string
  weekdayName: string
  holidays: string[]
  holidays2: string[]
  astro: string[]
  sabbath: number // 0=none, 1=sabbath, 2=sabbath eve
}

// ============================================================
// Binary search helpers
// ============================================================
function bSearch2(k: number, A: number[][]): number {
  let l = 0
  let u = A.length - 1
  while (u >= l) {
    const i = Math.floor((l + u) / 2)
    if (A[i]![0]! > k) u = i - 1
    else if (A[i]?.[0]! < k) l = i + 1
    else return i
  }
  return -1
}

function bSearch1(k: number, A: number[]): number {
  let l = 0
  let u = A.length - 1
  while (u >= l) {
    const i = Math.floor((l + u) / 2)
    if (A[i]! > k) u = i - 1
    else if (A[i]! < k) l = i + 1
    else return i
  }
  return -1
}

// ============================================================
// Julian Day Number conversions
// ============================================================
export function w2j(
  y: number,
  m: number,
  d: number,
  h = 12,
  n = 0,
  s = 0,
  ct = 1, // default Gregorian
  SG = 2361222,
): number {
  const a = Math.floor((14 - m) / 12)
  y = y + 4800 - a
  m = m + 12 * a - 3
  let jd = d + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4)
  if (ct === 1) jd = jd - Math.floor(y / 100) + Math.floor(y / 400) - 32045
  else if (ct === 2) jd = jd - 32083
  else {
    jd = jd - Math.floor(y / 100) + Math.floor(y / 400) - 32045
    if (jd < SG) {
      jd = d + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - 32083
      if (jd > SG) jd = SG
    }
  }
  return jd + (h - 12) / 24 + n / 1440 + s / 86400
}

export function j2w(jd: number, ct = 1, SG = 2361222): WesternDate {
  let j: number
  let jf: number
  let y: number
  let m: number
  let d: number
  let h: number
  let n: number
  let s: number

  if (ct === 2 || (ct === 0 && jd < SG)) {
    j = Math.floor(jd + 0.5)
    jf = jd + 0.5 - j
    const b = j + 1524
    const c = Math.floor((b - 122.1) / 365.25)
    const f = Math.floor(365.25 * c)
    const e = Math.floor((b - f) / 30.6001)
    m = e > 13 ? e - 13 : e - 1
    d = b - f - Math.floor(30.6001 * e)
    y = m < 3 ? c - 4715 : c - 4716
  } else {
    j = Math.floor(jd + 0.5)
    jf = jd + 0.5 - j
    j -= 1721119
    y = Math.floor((4 * j - 1) / 146097)
    j = 4 * j - 1 - 146097 * y
    d = Math.floor(j / 4)
    j = Math.floor((4 * d + 3) / 1461)
    d = 4 * d + 3 - 1461 * j
    d = Math.floor((d + 4) / 4)
    m = Math.floor((5 * d - 3) / 153)
    d = 5 * d - 3 - 153 * m
    d = Math.floor((d + 5) / 5)
    y = 100 * y + j
    if (m < 10) {
      m += 3
    } else {
      m -= 9
      y = y + 1
    }
  }

  jf *= 24
  h = Math.floor(jf)
  jf = (jf - h) * 60
  n = Math.floor(jf)
  s = (jf - n) * 60
  return { y, m, d, h, n, s }
}

// ============================================================
// Myanmar Calendar Era Constants
// ============================================================
function GetMyConst(my: number): MyConst {
  let EI: number
  let WO: number
  let NM: number
  let EW = 0
  let fme: number[][]
  let wte: number[]

  if (my >= 1312) {
    EI = 3
    WO = -0.5
    NM = 8
    fme = [[1377, 1]]
    wte = [1344, 1345]
  } else if (my >= 1217) {
    EI = 2
    WO = -1
    NM = 4
    fme = [
      [1234, 1],
      [1261, -1],
    ]
    wte = [1263, 1264]
  } else if (my >= 1100) {
    EI = 1.3
    WO = -0.85
    NM = -1
    fme = [
      [1120, 1],
      [1126, -1],
      [1150, 1],
      [1172, -1],
      [1207, 1],
    ]
    wte = [1201, 1202]
  } else if (my >= 798) {
    EI = 1.2
    WO = -1.1
    NM = -1
    fme = [
      [813, -1],
      [849, -1],
      [851, -1],
      [854, -1],
      [927, -1],
      [933, -1],
      [936, -1],
      [938, -1],
      [949, -1],
      [952, -1],
      [963, -1],
      [968, -1],
      [1039, -1],
    ]
    wte = []
  } else {
    EI = 1.1
    WO = -1.1
    NM = -1
    fme = [
      [205, 1],
      [246, 1],
      [471, 1],
      [572, -1],
      [651, 1],
      [653, 2],
      [656, 1],
      [672, 1],
      [729, 1],
      [767, -1],
    ]
    wte = []
  }

  let i = bSearch2(my, fme)
  if (i >= 0) WO += fme[i]?.[1]!
  i = bSearch1(my, wte)
  if (i >= 0) EW = 1

  return { EI, WO, NM, EW }
}

// ============================================================
// Check watat (intercalary month)
// ============================================================
function cal_watat(my: number): CalWatatResult {
  const c = GetMyConst(my)
  const TA = (SY / 12 - LM) * (12 - c.NM)
  let ed = (SY * (my + 3739)) % LM
  if (ed < TA) ed += LM
  const fm = Math.round(SY * my + MO - ed + 4.5 * LM + c.WO)
  let watat = 0
  if (c.EI >= 2) {
    const TW = LM - (SY / 12 - LM) * c.NM
    if (ed >= TW) watat = 1
  } else {
    watat = (my * 7 + 2) % 19
    if (watat < 0) watat += 19
    watat = Math.floor(watat / 12)
  }
  watat ^= c.EW
  return { fm, watat }
}

// ============================================================
// Check Myanmar Year
// ============================================================
export function cal_my(my: number): CalMyResult {
  let yd = 0
  let nd = 0
  let werr = 0
  let fm = 0
  const y2 = cal_watat(my)
  let myt = y2.watat
  let y1: CalWatatResult
  do {
    yd++
    y1 = cal_watat(my - yd)
  } while (y1.watat === 0 && yd < 3)

  if (myt) {
    nd = (y2.fm - y1.fm) % 354
    myt = Math.floor(nd / 31) + 1
    fm = y2.fm
    if (nd !== 30 && nd !== 31) {
      werr = 1
    }
  } else {
    fm = y1.fm + 354 * yd
  }
  const tg1 = y1.fm + 354 * yd - 102
  return { myt, tg1, fm, werr }
}

// ============================================================
// Julian day number to Myanmar date
// ============================================================
export function j2m(jdn: number): MyanmarDate {
  jdn = Math.round(jdn)
  const my = Math.floor((jdn - 0.5 - MO) / SY)
  const yo = cal_my(my)
  let dd = jdn - yo.tg1 + 1
  const b = Math.floor(yo.myt / 2)
  const c = Math.floor(1 / (yo.myt + 1))
  const myl = 354 + (1 - c) * 30 + b
  const mmt = Math.floor((dd - 1) / myl)
  dd -= mmt * myl
  const a = Math.floor((dd + 423) / 512)
  let mm = Math.floor((dd - b * a + c * a * 30 + 29.26) / 29.544)
  const e = Math.floor((mm + 12) / 16)
  const f = Math.floor((mm + 11) / 16)
  const md = dd - Math.floor(29.544 * mm - 29.26) - b * e + c * f * 30
  mm += f * 3 - e * 4 + 12 * mmt
  return { myt: yo.myt, my, mm, md }
}

// ============================================================
// Myanmar date to Julian day number
// ============================================================
export function m2j(my: number, mm: number, md: number): number {
  const yo = cal_my(my)
  const mmt = Math.floor(mm / 13)
  mm = (mm % 13) + mmt
  const b = Math.floor(yo.myt / 2)
  const c = 1 - Math.floor((yo.myt + 1) / 2)
  mm += 4 - Math.floor((mm + 15) / 16) * 4 + Math.floor((mm + 12) / 16)
  let dd =
    md +
    Math.floor(29.544 * mm - 29.26) -
    c * Math.floor((mm + 11) / 16) * 30 +
    b * Math.floor((mm + 12) / 16)
  const myl = 354 + (1 - c) * 30 + b
  dd += mmt * myl
  return dd + yo.tg1 - 1
}

// ============================================================
// Moon phase from day of month, month, year type
// ============================================================
export function cal_mp(md: number, mm: number, myt: number): number {
  const mml = cal_mml(mm, myt)
  return Math.floor((md + 1) / 16) + Math.floor(md / 16) + Math.floor(md / mml)
}

// ============================================================
// Length of month
// ============================================================
export function cal_mml(mm: number, myt: number): number {
  let mml = 30 - (mm % 2)
  if (mm === 3) mml += Math.floor(myt / 2)
  return mml
}

// ============================================================
// Fortnight day
// ============================================================
export function cal_mf(md: number): number {
  return md - 15 * Math.floor(md / 16)
}

// ============================================================
// Year length
// ============================================================
export function cal_myl(myt: number): number {
  return 354 + (1 - Math.floor(1 / (myt + 1))) * 30 + Math.floor(myt / 2)
}

// ============================================================
// Sabbath
// ============================================================
export function cal_sabbath(md: number, mm: number, myt: number): number {
  const mml = cal_mml(mm, myt)
  let s = 0
  if (md === 8 || md === 15 || md === 23 || md === mml) s = 1
  if (md === 7 || md === 14 || md === 22 || md === mml - 1) s = 2
  return s
}

// ============================================================
// Yatyaza
// ============================================================
export function cal_yatyaza(mm: number, wd: number): number {
  const m1 = mm % 4
  let yatyaza = 0
  const wd1 = Math.floor(m1 / 2) + 4
  const wd2 = (1 - Math.floor(m1 / 2) + (m1 % 2)) * (1 + 2 * (m1 % 2))
  if (wd === wd1 || wd === wd2) yatyaza = 1
  return yatyaza
}

// ============================================================
// Pyathada
// ============================================================
export function cal_pyathada(mm: number, wd: number): number {
  const m1 = mm % 4
  let pyathada = 0
  const wda = [1, 3, 3, 0, 2, 1, 2]
  if (m1 === 0 && wd === 4) pyathada = 2
  if (m1 === wda[wd]) pyathada = 1
  return pyathada
}

// ============================================================
// Nagahle
// ============================================================
export function cal_nagahle(mm: number): number {
  if (mm <= 0) mm = 4
  return Math.floor((mm % 12) / 3)
}

// ============================================================
// Thamanyo
// ============================================================
export function cal_thamanyo(mm: number, wd: number): number {
  const mmt = Math.floor(mm / 13)
  mm = (mm % 13) + mmt
  if (mm <= 0) mm = 4
  let thamanyo = 0
  const m1 = mm - 1 - Math.floor(mm / 9)
  const wd1 = (m1 * 2 - Math.floor(m1 / 8)) % 7
  const wd2 = (wd + 7 - wd1) % 7
  if (wd2 <= 1) thamanyo = 1
  return thamanyo
}

// ============================================================
// Amyeittasote
// ============================================================
export function cal_amyeittasote(md: number, wd: number): number {
  const mf = md - 15 * Math.floor(md / 16)
  let amyeittasote = 0
  const wda = [5, 8, 3, 7, 2, 4, 1]
  if (mf === wda[wd]) amyeittasote = 1
  return amyeittasote
}

// ============================================================
// Warameittugyi
// ============================================================
export function cal_warameittugyi(md: number, wd: number): number {
  const mf = md - 15 * Math.floor(md / 16)
  let warameittugyi = 0
  const wda = [7, 1, 4, 8, 9, 6, 3]
  if (mf === wda[wd]) warameittugyi = 1
  return warameittugyi
}

// ============================================================
// Warameittunge
// ============================================================
export function cal_warameittunge(md: number, wd: number): number {
  const mf = md - 15 * Math.floor(md / 16)
  let warameittunge = 0
  const wn = (wd + 6) % 7
  if (12 - mf === wn) warameittunge = 1
  return warameittunge
}

// ============================================================
// Yatpote
// ============================================================
export function cal_yatpote(md: number, wd: number): number {
  const mf = md - 15 * Math.floor(md / 16)
  let yatpote = 0
  const wda = [8, 1, 4, 6, 9, 8, 7]
  if (mf === wda[wd]) yatpote = 1
  return yatpote
}

// ============================================================
// Thamaphyu
// ============================================================
export function cal_thamaphyu(md: number, wd: number): number {
  const mf = md - 15 * Math.floor(md / 16)
  let thamaphyu = 0
  const wda = [1, 2, 6, 6, 5, 6, 7]
  if (mf === wda[wd]) thamaphyu = 1
  const wdb = [0, 1, 0, 0, 0, 3, 3]
  if (mf === wdb[wd]) thamaphyu = 1
  if (mf === 4 && wd === 5) thamaphyu = 1
  return thamaphyu
}

// ============================================================
// Nagapor
// ============================================================
export function cal_nagapor(md: number, wd: number): number {
  let nagapor = 0
  const wda = [26, 21, 2, 10, 18, 2, 21]
  if (md === wda[wd]) nagapor = 1
  const wdb = [17, 19, 1, 0, 9, 0, 0]
  if (md === wdb[wd]) nagapor = 1
  if ((md === 2 && wd === 1) || ((md === 12 || md === 4 || md === 18) && wd === 2)) nagapor = 1
  return nagapor
}

// ============================================================
// Yatyotema
// ============================================================
export function cal_yatyotema(mm: number, md: number): number {
  const mmt = Math.floor(mm / 13)
  mm = (mm % 13) + mmt
  if (mm <= 0) mm = 4
  const mf = md - 15 * Math.floor(md / 16)
  let yatyotema = 0
  const m1 = mm % 2 ? mm : (mm + 9) % 12
  const m2 = ((m1 + 4) % 12) + 1
  if (mf === m2) yatyotema = 1
  return yatyotema
}

// ============================================================
// Mahayatkyan
// ============================================================
export function cal_mahayatkyan(mm: number, md: number): number {
  if (mm <= 0) mm = 4
  const mf = md - 15 * Math.floor(md / 16)
  let mahayatkyan = 0
  const m1 = ((Math.floor((mm % 12) / 2) + 4) % 6) + 1
  if (mf === m1) mahayatkyan = 1
  return mahayatkyan
}

// ============================================================
// Shanyat
// ============================================================
export function cal_shanyat(mm: number, md: number): number {
  const mmt = Math.floor(mm / 13)
  mm = (mm % 13) + mmt
  if (mm <= 0) mm = 4
  const mf = md - 15 * Math.floor(md / 16)
  let shanyat = 0
  const sya = [8, 8, 2, 2, 9, 3, 3, 5, 1, 4, 7, 4]
  if (mf === sya[mm - 1]) shanyat = 1
  return shanyat
}

// ============================================================
// Get astrological info
// ============================================================
export function cal_astro(jdn: number): string[] {
  jdn = Math.round(jdn)
  const yo = j2m(jdn)
  const { myt: _myt, mm, md } = yo
  const wd = (jdn + 2) % 7
  const hs: string[] = []
  if (cal_thamanyo(mm, wd)) hs.push("Thamanyo")
  if (cal_amyeittasote(md, wd)) hs.push("Amyeittasote")
  if (cal_warameittugyi(md, wd)) hs.push("Warameittugyi")
  if (cal_warameittunge(md, wd)) hs.push("Warameittunge")
  if (cal_yatpote(md, wd)) hs.push("Yatpote")
  if (cal_thamaphyu(md, wd)) hs.push("Thamaphyu")
  if (cal_nagapor(md, wd)) hs.push("Nagapor")
  if (cal_yatyotema(mm, md)) hs.push("Yatyotema")
  if (cal_mahayatkyan(mm, md)) hs.push("Mahayatkyan")
  if (cal_shanyat(mm, md)) hs.push("Shanyat")
  return hs
}

// ============================================================
// Thingyan calculation
// ============================================================
export function ThingyanTime(my: number): ThingyanResult {
  const ja = SY * my + MO
  let jk: number
  if (my >= SE3) jk = ja - 2.169918982
  else jk = ja - 2.1675
  return { ja, jk, atn: Math.round(ja), akn: Math.round(jk) }
}

// ============================================================
// Holidays
// ============================================================
export function cal_holiday(jdn: number): string[] {
  jdn = Math.round(jdn)
  const yo = j2m(jdn)
  const { myt, my, mm, md } = yo
  const mp = cal_mp(md, mm, myt)
  const mmt = Math.floor(mm / 13)
  const hs: string[] = []
  const go = j2w(jdn)
  const gy = go.y
  const gm = go.m
  const gd = go.d

  // Thingyan
  const BGNTG = 1100
  const ja = SY * (my + mmt) + MO
  let jk: number
  if (my >= SE3) jk = ja - 2.169918982
  else jk = ja - 2.1675
  const akn = Math.round(jk)
  const atn = Math.round(ja)

  if (jdn === atn + 1) hs.push("Myanmar New Year's Day")
  if (my + mmt >= BGNTG) {
    if (jdn === atn) hs.push("Thingyan Atat")
    else if (jdn > akn && jdn < atn) hs.push("Thingyan Akyat")
    else if (jdn === akn) hs.push("Thingyan Akya")
    else if (jdn === akn - 1) hs.push("Thingyan Akyo")
  }

  // Gregorian holidays
  if (gy >= 1948 && gm === 1 && gd === 4) hs.push("Independence Day")
  else if (gy >= 1947 && gm === 2 && gd === 12) hs.push("Union Day")
  else if (gy >= 1958 && gm === 3 && gd === 2) hs.push("Peasants' Day")
  else if (gy >= 1945 && gm === 3 && gd === 27) hs.push("Resistance Day")
  else if (gy >= 1923 && gm === 5 && gd === 1) hs.push("Labour Day")
  else if (gy >= 1947 && gm === 7 && gd === 19) hs.push("Martyrs' Day")
  else if (gy >= 1752 && gm === 12 && gd === 25) hs.push("Christmas Day")

  // Myanmar calendar holidays
  if (mm === 2 && mp === 1) hs.push("Buddha Day")
  else if (mm === 4 && mp === 1) hs.push("Start of Buddhist Lent")
  else if (mm === 7 && mp === 1) hs.push("End of Buddhist Lent")
  else if (mm === 8 && mp === 1) hs.push("Tazaungdaing")
  else if (my >= 1282 && mm === 8 && md === 25) hs.push("National Day")
  else if (mm === 10 && md === 1) hs.push("Karen New Year's Day")
  else if (mm === 12 && mp === 1) hs.push("Tabaung Pwe")

  return hs
}

export function cal_holiday2(jdn: number): string[] {
  jdn = Math.round(jdn)
  const yo = j2m(jdn)
  const { my, mm, md } = yo
  const mp = cal_mp(md, mm, yo.myt)
  const hs: string[] = []
  const go = j2w(jdn)
  const gy = go.y
  const gm = go.m
  const gd = go.d

  if (gy >= 1915 && gm === 2 && gd === 13) hs.push("G. Aung San BD")
  else if (mm === 9 && md === 1) {
    hs.push("Shan New Year's Day")
    if (my >= 1306) hs.push("Authors' Day")
  } else if (mm === 3 && mp === 1) hs.push("Mahathamaya Day")
  else if (mm === 6 && mp === 1) hs.push("Garudhamma Day")
  else if (my >= 1356 && mm === 10 && mp === 1) hs.push("Mothers' Day")
  else if (my >= 1370 && mm === 12 && mp === 1) hs.push("Fathers' Day")
  else if (mm === 5 && mp === 1) hs.push("Metta Day")

  return hs
}

// ============================================================
// Month and phase name helpers
// ============================================================
export const MONTH_NAMES: Record<number, string> = {
  0: "First Waso",
  1: "Tagu",
  2: "Kason",
  3: "Nayon",
  4: "Waso",
  5: "Wagaung",
  6: "Tawthalin",
  7: "Thadingyut",
  8: "Tazaungmon",
  9: "Nadaw",
  10: "Pyatho",
  11: "Tabodwe",
  12: "Tabaung",
  13: "Late Tagu",
  14: "Late Kason",
}

export const MOON_PHASE_NAMES = ["Waxing", "Full Moon", "Waning", "New Moon"]
export const WEEKDAY_NAMES = [
  "Saturday",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
]

export function getMonthName(mm: number, myt: number): string {
  let name = MONTH_NAMES[mm] || `Month ${mm}`
  if (mm === 4 && myt > 0) name = `Second ${name}`
  return name
}

// ============================================================
// Build full day info from JDN
// ============================================================
export function getDayInfo(jdn: number): CalendarDayInfo {
  jdn = Math.round(jdn)
  const go = j2w(jdn)
  const mmDate = j2m(jdn)
  const mp = cal_mp(mmDate.md, mmDate.mm, mmDate.myt)
  const mf = cal_mf(mmDate.md)
  const wd = (jdn + 2) % 7

  return {
    jdn,
    gregorian: { year: go.y, month: go.m, day: go.d },
    myanmar: mmDate,
    moonPhase: mp,
    fortnightDay: mf,
    weekday: wd,
    monthName: getMonthName(mmDate.mm, mmDate.myt),
    moonPhaseName: MOON_PHASE_NAMES[mp] ?? "Unknown",
    weekdayName: WEEKDAY_NAMES[wd] ?? "",
    holidays: cal_holiday(jdn),
    holidays2: cal_holiday2(jdn),
    astro: cal_astro(jdn),
    sabbath: cal_sabbath(mmDate.md, mmDate.mm, mmDate.myt),
  }
}

// ============================================================
// Get all days for a Gregorian month
// ============================================================
export function getGregorianMonthDays(year: number, month: number): CalendarDayInfo[] {
  const firstJdn = Math.round(w2j(year, month, 1))
  const nextMonth = month === 12 ? 1 : month + 1
  const nextYear = month === 12 ? year + 1 : year
  const lastJdn = Math.round(w2j(nextYear, nextMonth, 1))
  const days: CalendarDayInfo[] = []
  for (let jdn = firstJdn; jdn < lastJdn; jdn++) {
    days.push(getDayInfo(jdn))
  }
  return days
}

// ============================================================
// Sasana year
// ============================================================
export function my2sy(my: number): number {
  return my + 1182
}

// ============================================================
// Mahabote
// ============================================================
export function cal_mahabote(my: number, wd: number): number {
  return (my - wd) % 7
}

// ============================================================
// Nakhat
// ============================================================
export function cal_nakhat(my: number): number {
  return my % 3
}

export const NAKHAT_NAMES = ["Ogre", "Elf", "Human"]
export const MAHABOTE_NAMES = ["Binga", "Atun", "Yaza", "Adipati", "Marana", "Thike", "Puti"]
export const NAGAHLE_NAMES = ["West", "North", "East", "South"]
export const YEAR_TYPE_NAMES = ["Common", "Little Watat", "Big Watat"]
