'use client'

import { useEffect, useRef, useState } from 'react'
import type { Map as LeafletMap, Marker as LeafletMarker } from 'leaflet'
import { useLanguage } from '@/contexts/LanguageContext'
import { KYIV_BOUNDS, KYIV_CENTER, isCoordinatesInKyiv } from '@/lib/kyivBounds'
import 'leaflet/dist/leaflet.css'

const DEFAULT_ZOOM = 11

type Props = {
  initialLatitude?: number | null
  initialLongitude?: number | null
}

function validInitial(ilat?: number | null, ilng?: number | null): { lat: number | null; lng: number | null } {
  if (ilat != null && ilng != null && isCoordinatesInKyiv(ilat, ilng)) {
    return { lat: ilat, lng: ilng }
  }
  return { lat: null, lng: null }
}

export default function EventLocationMapPicker({ initialLatitude = null, initialLongitude = null }: Props) {
  const { t } = useLanguage()
  const tRef = useRef(t)
  tRef.current = t
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const markerRef = useRef<LeafletMarker | null>(null)
  const lastValidRef = useRef<{ lat: number; lng: number } | null>(null)

  const init = validInitial(initialLatitude, initialLongitude)
  const [lat, setLat] = useState<number | null>(init.lat)
  const [lng, setLng] = useState<number | null>(init.lng)
  const [mapError, setMapError] = useState<string | null>(null)

  useEffect(() => {
    const p = validInitial(initialLatitude, initialLongitude)
    setLat(p.lat)
    setLng(p.lng)
    lastValidRef.current = p.lat != null && p.lng != null ? { lat: p.lat, lng: p.lng } : null
  }, [initialLatitude, initialLongitude])

  useEffect(() => {
    let cancelled = false
    const el = containerRef.current
    if (!el) return

    import('leaflet').then((L) => {
      if (cancelled || !containerRef.current) return

      const proto = L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown }
      delete proto._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const kyivBounds = L.latLngBounds(
        L.latLng(KYIV_BOUNDS.south, KYIV_BOUNDS.west),
        L.latLng(KYIV_BOUNDS.north, KYIV_BOUNDS.east),
      )

      const hasPin =
        initialLatitude != null && initialLongitude != null && isCoordinatesInKyiv(initialLatitude, initialLongitude)
      const viewLat = hasPin ? initialLatitude! : KYIV_CENTER[0]
      const viewLng = hasPin ? initialLongitude! : KYIV_CENTER[1]
      const zoom = hasPin ? 14 : DEFAULT_ZOOM

      const map = L.map(containerRef.current!, {
        scrollWheelZoom: true,
        maxBounds: kyivBounds,
        maxBoundsViscosity: 0.85,
      }).setView([viewLat, viewLng], zoom)
      mapRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(map)

      const showOutsideKyiv = () => {
        setMapError(tRef.current('events.mapOutsideKyiv'))
        window.setTimeout(() => setMapError(null), 4000)
      }

      const attachDrag = (m: LeafletMarker) => {
        m.on('dragend', () => {
          const p = m.getLatLng()
          if (!isCoordinatesInKyiv(p.lat, p.lng)) {
            const prev = lastValidRef.current
            if (prev) {
              m.setLatLng([prev.lat, prev.lng])
            } else {
              m.setLatLng(KYIV_CENTER)
            }
            showOutsideKyiv()
            return
          }
          lastValidRef.current = { lat: p.lat, lng: p.lng }
          setLat(p.lat)
          setLng(p.lng)
        })
      }

      if (hasPin) {
        const m = L.marker([initialLatitude!, initialLongitude!], { draggable: true }).addTo(map)
        markerRef.current = m
        lastValidRef.current = { lat: initialLatitude!, lng: initialLongitude! }
        attachDrag(m)
      }

      map.on('click', (e) => {
        const { lat: la, lng: lo } = e.latlng
        if (!isCoordinatesInKyiv(la, lo)) {
          showOutsideKyiv()
          return
        }
        setMapError(null)
        setLat(la)
        setLng(lo)
        lastValidRef.current = { lat: la, lng: lo }
        if (markerRef.current) {
          markerRef.current.setLatLng([la, lo])
        } else {
          const m = L.marker([la, lo], { draggable: true }).addTo(map)
          markerRef.current = m
          attachDrag(m)
        }
      })
    })

    return () => {
      cancelled = true
      mapRef.current?.remove()
      mapRef.current = null
      markerRef.current = null
    }
  }, [initialLatitude, initialLongitude])

  const clearPin = () => {
    setLat(null)
    setLng(null)
    setMapError(null)
    lastValidRef.current = null
    markerRef.current?.remove()
    markerRef.current = null
  }

  return (
    <div className="events-map-block">
      <p className="events-map-hint">{t('events.mapHintKyiv')}</p>
      {mapError ? (
        <p className="events-map-error" role="alert">
          {mapError}
        </p>
      ) : null}
      <div ref={containerRef} className="events-map-wrap" role="presentation" />
      <input type="hidden" name="latitude" value={lat === null ? '' : String(lat)} readOnly />
      <input type="hidden" name="longitude" value={lng === null ? '' : String(lng)} readOnly />
      <div className="events-map-actions">
        <button type="button" className="events-map-clear-btn" onClick={clearPin}>
          {t('events.mapClear')}
        </button>
      </div>
    </div>
  )
}
