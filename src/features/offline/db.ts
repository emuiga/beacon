import { openDB, type IDBPDatabase, type DBSchema } from 'idb'
import type { CrisisType, DamageSeverity, InfrastructureType, ReportStatus } from '@/types/api'

export type QueueItemStatus = 'pending' | 'syncing' | 'failed'

export interface QueueItem {
  id: string
  status: QueueItemStatus
  attempts: number
  created_at: number
  metadata: {
    crisis_type: CrisisType
    infrastructure_type: InfrastructureType
    damage_severity: DamageSeverity
    lat?: number
    lng?: number
    landmark_description?: string
    electricity_status: boolean | null
    health_services_status: boolean | null
    most_pressing_needs?: string
    debris_clearing_needed: boolean
    session_token: string
  }
  photo_blob: Blob
  photo_preview_url: string
}

// A saved-but-not-submitted draft. All report fields are partial (nulls allowed).
export interface DraftItem {
  id: string
  created_at: number
  updated_at: number
  // Full photo blob compressed to ≤500 KB for storage efficiency
  photo_blob: Blob | null
  // 80×80 JPEG thumbnail for fast list rendering (~10–15 KB)
  photo_thumb: Blob | null
  crisis_type: CrisisType | null
  infrastructure_type: InfrastructureType | null
  damage_severity: DamageSeverity | null
  lat: number | null
  lng: number | null
  landmark_description: string
  electricity_status: boolean | null
  health_services_status: boolean | null
  most_pressing_needs: string
  debris_clearing_needed: boolean | null
  session_token: string
}

// Lightweight record of a report that was successfully submitted (online or synced).
export interface SubmittedItem {
  id: string          // report ID from backend
  local_id: string    // uuid we generated before submission
  submitted_at: number
  crisis_type: CrisisType
  infrastructure_type: InfrastructureType
  damage_severity: DamageSeverity
  status: ReportStatus
  // Small thumbnail for the list — copied from the draft or generated at submit time
  photo_thumb: Blob | null
}

interface BeaconDB extends DBSchema {
  queue: { key: string; value: QueueItem }
  drafts: { key: string; value: DraftItem }
  submitted: { key: string; value: SubmittedItem }
}

const DB_NAME    = 'crisismap-offline'
const DB_VERSION = 2

let _db: IDBPDatabase<BeaconDB> | null = null

export async function getDB(): Promise<IDBPDatabase<BeaconDB>> {
  if (_db !== null) return _db

  _db = await openDB<BeaconDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      // v1 → queue store (may already exist)
      if (!db.objectStoreNames.contains('queue')) {
        db.createObjectStore('queue', { keyPath: 'id' })
      }
      // v2 → new stores
      if (oldVersion < 2) {
        db.createObjectStore('drafts',    { keyPath: 'id' })
        db.createObjectStore('submitted', { keyPath: 'id' })
      }
    },
  })

  return _db
}
