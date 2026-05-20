# CrisisMap — CLAUDE.md
# Project context for Claude Code — read this entire file before writing any code.

## ── PROJECT OVERVIEW ──────────────────────────────────────────────────────────

**Name:** beacon (replace with final name)
**Tagline:** Community-driven infrastructure damage reporting for sudden-onset crises
**Challenge:** UNDP InnoCentive "Build the Future of Crisis Mapping" — $50,000 prize
**Deadline:** June 24, 2026 (submission). Build to minimum TRL 4 (working prototype).
**License:** MIT
**Repo:** https://github.com/ORIGIN-HQ/UNDP-frontend

This is a **Progressive Web App (PWA)** that allows community members to report
damaged or destroyed infrastructure (buildings, roads, utilities) immediately
following crises such as floods, earthquakes, wildfires, and conflicts.

Reports are geolocated, photo-documented, classified by severity, and fed to a
real-time analyst dashboard. All data is anonymised, exportable (CSV/GeoJSON/
Shapefile), and designed for integration with GIS/humanitarian systems.

The system has TWO primary interfaces:
1. **Reporter App** — mobile-first PWA for citizens in the field
2. **Analyst Dashboard** — desktop-first web UI for UNDP Analysts and Regional Responders

---

## ── TECH STACK ────────────────────────────────────────────────────────────────

```
Framework:        Next.js 15 (App Router, TypeScript strict mode)
Styling:          Tailwind CSS v3 + shadcn/ui components
State (server):   TanStack Query v5 (React Query) — all API calls go through this
State (client):   Zustand — UI state, offline queue, sync status
Maps:             MapLibre GL JS + PMTiles (offline-capable, open source)
                  Basemap tiles: OpenFreeMap (free, no API key needed)
Forms:            react-hook-form + zod (validation schemas are the source of truth)
Offline:          Serwist (next-pwa successor) — service worker + background sync
                  IndexedDB via idb — offline report queue storage
i18n:             i18next + react-i18next (English + Swahili at minimum)
Error tracking:   Sentry (@sentry/nextjs)
Analytics:        Vercel Analytics (built-in, zero config)
Image handling:   browser-image-compression (client-side compress before upload)
```

**Do NOT use:**
- Google Maps or any paid map provider
- localStorage / sessionStorage (use IndexedDB via idb for persistence)
- Redux (use Zustand)
- CSS-in-JS / styled-components / emotion
- `any` TypeScript type (strict mode is non-negotiable)
- Default exports for components (named exports only)
- `console.log` in production code (use a logger utility)

---

## ── BACKEND CONTRACT ──────────────────────────────────────────────────────────

Backend is developed separately by a colleague. It runs on:
- **Local dev:** `http://localhost:8000` (fill in agreed port, default 8000)
- **Staging:** `https://api-staging.beacon.org`
- **Production:** `https://api.beacon.org`

The backend stack is: **Python/FastAPI + PostgreSQL/PostGIS + Redis Queue**
Backend handles: Auth (JWT issuance), AI processing (async), GIS matching, dedup.
Frontend NEVER calls AI or GIS services directly — always via backend API.

### API Endpoints (REST, all prefixed `/api/v1`)

```typescript
// AUTH
POST   /auth/otp/send              // { phone: string }
POST   /auth/otp/verify            // { phone: string, otp: string } → { token, user }
POST   /auth/anonymous             // {} → { session_token }
POST   /auth/refresh               // { refresh_token } → { token }
DELETE /auth/logout

// REPORTS (citizen-facing)
POST   /reports                    // multipart/form-data — see ReportSubmission type
GET    /reports/nearby             // ?lat=&lng=&radius_m=30 → DuplicateCheck[]
GET    /reports/:id                // single report status

// ANALYST (requires analyst role JWT)
GET    /analyst/reports            // paginated, filterable
GET    /analyst/reports/:id
PATCH  /analyst/reports/:id/status // { status, notes }
POST   /analyst/reports/merge      // { primary_id, duplicate_ids[] }

// GIS
GET    /gis/building/match         // ?lat=&lng= → BuildingMatch
GET    /gis/tiles/:z/:x/:y.mvt     // vector tile proxy (optional — use PMTiles instead)

// EXPORT (analyst only)
GET    /export/geojson             // ?filters...
GET    /export/csv                 // ?filters...
GET    /export/shapefile           // ?filters... → .zip

// STATS (public, cached)
GET    /stats/summary              // dashboard counters
GET    /stats/heatmap              // aggregated points for heatmap layer
```

### Key TypeScript types (define in `src/types/api.ts`)

```typescript
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

export interface ReportSubmission {
  photo: File                         // compressed client-side before upload
  crisis_type: CrisisType
  infrastructure_type: InfrastructureType
  damage_severity: DamageSeverity
  lat?: number                        // undefined if no GPS
  lng?: number
  landmark_description?: string       // fallback if no GPS
  electricity_status: boolean | null
  health_services_status: boolean | null
  most_pressing_needs?: string
  debris_clearing_needed: boolean
  session_token: string               // anonymous or authenticated
}

export interface BuildingMatch {
  building_id: string | null          // null = unmapped structure
  footprint_geojson: GeoJSON.Polygon | null
  confidence: number                  // 0–1
  distance_m: number
}

export interface DuplicateCheck {
  report_id: string
  similarity_score: number            // 0–1, show warning if > 0.6
  photo_url: string
  submitted_at: string
}
```

---

## ── PROJECT STRUCTURE ─────────────────────────────────────────────────────────

```
/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                  # lint + typecheck + test on every PR
│   │   ├── deploy-staging.yml      # deploy to staging on merge to develop
│   │   └── deploy-prod.yml         # deploy to prod on release tag vX.X.X
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   ├── feature_request.md
│   │   └── question.md
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── CODEOWNERS
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── (reporter)/             # Route group: citizen reporter
│   │   │   ├── page.tsx            # Landing / home (install prompt, start report)
│   │   │   ├── report/
│   │   │   │   ├── page.tsx        # Multi-step report wizard
│   │   │   │   └── success/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (analyst)/              # Route group: analyst dashboard
│   │   │   ├── dashboard/page.tsx  # Main dashboard (map + feed)
│   │   │   ├── reports/
│   │   │   │   ├── page.tsx        # Reports list with filters
│   │   │   │   └── [id]/page.tsx   # Report detail + review
│   │   │   ├── export/page.tsx
│   │   │   └── layout.tsx
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   └── callback/page.tsx
│   │   ├── api/                    # Next.js API routes (BFF layer only)
│   │   │   └── health/route.ts
│   │   ├── globals.css
│   │   ├── layout.tsx              # Root layout — providers, fonts, PWA meta
│   │   └── manifest.ts             # next-pwa manifest
│   ├── components/
│   │   ├── ui/                     # shadcn/ui primitives (auto-generated, do not edit)
│   │   ├── map/
│   │   │   ├── CrisisMap.tsx       # Main MapLibre map component
│   │   │   ├── DamageMarker.tsx    # Severity-colored markers
│   │   │   ├── HeatmapLayer.tsx
│   │   │   ├── ClusterLayer.tsx
│   │   │   └── BuildingFootprint.tsx
│   │   ├── report/
│   │   │   ├── ReportWizard.tsx    # Multi-step form orchestrator
│   │   │   ├── steps/
│   │   │   │   ├── PhotoStep.tsx   # Camera capture + quality check
│   │   │   │   ├── CrisisTypeStep.tsx
│   │   │   │   ├── InfraTypeStep.tsx
│   │   │   │   ├── SeverityStep.tsx
│   │   │   │   ├── LocationStep.tsx # GPS + map pin + landmark fallback
│   │   │   │   └── DetailsStep.tsx  # Extra fields + submit
│   │   │   ├── DuplicateWarning.tsx # "Similar report found nearby" UI
│   │   │   └── OfflineBanner.tsx
│   │   ├── analyst/
│   │   │   ├── ReportFeed.tsx
│   │   │   ├── FilterPanel.tsx
│   │   │   ├── ReportCard.tsx
│   │   │   ├── ReportDetail.tsx
│   │   │   ├── SeverityBadge.tsx
│   │   │   └── ExportPanel.tsx
│   │   └── shared/
│   │       ├── OfflineIndicator.tsx # Persistent sync status bar
│   │       ├── SyncQueue.tsx        # Pending submissions count
│   │       └── LanguageSwitcher.tsx
│   ├── features/
│   │   ├── offline/
│   │   │   ├── queue.ts            # IndexedDB queue management (idb)
│   │   │   ├── sync.ts             # Background sync logic
│   │   │   └── connectivity.ts     # Online/offline detection hook
│   │   ├── image/
│   │   │   ├── compress.ts         # browser-image-compression wrapper
│   │   │   ├── quality-check.ts    # Client-side blur/resolution check
│   │   │   └── exif.ts             # Extract GPS from EXIF if available
│   │   └── geolocation/
│   │       ├── gps.ts              # Geolocation API wrapper with timeout
│   │       └── building-match.ts   # Calls /gis/building/match
│   ├── hooks/
│   │   ├── useOfflineQueue.ts
│   │   ├── useConnectivity.ts
│   │   ├── useGeolocation.ts
│   │   ├── useDuplicateCheck.ts
│   │   └── useAnalystReports.ts
│   ├── lib/
│   │   ├── api.ts                  # Typed API client (wraps fetch, handles auth headers)
│   │   ├── query-client.ts         # TanStack Query client config
│   │   ├── constants.ts            # Enum-like objects for crisis/infra/severity types
│   │   ├── logger.ts               # Pino-based logger (replaces console.log)
│   │   └── utils.ts                # cn() and other shared utilities
│   ├── stores/
│   │   ├── auth.store.ts           # Session token, user role
│   │   ├── report-draft.store.ts   # In-progress report state across wizard steps
│   │   └── map.store.ts            # Map viewport, active filters
│   └── types/
│       ├── api.ts                  # All API request/response types (see above)
│       └── index.ts                # Re-exports
├── public/
│   ├── icons/                      # PWA icons (72, 96, 128, 144, 152, 192, 384, 512)
│   └── tiles/                      # PMTiles file (if bundled locally)
├── CLAUDE.md                       # ← this file
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── LICENSE
├── SECURITY.md
├── README.md
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json                   # strict: true, no exceptions
└── package.json
```

---

## ── APPLICATION FLOWS ────────────────────────────────────────────────────────

### Flow 1: Citizen Reporting (Online)

```
1. User opens app → connectivity check
2. Anonymous session token generated (no login required for basic reporting)
3. User taps "Report Damage"
4. Multi-step wizard (progress bar, back navigation):
   Step 1 — Photo: camera capture or gallery upload
            → client-side quality check (resolution ≥ 640×480, blur detection)
            → if fail: "Please retake — [reason]" with guidance
            → compress to ≤ 1MB before any upload
   Step 2 — Crisis Type: Flood / Earthquake / Conflict / Wildfire / Other
   Step 3 — Infrastructure Type: Residential / Commercial / Government /
                                  Utilities / Transport / Community
   Step 4 — Damage Severity: Minimal / Partial / Complete Destruction
   Step 5 — Location:
            → auto GPS (show accuracy radius on map)
            → user can drag pin to correct position
            → if no GPS: manual landmark text input
            → call /gis/building/match → show matched footprint on map
            → nearby duplicate check → show warning if similarity > 0.6
   Step 6 — Extra Details:
            → Electricity status (working / not working / unknown)
            → Health services status
            → Most pressing needs (text, optional)
            → Debris clearing needed (yes/no)
   Submit → POST /reports → success screen with report ID
```

### Flow 2: Citizen Reporting (Offline)

```
1. No internet → "Offline Mode" banner (amber)
2. Same wizard, same validation
3. On submit → save to IndexedDB queue (photo as Blob, metadata as JSON)
4. Show "Saved locally — will sync when connected" confirmation
5. Service worker watches connectivity → on restore → begin sync:
   a. Upload metadata first (POST /reports with photo placeholder)
   b. Upload photo (PATCH /reports/:id/photo)
   c. On success → mark as synced, remove from queue
   d. On failure → exponential backoff retry (max 5 attempts)
6. Sync status always visible in header (e.g. "2 reports pending sync")
```

### Flow 3: Analyst Dashboard

```
1. Login required (JWT via OTP or admin credentials)
2. Dashboard layout: left sidebar (filters) + main area (map + feed)
3. Map: heatmap layer + clustered markers, click cluster to zoom,
        click marker to open report detail panel
4. Right panel: chronological feed of incoming reports, severity-colored
5. Filters: Crisis Type, Damage Severity, Infrastructure Type, Time Range
6. Report detail: photo, metadata, AI confidence score, building footprint,
                  analyst actions (Verify / Reject / Flag Duplicate / Merge)
7. Export: filtered selection → CSV / GeoJSON / Shapefile (.zip)
```

---

## ── OFFLINE ARCHITECTURE ─────────────────────────────────────────────────────

### IndexedDB Schema (via `idb`)

```typescript
// DB name: 'crisismap-offline', version: 1
interface OfflineDB {
  queue: {                          // object store
    key: string                     // uuid
    value: {
      id: string
      status: 'pending' | 'syncing' | 'failed'
      attempts: number
      created_at: number            // timestamp
      metadata: Omit<ReportSubmission, 'photo'>
      photo_blob: Blob
      photo_preview_url: string     // local object URL for display
    }
  }
}
```

### Map Tiles — Offline Strategy

Use PMTiles with MapLibre GL JS:
- Load Kenya basemap from PMTiles CDN when online (no API key needed)
- Service worker caches tile requests using a `CacheFirst` strategy
- Analyst dashboard tiles can be pre-cached on first load
- PMTiles source: `https://data.source.coop/protomaps/openstreetmap/tiles/v3.pmtiles`
  (filter to Kenya bounding box: `[33.9, -4.7, 41.9, 4.6]`)

---

## ── IMAGE QUALITY CHECK (client-side) ───────────────────────────────────────

Implement in `src/features/image/quality-check.ts`:

```typescript
// 1. Resolution check: width >= 640 && height >= 480
// 2. File size: 200KB <= size <= 15MB (before compression)
// 3. Blur detection via canvas Laplacian variance:
//    - Draw to offscreen canvas
//    - Apply Laplacian kernel
//    - Compute variance of result
//    - If variance < BLUR_THRESHOLD (≈ 100): "Image is too blurry"
// Return: { ok: boolean, reason?: string }
```

Compression (before upload): `browser-image-compression` with:
```typescript
{ maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true }
```

EXIF GPS extraction (try before asking user for location):
```typescript
// Use 'exifr' package: await exifr.gps(file) → { latitude, longitude } | null
```

---

## ── DUPLICATE DETECTION (frontend) ─────────────────────────────────────────

After user confirms location in Step 5:
1. Call `GET /reports/nearby?lat=&lng=&radius_m=30`
2. If any result has `similarity_score > 0.6`:
   - Show `<DuplicateWarning>` component with photo comparison
   - "A similar report exists nearby — is this the same damage?"
   - Options: "Yes, this is the same" (discard draft) | "No, different damage" (continue)
3. If score > 0.9: auto-warn strongly, default to discard
4. If score < 0.6: no warning, proceed normally

---

## ── AUTHENTICATION ───────────────────────────────────────────────────────────

From Auth diagram: Anonymous OR Verified access → Session Token → Encrypted API.

**Anonymous reporters (default):**
- On first load, call `POST /auth/anonymous` → receive `session_token`
- Store in memory (Zustand) + sessionStorage as fallback
- All report submissions include this token

**Verified reporters (optional upgrade):**
- Phone number OTP flow
- JWT stored in httpOnly cookie (set by backend) + Zustand for UI state
- Benefit: reports get higher trust score, can track own submissions

**Analyst/Admin:**
- OTP or credential login → JWT with `role: 'analyst' | 'admin'`
- Protected routes: `/(analyst)/*` — middleware redirects if no valid JWT
- Role stored in Zustand `auth.store.ts`

**Middleware (`src/middleware.ts`):**
```typescript
// Protect /analyst/* routes
// Redirect to /auth/login if no valid session
// Allow all /(reporter)/* routes (anonymous access)
```

---

## ── CODE CONVENTIONS ─────────────────────────────────────────────────────────

### File naming
- Components: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- Utilities: `kebab-case.ts`
- Stores: `kebab-case.store.ts`
- Types: `kebab-case.ts` or `index.ts`

### Component pattern
```typescript
// Named export, explicit props interface, no default export
interface ReportCardProps {
  report: AnalystReport
  onVerify: (id: string) => void
}

export function ReportCard({ report, onVerify }: ReportCardProps) {
  // early returns for loading/error states
  // keep under 200 lines — extract sub-components if larger
}
```

### API calls — always via TanStack Query
```typescript
// src/hooks/useReportSubmit.ts
export function useReportSubmit() {
  return useMutation({
    mutationFn: (data: ReportSubmission) => api.post('/reports', data),
    onSuccess: () => { /* invalidate nearby query */ },
    onError: (error) => { /* queue offline if network error */ }
  })
}
```

### Error handling
- Network errors during report submission → queue offline, never throw to user
- API errors → surface via toast (shadcn/ui Toaster), never raw error messages
- All async functions must handle both `error` and `offline` cases

### Internationalisation
```typescript
// All user-facing strings must use t() — no hardcoded English
// src/locales/en.json and sw.json
// Key format: namespace.component.key e.g. "report.severity.minimal"
```

### Accessibility
- All interactive elements: keyboard navigable, ARIA labels
- Damage severity buttons: large touch targets (min 44×44px) for field use
- Colour is never the only indicator (severity uses icon + colour + text)
- Images: always alt text

---

## ── CI/CD ─────────────────────────────────────────────────────────────────────

### `.github/workflows/ci.yml`
Triggers: every PR to `main` or `develop`
Steps:
1. `pnpm install --frozen-lockfile`
2. `pnpm run type-check` (`tsc --noEmit`)
3. `pnpm run lint` (`next lint`)
4. `pnpm run test` (Vitest)
5. `pnpm run build` (catch build-time errors)

### Branch strategy
```
main        ← production (protected, requires PR + passing CI)
develop     ← integration (protected, requires PR)
feature/*   ← new features, branch from develop
fix/*       ← bug fixes
docs/*      ← documentation only
chore/*     ← tooling, dependencies
```

### Commit convention (Conventional Commits)
```
feat(report): add offline queue for photo submissions
fix(map): correct building footprint rendering on mobile
docs(readme): update local development setup
chore(deps): upgrade maplibre-gl to 4.x
```

### Deployment
- **Staging:** Vercel preview deploys on every `develop` push
- **Production:** Vercel production deploy on `vX.X.X` tag
- Environment variables via Vercel dashboard (never commit `.env`)

---

## ── ENVIRONMENT VARIABLES ────────────────────────────────────────────────────

```bash
# .env.local (never commit — add to .gitignore)
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_MAP_STYLE=https://tiles.openfreemap.org/styles/liberty
NEXT_PUBLIC_PMTILES_URL=https://data.source.coop/protomaps/openstreetmap/tiles/v3.pmtiles
NEXT_PUBLIC_SENTRY_DSN=                    # fill in after Sentry project created
NEXT_PUBLIC_APP_ENV=development            # development | staging | production
SENTRY_AUTH_TOKEN=                         # server-side only
```

---

## ── OPEN SOURCE REQUIREMENTS ─────────────────────────────────────────────────

This project is open source (MIT). Every contribution must follow:

1. **CONTRIBUTING.md** must explain: local setup, branch naming, commit format, PR process
2. **ISSUE_TEMPLATE** must exist for: Bug Report, Feature Request, Question
3. **No secrets** in code — environment variables for all config
4. **No vendor lock-in** for core features — all map/tile providers must be swappable
5. **README.md** must include: project description, screenshots, quick start (5 commands max), API contract link, architecture diagram, license badge

---

## ── OPEN QUESTIONS (resolve before building these features) ─────────────────

The following are decided at architecture level but need backend confirmation:

| Question | Decision | Status |
|---|---|---|
| KYC | No KYC — phone OTP optional, anonymous by default | ✅ Decided |
| Image NSFW check | Backend handles (AWS Rekognition or equiv), before storage | ✅ Decided |
| Building footprint source | Microsoft Africa Building Footprints via PostGIS | ✅ Decided |
| Duplicate threshold | Score > 0.9 auto-flag, 0.6–0.9 warn, < 0.6 ignore | ✅ Decided |
| Damage scale | Minimal / Partial / Complete Destruction | ✅ Decided |
| Auth provider | Backend issues plain JWTs. Auth provider TBD — frontend will use Bearer token pattern, swappable. | ✅ Decided |
| Deployment | Vercel for frontend (free, open source). VPS via Docker for backend. Frontend env var NEXT_PUBLIC_API_URL points to VPS backend URL. | ✅ Decided |
| Project name | beacon | ✅ Decided |
| Backend local port | 8000 | ✅ Decided |

---

## ── GETTING STARTED (for contributors) ──────────────────────────────────────

```bash
git clone https://github.com/ORIGIN-HQ/UNDP-frontend
cd beacon
pnpm install
cp .env.example .env.local   # fill in values
pnpm run dev                  # http://localhost:3000
```

Requirements: Node.js 20+, pnpm 9+

---

*This file is the single source of truth for Claude Code working on this project.
Update it as architectural decisions are made. Do not delete sections — mark them
as resolved instead.*
