/**
 * Адміністративні райони м. Київ — спрощені прямокутники WGS84 для фільтрації за координатами.
 * Межі наближені; на стиках можливе неточне визначення.
 */
export type KyivDistrictId =
  | 'holosiivskyi'
  | 'darnytskyi'
  | 'desnianskyi'
  | 'dniprovskyi'
  | 'obolonskyi'
  | 'pecherskyi'
  | 'podilskyi'
  | 'sviatoshyn'
  | 'solomianskyi'
  | 'shevchenkivskyi'

export type KyivDistrictDef = {
  id: KyivDistrictId
  nameUk: string
  nameEn: string
  /** Менші райони перевіряються першими, щоб зменшити перетини на межах */
  bounds: { south: number; north: number; west: number; east: number }
}

/** Порядок: від менших (центральних) до більших */
export const KYIV_DISTRICTS: KyivDistrictDef[] = [
  {
    id: 'shevchenkivskyi',
    nameUk: 'Шевченківський',
    nameEn: 'Shevchenkivskyi',
    bounds: { south: 50.43, north: 50.47, west: 30.48, east: 30.54 },
  },
  {
    id: 'pecherskyi',
    nameUk: 'Печерський',
    nameEn: 'Pecherskyi',
    bounds: { south: 50.4, north: 50.44, west: 30.52, east: 30.58 },
  },
  {
    id: 'podilskyi',
    nameUk: 'Подільський',
    nameEn: 'Podilskyi',
    bounds: { south: 50.46, north: 50.51, west: 30.45, east: 30.52 },
  },
  {
    id: 'solomianskyi',
    nameUk: 'Солом’янський',
    nameEn: 'Solomianskyi',
    bounds: { south: 50.41, north: 50.46, west: 30.44, east: 30.50 },
  },
  {
    id: 'holosiivskyi',
    nameUk: 'Голосіївський',
    nameEn: 'Holosiivskyi',
    bounds: { south: 50.38, north: 50.43, west: 30.48, east: 30.56 },
  },
  {
    id: 'sviatoshyn',
    nameUk: 'Святошинський',
    nameEn: 'Sviatoshynskyi',
    bounds: { south: 50.44, north: 50.50, west: 30.34, east: 30.44 },
  },
  {
    id: 'obolonskyi',
    nameUk: 'Оболонський',
    nameEn: 'Obolonskyi',
    bounds: { south: 50.48, north: 50.56, west: 30.45, east: 30.52 },
  },
  {
    id: 'dniprovskyi',
    nameUk: 'Дніпровський',
    nameEn: 'Dniprovskyi',
    bounds: { south: 50.44, north: 50.50, west: 30.58, east: 30.66 },
  },
  {
    id: 'desnianskyi',
    nameUk: 'Деснянський',
    nameEn: 'Desnianskyi',
    bounds: { south: 50.50, north: 50.56, west: 30.58, east: 30.70 },
  },
  {
    id: 'darnytskyi',
    nameUk: 'Дарницький',
    nameEn: 'Darnytskyi',
    bounds: { south: 50.38, north: 50.46, west: 30.60, east: 30.72 },
  },
]

const DISTRICT_BY_ID = new Map(KYIV_DISTRICTS.map((d) => [d.id, d]))

const NAME_TO_ID: { pattern: RegExp; id: KyivDistrictId }[] = KYIV_DISTRICTS.map((d) => ({
  id: d.id,
  pattern: new RegExp(
    d.nameUk.replace(/’/g, `['']?`).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
    'iu',
  ),
}))

export function isKyivDistrictId(value: string): value is KyivDistrictId {
  return DISTRICT_BY_ID.has(value as KyivDistrictId)
}

export function getKyivDistrictById(id: KyivDistrictId | null | undefined): KyivDistrictDef | null {
  if (!id) return null
  return DISTRICT_BY_ID.get(id) ?? null
}

function inBounds(
  lat: number,
  lng: number,
  b: KyivDistrictDef['bounds'],
): boolean {
  return lat >= b.south && lat <= b.north && lng >= b.west && lng <= b.east
}

/** Визначення району за координатами (перший підходящий у порядку KYIV_DISTRICTS). */
export function getKyivDistrictIdFromCoordinates(lat: number, lng: number): KyivDistrictId | null {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  for (const d of KYIV_DISTRICTS) {
    if (inBounds(lat, lng, d.bounds)) return d.id
  }
  return null
}

/** Пошук назви району в тексті локації (Nominatim display_name тощо). */
export function getKyivDistrictIdFromLocationText(location: string): KyivDistrictId | null {
  const text = location.trim()
  if (!text) return null
  for (const { pattern, id } of NAME_TO_ID) {
    if (pattern.test(text)) return id
  }
  return null
}

export function normalizeDistrictKey(raw: string | null | undefined): KyivDistrictId | null {
  if (!raw) return null
  const s = raw.trim().toLowerCase()
  if (isKyivDistrictId(s)) return s
  for (const d of KYIV_DISTRICTS) {
    if (d.nameUk.toLowerCase() === s || d.nameEn.toLowerCase() === s) return d.id
  }
  return getKyivDistrictIdFromLocationText(raw)
}

export function resolveEventDistrict(opts: {
  district: string | null | undefined
  latitude: number | null
  longitude: number | null
  location: string
}): KyivDistrictId | null {
  const fromDb = normalizeDistrictKey(opts.district)
  if (fromDb) return fromDb
  if (opts.latitude != null && opts.longitude != null) {
    const fromCoords = getKyivDistrictIdFromCoordinates(opts.latitude, opts.longitude)
    if (fromCoords) return fromCoords
  }
  return getKyivDistrictIdFromLocationText(opts.location)
}

export function districtLabel(id: KyivDistrictId | null, lang: 'uk' | 'en'): string | null {
  const d = getKyivDistrictById(id)
  if (!d) return null
  return lang === 'en' ? d.nameEn : d.nameUk
}
