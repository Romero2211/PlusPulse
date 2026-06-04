import {
  getKyivDistrictIdFromCoordinates,
  normalizeDistrictKey,
  type KyivDistrictId,
} from '@/lib/kyivDistricts'

export type LocationGeocodeResult = {
  label: string
  districtKey: KyivDistrictId | null
}

type NominatimAddress = {
  city_district?: string
  suburb?: string
  borough?: string
  state_district?: string
}

/** Текст локації та район Києва: OSM Nominatim або координати. */
export async function locationInfoFromCoordinates(
  lat: number,
  lng: number,
): Promise<LocationGeocodeResult> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lng))}&addressdetails=1`
  try {
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'Accept-Language': 'uk,en;q=0.9',
        'User-Agent': 'PlusPulseCharity/1.0 (volunteer events)',
      },
      cache: 'no-store',
    })
    if (!res.ok) {
      throw new Error('nominatim')
    }
    const data = (await res.json()) as {
      display_name?: string
      address?: NominatimAddress
    }
    const name = typeof data.display_name === 'string' ? data.display_name.trim() : ''
    const addr = data.address
    const districtFromAddr = normalizeDistrictKey(
      addr?.city_district ?? addr?.suburb ?? addr?.borough ?? addr?.state_district ?? null,
    )
    const districtKey = districtFromAddr ?? getKyivDistrictIdFromCoordinates(lat, lng)

    if (name.length >= 2) {
      return { label: name.slice(0, 500), districtKey }
    }
  } catch {
    // ignore
  }
  return {
    label: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
    districtKey: getKyivDistrictIdFromCoordinates(lat, lng),
  }
}

/** Текст локації для збереження в БД: OSM Nominatim або рядок координат. */
export async function locationLabelFromCoordinates(lat: number, lng: number): Promise<string> {
  const { label } = await locationInfoFromCoordinates(lat, lng)
  return label
}
