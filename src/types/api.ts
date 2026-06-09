// Minimal GeoJSON type (no @types/geojson installed — define locally)
export interface GeoJSONPolygon {
  type: 'Polygon'
  coordinates: number[][][]
}

// ── Enumerations ──────────────────────────────────────────────────────────────

export type DamageSeverity = 'minimal' | 'partial' | 'destroyed'

export type CrisisType = 'flood' | 'earthquake' | 'conflict' | 'wildfire' | 'other'

export type InfrastructureType =
  | 'residential'
  | 'commercial'
  | 'government'
  | 'utilities'
  | 'transport'
  | 'community'

export type ReportStatus =
  | 'pending'
  | 'processing'
  | 'verified'
  | 'duplicate'
  | 'rejected'

export type UserRole = 'anonymous' | 'reporter' | 'analyst' | 'admin'

export type TrustTier = 0 | 1 | 2

// ── API Shapes ────────────────────────────────────────────────────────────────

export interface ReportSubmission {
  photo: File                           // compressed client-side before upload
  crisis_type: CrisisType
  infrastructure_type: InfrastructureType
  damage_severity: DamageSeverity
  lat?: number                          // undefined if no GPS
  lng?: number
  landmark_description?: string         // fallback if no GPS
  electricity_status: boolean | null
  health_services_status: boolean | null
  most_pressing_needs?: string
  debris_clearing_needed: boolean
  session_token: string                 // anonymous or authenticated
}

export interface BuildingMatch {
  building_id: string | null            // null = unmapped structure
  footprint_geojson: GeoJSONPolygon | null
  confidence: number                    // 0–1
  distance_m: number
}

export interface DuplicateCheck {
  report_id: string
  similarity_score: number              // 0–1, show warning if > 0.6
  photo_url: string
  submitted_at: string
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface AnonymousAuthResponse {
  session_token: string
}

export interface OtpVerifyResponse {
  token: string
  refresh_token: string
  user: {
    id: string
    phone: string
    role: UserRole
    trust_tier: TrustTier
  }
}

export interface TokenRefreshResponse {
  token: string
}

// ── Reports ───────────────────────────────────────────────────────────────────

export interface ReportResponse {
  id: string
  status: ReportStatus
  crisis_type: CrisisType
  infrastructure_type: InfrastructureType
  damage_severity: DamageSeverity
  lat: number | null
  lng: number | null
  landmark_description: string | null
  electricity_status: boolean | null
  health_services_status: boolean | null
  most_pressing_needs: string | null
  debris_clearing_needed: boolean
  photo_url: string | null
  submitted_at: string
  updated_at: string
}

export interface AnalystReport extends ReportResponse {
  ai_confidence: number | null
  building_match: BuildingMatch | null
  analyst_notes: string | null
  reviewer_id: string | null
}

// ── Analyst actions ───────────────────────────────────────────────────────────

export interface StatusUpdateRequest {
  status: ReportStatus
  notes: string | null
}

export interface MergeRequest {
  primary_id: string
  duplicate_ids: string[]
}

// ── Stats ─────────────────────────────────────────────────────────────────────

export interface StatsSummary {
  total_reports: number
  verified: number
  pending: number
  processing: number
  by_severity: Record<DamageSeverity, number>
  by_crisis_type: Record<CrisisType, number>
}

export interface HeatmapPoint {
  lat: number
  lng: number
  weight: number
}

// ── Pagination ────────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  has_more: boolean
}

// ── Analyst filters ───────────────────────────────────────────────────────────

export interface AnalystFilters {
  crisis_type: CrisisType | null
  damage_severity: DamageSeverity | null
  infrastructure_type: InfrastructureType | null
  status: ReportStatus | null
  time_from: string | null
  time_to: string | null
  page: number
  page_size: number
}
