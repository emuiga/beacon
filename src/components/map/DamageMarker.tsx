'use client'

import { useEffect, useRef } from 'react'
import type maplibregl from 'maplibre-gl'
import { useMap } from './CrisisMap'
import { logger } from '@/lib/logger'
import type { DamageSeverity } from '@/types/api'

// ── Severity colours ──────────────────────────────────────────────────────────

const SEVERITY_COLORS: Record<DamageSeverity, string> = {
  minimal: '#2B8D43',
  partial: '#D46A00',
  destroyed: '#B53228',
}

// ── Props ─────────────────────────────────────────────────────────────────────

export interface DamageMarkerProps {
  lat: number
  lng: number
  severity: DamageSeverity
  draggable?: boolean
  onDragEnd?: (lat: number, lng: number) => void
  onClick?: () => void
  selected?: boolean
}

// ── Component ─────────────────────────────────────────────────────────────────

export function DamageMarker({
  lat,
  lng,
  severity,
  draggable,
  onDragEnd,
  onClick,
  selected,
}: DamageMarkerProps) {
  const map = useMap()
  const markerRef = useRef<maplibregl.Marker | null>(null)

  useEffect(() => {
    if (map === null) return

    async function init() {
      try {
        const { default: maplibregl } = await import('maplibre-gl')

        const el = document.createElement('div')
        const color = SEVERITY_COLORS[severity]

        el.style.width = '18px'
        el.style.height = '18px'
        el.style.borderRadius = '50%'
        el.style.backgroundColor = color
        el.style.border = '2px solid white'
        el.style.boxShadow = '0 1px 4px rgba(0,0,0,0.4)'
        el.style.cursor = onClick !== undefined ? 'pointer' : 'default'
        el.setAttribute('role', 'img')
        el.setAttribute('aria-label', `${severity} damage marker`)

        if (selected === true) {
          el.style.transform = 'scale(1.3)'
          el.style.outline = `3px solid ${color}`
          el.style.outlineOffset = '2px'
        }

        if (onClick !== undefined) {
          el.addEventListener('click', onClick)
        }

        const marker = new maplibregl.Marker({
          element: el,
          ...(draggable === true ? { draggable: true } : {}),
        })
          .setLngLat([lng, lat])
          .addTo(map!)

        if (onDragEnd !== undefined) {
          marker.on('dragend', () => {
            const lngLat = marker.getLngLat()
            onDragEnd(lngLat.lat, lngLat.lng)
          })
        }

        markerRef.current = marker
        logger.debug('DamageMarker added', { lat, lng, severity })
      } catch (err) {
        logger.error('DamageMarker init error', err)
      }
    }

    void init()

    return () => {
      if (markerRef.current !== null) {
        markerRef.current.remove()
        markerRef.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map])

  // Update position when coords change (without recreating marker)
  useEffect(() => {
    if (markerRef.current !== null) {
      markerRef.current.setLngLat([lng, lat])
    }
  }, [lat, lng])

  return null
}
