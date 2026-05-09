/**
 * Приблизні межі м. Київ (WGS84), прямокутник для валідації та обмеження карти.
 * Не збігається з адмінкордоном 1:1, але покриває місто з невеликим запасом.
 */
export const KYIV_BOUNDS = {
  south: 50.245,
  north: 50.595,
  west: 30.345,
  east: 30.825,
} as const

export const KYIV_CENTER: [number, number] = [50.4501, 30.5234]

export function isCoordinatesInKyiv(lat: number, lng: number): boolean {
  return (
    lat >= KYIV_BOUNDS.south &&
    lat <= KYIV_BOUNDS.north &&
    lng >= KYIV_BOUNDS.west &&
    lng <= KYIV_BOUNDS.east
  )
}
