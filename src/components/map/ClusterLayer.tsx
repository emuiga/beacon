'use client'

import { useEffect, useLayoutEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import { useMap } from './CrisisMap'
import { logger } from '@/lib/logger'
import type { DamageSeverity } from '@/types/api'

// ── Props ─────────────────────────────────────────────────────────────────────

export interface ClusterLayerProps {
  reports: Array<{
    id: string
    lat: number | null
    lng: number | null
    damage_severity: DamageSeverity
  }>
  onReportClick?: (id: string) => void
}

const SOURCE_ID = 'beacon-reports'
const LAYER_CLUSTERS = 'beacon-clusters'
const LAYER_CLUSTER_COUNT = 'beacon-cluster-count'
const LAYER_UNCLUSTERED = 'beacon-unclustered'

const SEVERITY_COLORS: Record<DamageSeverity, string> = {
  minimal: '#2B8D43',
  partial: '#D46A00',
  destroyed: '#B53228',
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ClusterLayer({ reports, onReportClick }: ClusterLayerProps) {
  const map = useMap()
  const addedRef = useRef(false)
  const onReportClickRef = useRef(onReportClick)
  useLayoutEffect(() => {
    onReportClickRef.current = onReportClick
  }, [onReportClick])

  function buildGeoJSON(rpts: typeof reports) {
    return {
      type: 'FeatureCollection' as const,
      features: rpts
        .filter((r) => r.lat !== null && r.lng !== null)
        .map((r) => ({
          type: 'Feature' as const,
          geometry: {
            type: 'Point' as const,
            coordinates: [r.lng as number, r.lat as number],
          },
          properties: {
            id: r.id,
            severity: r.damage_severity,
          },
        })),
    }
  }

  useEffect(() => {
    if (map === null) return

    const geojson = buildGeoJSON(reports)

    map.addSource(SOURCE_ID, {
      type: 'geojson',
      data: geojson,
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50,
    })

    // Cluster circles
    map.addLayer({
      id: LAYER_CLUSTERS,
      type: 'circle',
      source: SOURCE_ID,
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step',
          ['get', 'point_count'],
          '#4A90D9',
          10, '#E8A838',
          50, '#E03C3C',
        ],
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          20,
          10, 30,
          50, 40,
        ],
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fff',
        'circle-opacity': 0.9,
      },
    })

    // Cluster count labels
    map.addLayer({
      id: LAYER_CLUSTER_COUNT,
      type: 'symbol',
      source: SOURCE_ID,
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
        'text-size': 13,
      },
      paint: {
        'text-color': '#fff',
      },
    })

    // Unclustered points
    map.addLayer({
      id: LAYER_UNCLUSTERED,
      type: 'circle',
      source: SOURCE_ID,
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': [
          'match',
          ['get', 'severity'],
          'minimal', SEVERITY_COLORS.minimal,
          'partial', SEVERITY_COLORS.partial,
          'destroyed', SEVERITY_COLORS.destroyed,
          '#6B7280',
        ],
        'circle-radius': 8,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fff',
      },
    })

    // Click: cluster → zoom
    map.on('click', LAYER_CLUSTERS, (e) => {
      const features = map.queryRenderedFeatures(e.point, { layers: [LAYER_CLUSTERS] })
      const first = features[0]
      if (first === undefined) return
      const clusterId = first.properties['cluster_id'] as number | undefined
      if (clusterId === undefined) return
      const source = map.getSource(SOURCE_ID)
      if (source === undefined || source.type !== 'geojson') return
      void (source as maplibregl.GeoJSONSource).getClusterExpansionZoom(clusterId).then((zoom) => {
        if (first.geometry.type === 'Point') {
          const coords = first.geometry.coordinates as [number, number]
          map.easeTo({ center: coords, zoom: zoom ?? map.getZoom() + 2 })
        }
      })
    })

    // Click: unclustered → report detail
    map.on('click', LAYER_UNCLUSTERED, (e) => {
      const features = map.queryRenderedFeatures(e.point, { layers: [LAYER_UNCLUSTERED] })
      const first = features[0]
      if (first === undefined) return
      const id = first.properties['id'] as string | undefined
      if (id !== undefined) {
        onReportClickRef.current?.(id)
      }
    })

    // Cursor change
    map.on('mouseenter', LAYER_CLUSTERS, () => {
      map.getCanvas().style.cursor = 'pointer'
    })
    map.on('mouseleave', LAYER_CLUSTERS, () => {
      map.getCanvas().style.cursor = ''
    })
    map.on('mouseenter', LAYER_UNCLUSTERED, () => {
      map.getCanvas().style.cursor = 'pointer'
    })
    map.on('mouseleave', LAYER_UNCLUSTERED, () => {
      map.getCanvas().style.cursor = ''
    })

    addedRef.current = true
    logger.debug('ClusterLayer added', { count: reports.length })

    return () => {
      if (map !== null) {
        try {
          for (const layer of [LAYER_UNCLUSTERED, LAYER_CLUSTER_COUNT, LAYER_CLUSTERS]) {
            if (map.getLayer(layer) !== undefined) {
              map.removeLayer(layer)
            }
          }
          if (map.getSource(SOURCE_ID) !== undefined) {
            map.removeSource(SOURCE_ID)
          }
        } catch (err) {
          logger.warn('ClusterLayer cleanup error', err)
        }
        addedRef.current = false
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map])

  // Update data when reports change
  useEffect(() => {
    if (map === null || !addedRef.current) return
    const source = map.getSource(SOURCE_ID)
    if (source !== undefined && source.type === 'geojson') {
      (source as maplibregl.GeoJSONSource).setData(buildGeoJSON(reports))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reports, map])

  return null
}
