import type {
  CrisisType,
  DamageSeverity,
  InfrastructureType,
} from '@/types/api'

// ── Crisis types ──────────────────────────────────────────────────────────────

export const CRISIS_TYPES = {
  flood: 'flood',
  earthquake: 'earthquake',
  conflict: 'conflict',
  wildfire: 'wildfire',
  other: 'other',
} as const satisfies Record<CrisisType, CrisisType>

export const CRISIS_TYPE_LABELS: Record<CrisisType, string> = {
  flood: 'Flood',
  earthquake: 'Earthquake',
  conflict: 'Conflict',
  wildfire: 'Wildfire',
  other: 'Other',
}

// ── Infrastructure types ──────────────────────────────────────────────────────

export const INFRASTRUCTURE_TYPES = {
  residential: 'residential',
  commercial: 'commercial',
  government: 'government',
  utilities: 'utilities',
  transport: 'transport',
  community: 'community',
} as const satisfies Record<InfrastructureType, InfrastructureType>

export const INFRASTRUCTURE_TYPE_LABELS: Record<InfrastructureType, string> = {
  residential: 'Residential',
  commercial: 'Commercial',
  government: 'Government',
  utilities: 'Utilities',
  transport: 'Transport',
  community: 'Community',
}

// ── Damage severity ───────────────────────────────────────────────────────────

export const DAMAGE_SEVERITY = {
  minimal: 'minimal',
  partial: 'partial',
  destroyed: 'destroyed',
} as const satisfies Record<DamageSeverity, DamageSeverity>

export const DAMAGE_SEVERITY_LABELS: Record<DamageSeverity, string> = {
  minimal: 'Minimal',
  partial: 'Partial',
  destroyed: 'Complete Destruction',
}

// ── Electricity status ────────────────────────────────────────────────────────

export const ELECTRICITY_STATUS = {
  working: true,
  not_working: false,
  unknown: null,
} as const

export type ElectricityStatus = (typeof ELECTRICITY_STATUS)[keyof typeof ELECTRICITY_STATUS]

export const ELECTRICITY_STATUS_LABELS: Record<string, string> = {
  working: 'Working',
  not_working: 'Not Working',
  unknown: 'Unknown',
}

// ── Health services status ────────────────────────────────────────────────────

export const HEALTH_STATUS = {
  operational: true,
  not_operational: false,
  unknown: null,
} as const

export type HealthStatus = (typeof HEALTH_STATUS)[keyof typeof HEALTH_STATUS]

export const HEALTH_STATUS_LABELS: Record<string, string> = {
  operational: 'Operational',
  not_operational: 'Not Operational',
  unknown: 'Unknown',
}

// ── Duplicate detection thresholds ───────────────────────────────────────────

export const DUPLICATE_WARN_THRESHOLD = 0.6
export const DUPLICATE_AUTO_FLAG_THRESHOLD = 0.9
export const NEARBY_RADIUS_METERS = 30

// ── Map defaults (Kenya bounding box) ────────────────────────────────────────

export const KENYA_BOUNDS = [33.9, -4.7, 41.9, 4.6] as const
export const MAP_DEFAULT_CENTER = { lat: 0.0236, lng: 37.9062 }
export const MAP_DEFAULT_ZOOM = 6

// ── Image quality constraints ─────────────────────────────────────────────────

export const IMAGE_MIN_WIDTH = 640
export const IMAGE_MIN_HEIGHT = 480
export const IMAGE_MIN_SIZE_BYTES = 200 * 1024       // 200 KB
export const IMAGE_MAX_SIZE_BYTES = 15 * 1024 * 1024 // 15 MB
export const IMAGE_BLUR_THRESHOLD = 100
