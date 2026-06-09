'use client'

import { useEffect, useRef, useState, createContext, useContext } from 'react'
import type maplibregl from 'maplibre-gl'
import { MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM } from '@/lib/constants'
import { logger } from '@/lib/logger'

// ── Types ─────────────────────────────────────────────────────────────────────

type MapType = maplibregl.Map

// ── PMTiles protocol guard ────────────────────────────────────────────────────

let pmtilesRegistered = false

// ── Map context ───────────────────────────────────────────────────────────────

const MapContext = createContext<MapType | null>(null)

export function useMap(): MapType | null {
  return useContext(MapContext)
}

// ── Props ─────────────────────────────────────────────────────────────────────

export interface CrisisMapProps {
  className?: string
  initialCenter?: { lat: number; lng: number }
  initialZoom?: number
  children?: React.ReactNode
}

// ── Component ─────────────────────────────────────────────────────────────────

export function CrisisMap({
  className,
  initialCenter,
  initialZoom,
  children,
}: CrisisMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mapInstance, setMapInstance] = useState<MapType | null>(null)

  const center = initialCenter ?? MAP_DEFAULT_CENTER
  const zoom = initialZoom ?? MAP_DEFAULT_ZOOM

  useEffect(() => {
    if (containerRef.current === null) return

    let map: MapType | null = null

    async function init() {
      try {
        const [{ default: maplibregl }, { Protocol }] = await Promise.all([
          import('maplibre-gl'),
          import('pmtiles'),
        ])

        // Load CSS dynamically (avoids SSR issues)
        if (typeof document !== 'undefined') {
          const existingLink = document.querySelector('link[data-maplibre-css]')
          if (existingLink === null) {
            const link = document.createElement('link')
            link.rel = 'stylesheet'
            link.href = 'https://unpkg.com/maplibre-gl@5/dist/maplibre-gl.css'
            link.setAttribute('data-maplibre-css', 'true')
            document.head.appendChild(link)
          }
        }

        // Register PMTiles protocol once
        if (!pmtilesRegistered) {
          const protocol = new Protocol()
          maplibregl.addProtocol('pmtiles', protocol.tile.bind(protocol))
          pmtilesRegistered = true
        }

        if (containerRef.current === null) return

        map = new maplibregl.Map({
          container: containerRef.current,
          style: process.env['NEXT_PUBLIC_MAP_STYLE'] ?? 'https://tiles.openfreemap.org/styles/liberty',
          center: [center.lng, center.lat],
          zoom,
          attributionControl: false,
        })

        map.addControl(new maplibregl.NavigationControl(), 'top-right')
        map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right')

        map.on('load', () => {
          setMapInstance(map)
          logger.debug('CrisisMap loaded')
        })
      } catch (err) {
        logger.error('CrisisMap init error', err)
      }
    }

    void init()

    return () => {
      if (map !== null) {
        map.remove()
        setMapInstance(null)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className={`relative ${className ?? ''}`}>
      <div ref={containerRef} className="absolute inset-0" />
      {mapInstance !== null && (
        <MapContext.Provider value={mapInstance}>
          {children}
        </MapContext.Provider>
      )}
    </div>
  )
}
