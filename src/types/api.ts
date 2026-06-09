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

export type ReportStatus = 'pending' | 'verified' | 'rejected' | 'duplicate'

export type PhotoStatus =
  | 'pending'
  | 'processing'
  | 'accepted'
  | 'rejected'
  | 'insufficient_quality'
  | 'ai_processing_failed'

export type ElectricityStatus = 'functional' | 'non_functional' | 'unknown'

export type HealthServicesStatus = 'accessible' | 'inaccessible' | 'unknown'

export type UserRole = 'anonymous' | 'anonymous_reporter' | 'reporter' | 'analyst' | 'admin'

export type TrustTier = 0 | 1 | 2

// ── Report submission ─────────────────────────────────────────────────────────

// Fields sent as the `metadata` JSON string in the multipart form POST /reports
export interface ReportMetadata {
  crisis_type: CrisisType
  infrastructure_type: InfrastructureType
  damage_severity: DamageSeverity
  lat?: number
  lng?: number
  gps_accuracy_m?: number
  landmark_description?: string
  electricity_status?: ElectricityStatus
  health_services_status?: HealthServicesStatus
  most_pressing_needs?: string
  debris_clearing_needed?: boolean
}

// Full submission including photo file (used in frontend form state)
export interface ReportSubmission extends ReportMetadata {
  photo: File | null
}

// ── Auth responses ────────────────────────────────────────────────────────────

export interface AnonymousAuthResponse {
  session_token: string
}

// POST /auth/otp/verify response
export interface OtpVerifyResponse {
  token: string
  refresh_token: string
  role: string
}

// POST /auth/refresh response
export interface TokenRefreshResponse {
  token: string
  refresh_token: string
}

// ── Report responses ──────────────────────────────────────────────────────────

// POST /reports response
export interface ReportCreateResponse {
  id: string
  status: ReportStatus
  building_id: string | null
}

// PATCH /reports/{id}/photo response
export interface ReportPhotoResponse {
  id: string
  photo_url: string
  status: string
}

// GET /reports/{id} — reporter's own report
export interface ReportDetailResponse {
  id: string
  building_id: string | null
  crisis_type: CrisisType
  infrastructure_type: InfrastructureType
  damage_severity: DamageSeverity
  lat: number | null
  lng: number | null
  gps_accuracy_m: number | null
  landmark_description: string | null
  electricity_status: ElectricityStatus | null
  health_services_status: HealthServicesStatus | null
  most_pressing_needs: string | null
  debris_clearing_needed: boolean | null
  photo_url: string | null
  photo_status: PhotoStatus
  status: ReportStatus
  reporter_trust_tier: number
  ai_severity_prediction: DamageSeverity | null
  ai_confidence: number | null
  ai_quality_score: number | null
  created_at: string
  updated_at: string
}

// GET /reports/nearby item
export interface NearbyReportItem {
  id: string
  lat: number
  lng: number
  status: ReportStatus
  damage_severity: DamageSeverity
  created_at: string
  similarity_score: number // 0–1, show warning if > 0.6
}

// ── GIS ───────────────────────────────────────────────────────────────────────

export interface BuildingMatch {
  building_id: string | null
  footprint_geojson: string | null  // GeoJSON Polygon as string
  confidence: number                // 0–1
  distance_m: number | null
}

// ── Analyst ───────────────────────────────────────────────────────────────────

// Item in GET /analyst/reports paginated list
export interface ReportSummary {
  id: string
  building_id: string | null
  crisis_type: CrisisType
  infrastructure_type: InfrastructureType
  damage_severity: DamageSeverity
  status: ReportStatus
  photo_status: PhotoStatus
  lat: number | null
  lng: number | null
  ai_confidence: number | null
  ai_severity_prediction: DamageSeverity | null
  ai_divergence: boolean | null
  reporter_trust_tier: number
  created_at: string
  updated_at: string
}

export interface AnalystNote {
  id: string
  body: string
  created_at: string
}

export interface TimelineItem {
  id: string
  damage_severity: DamageSeverity
  status: ReportStatus
  created_at: string
}

// GET /analyst/reports/{id} — full detail
export interface AnalystReportDetail {
  id: string
  building_id: string | null
  footprint_geojson: string | null
  crisis_type: CrisisType
  infrastructure_type: InfrastructureType
  damage_severity: DamageSeverity
  lat: number | null
  lng: number | null
  gps_accuracy_m: number | null
  landmark_description: string | null
  electricity_status: ElectricityStatus | null
  health_services_status: HealthServicesStatus | null
  most_pressing_needs: string | null
  debris_clearing_needed: boolean | null
  photo_url: string | null
  photo_status: PhotoStatus
  ai_quality_score: number | null
  ai_severity_prediction: DamageSeverity | null
  ai_confidence: number | null
  ai_divergence: boolean | null
  status: ReportStatus
  reporter_trust_tier: number
  analyst_notes: AnalystNote[]
  building_timeline: TimelineItem[]
  created_at: string
  updated_at: string
}

// PATCH /analyst/reports/{id}/status
export interface StatusTransitionRequest {
  status: ReportStatus
  reason_code?: string  // required when status == 'rejected'
  notes?: string
}

export interface StatusTransitionResponse {
  id: string
  status: string
  reporter_trust_tier: number
}

// POST /analyst/reports/{id}/notes
export interface AnalystNoteCreateRequest {
  body: string
}

// POST /analyst/reports/merge
export interface MergeRequest {
  primary_id: string
  duplicate_ids: string[]
}

export interface MergeResponse {
  primary_id: string
  merged_count: number
}

// ── Paginated list ────────────────────────────────────────────────────────────

export interface PaginatedReports {
  total: number
  page: number
  limit: number
  items: ReportSummary[]
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
  limit: number
}

// ── Stats ─────────────────────────────────────────────────────────────────────

export interface StatsSummary {
  total: number
  by_severity: {
    minimal: number
    partial: number
    destroyed: number
  }
  by_crisis_type: {
    flood: number
    earthquake: number
    conflict: number
    wildfire: number
    other: number
  }
  last_updated: string
}

// Heatmap returns a GeoJSON FeatureCollection
export interface HeatmapFeature {
  type: 'Feature'
  geometry: {
    type: 'Point'
    coordinates: [number, number]  // [lng, lat]
  }
  properties: {
    weight: number
  }
}

export interface HeatmapResponse {
  type: 'FeatureCollection'
  features: HeatmapFeature[]
}
