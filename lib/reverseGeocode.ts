/** Текст локації для збереження в БД: OSM Nominatim або рядок координат. */
export async function locationLabelFromCoordinates(lat: number, lng: number): Promise<string> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lng))}`
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
    const data = (await res.json()) as { display_name?: string }
    const name = typeof data.display_name === 'string' ? data.display_name.trim() : ''
    if (name.length >= 2) {
      return name.slice(0, 500)
    }
  } catch {
    // ignore
  }
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`
}
