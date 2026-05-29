'use client'

import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import { useMap } from './CrisisMap'
import { logger } from '@/lib/logger'

// ── Props ─────────────────────────────────────────────────────────────────────

export interface BuildingFootprintProps {
  geojson: { type: 'Polygon'; coordinates: number[][][] } | null
}

const SOURCE_ID = 'beacon-building'
const LAYER_FILL = 'beacon-building-fill'
const LAYER_OUTLINE = 'beacon-building-outline'

// ── Component ─────────────────────────────────────────────────────────────────

export function BuildingFootprint({ geojson }: BuildingFootprintProps) {
  const map = useMap()
  const addedRef = useRef(false)

  function buildGeoJSON(polygon: NonNullable<typeof geojson>) {
    return {
      type: 'FeatureCollection' as const,
      features: [
        {
          type: 'Feature' as const,
          geometry: polygon,
          properties: {},
        },
      ],
    }
  }

  function emptyGeoJSON() {
    return {
      type: 'FeatureCollection' as const,
      features: [],
    }
  }

  useEffect(() => {
    if (map === null) return

    // Add source + layers on mount
    map.addSource(SOURCE_ID, {
      type: 'geojson',
      data: geojson !== null ? buildGeoJSON(geojson) : emptyGeoJSON(),
    })

    map.addLayer({
      id: LAYER_FILL,
      type: 'fill',
      source: SOURCE_ID,
      paint: {
        'fill-color': 'hsl(221, 83%, 53%)',
        'fill-opacity': 0.2,
      },
    })

    map.addLayer({
      id: LAYER_OUTLINE,
      type: 'line',
      source: SOURCE_ID,
      paint: {
        'line-color': 'hsl(221, 83%, 53%)',
        'line-width': 2,
      },
    })

    addedRef.current = true
    logger.debug('BuildingFootprint layer added')

    return () => {
      if (map !== null) {
        try {
          for (const layer of [LAYER_FILL, LAYER_OUTLINE]) {
            if (map.getLayer(layer) !== undefined) {
              map.removeLayer(layer)
            }
          }
          if (map.getSource(SOURCE_ID) !== undefined) {
            map.removeSource(SOURCE_ID)
          }
        } catch (err) {
          logger.warn('BuildingFootprint cleanup error', err)
        }
        addedRef.current = false
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map])

  // Update source data when geojson changes
  useEffect(() => {
    if (map === null || !addedRef.current) return
    const source = map.getSource(SOURCE_ID)
    if (source !== undefined && source.type === 'geojson') {
      (source as maplibregl.GeoJSONSource).setData(geojson !== null ? buildGeoJSON(geojson) : emptyGeoJSON())
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geojson, map])

  return null
}
