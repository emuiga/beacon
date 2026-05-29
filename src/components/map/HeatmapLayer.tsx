'use client'

import { useEffect, useRef } from 'react'
import type { GeoJSONSource } from 'maplibre-gl'
import { useMap } from './CrisisMap'
import { logger } from '@/lib/logger'

// ── Props ─────────────────────────────────────────────────────────────────────

export interface HeatmapLayerProps {
  points: Array<{ lat: number; lng: number; weight: number }>
  visible?: boolean
}

const SOURCE_ID = 'beacon-heatmap-source'
const LAYER_ID = 'beacon-heatmap'

// ── Helpers ───────────────────────────────────────────────────────────────────

type HeatmapGeoJSON = GeoJSON.GeoJSON

function buildGeoJSON(pts: HeatmapLayerProps['points']): HeatmapGeoJSON {
  return {
    type: 'FeatureCollection',
    features: pts.map((p) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [p.lng, p.lat],
      },
      properties: { weight: p.weight },
    })),
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export function HeatmapLayer({ points, visible = true }: HeatmapLayerProps) {
  const map = useMap()
  const addedRef = useRef(false)

  useEffect(() => {
    if (map === null) return

    const geojson = buildGeoJSON(points)

    map.addSource(SOURCE_ID, {
      type: 'geojson',
      data: geojson,
    })

    map.addLayer({
      id: LAYER_ID,
      type: 'heatmap',
      source: SOURCE_ID,
      paint: {
        'heatmap-weight': ['interpolate', ['linear'], ['get', 'weight'], 0, 0, 1, 1],
        'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 9, 3],
        'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, 9, 20],
        'heatmap-color': [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0, 'rgba(0,0,255,0)',
          0.1, 'rgba(0,100,255,0.6)',
          0.3, 'rgba(0,200,200,0.7)',
          0.5, 'rgba(0,200,0,0.8)',
          0.7, 'rgba(200,200,0,0.9)',
          1, 'rgba(200,0,0,1)',
        ],
        'heatmap-opacity': 0.8,
      },
    })

    addedRef.current = true
    logger.debug('HeatmapLayer added', { count: points.length })

    return () => {
      if (addedRef.current && map !== null) {
        try {
          if (map.getLayer(LAYER_ID) !== undefined) {
            map.removeLayer(LAYER_ID)
          }
          if (map.getSource(SOURCE_ID) !== undefined) {
            map.removeSource(SOURCE_ID)
          }
        } catch (err) {
          logger.warn('HeatmapLayer cleanup error', err)
        }
        addedRef.current = false
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map])

  // Update data when points change
  useEffect(() => {
    if (map === null || !addedRef.current) return
    const raw = map.getSource(SOURCE_ID)
    if (raw !== undefined) {
      const source = raw as GeoJSONSource
      source.setData(buildGeoJSON(points))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points, map])

  // Toggle visibility
  useEffect(() => {
    if (map === null || !addedRef.current) return
    try {
      map.setLayoutProperty(LAYER_ID, 'visibility', visible ? 'visible' : 'none')
    } catch (err) {
      logger.warn('HeatmapLayer visibility error', err)
    }
  }, [visible, map])

  return null
}
