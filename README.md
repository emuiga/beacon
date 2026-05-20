# Beacon

**Community-driven infrastructure damage reporting for sudden-onset crises**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![CI](https://github.com/ORIGIN-HQ/UNDP-frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/ORIGIN-HQ/UNDP-frontend/actions/workflows/ci.yml)

A Progressive Web App (PWA) that enables community members to report damaged or destroyed infrastructure — buildings, roads, utilities — immediately following floods, earthquakes, wildfires, or conflicts. Reports are geolocated, photo-documented, and fed to a real-time analyst dashboard for UNDP Regional Responders.

Built for the UNDP InnoCentive "Build the Future of Crisis Mapping" challenge.

---

## Quick start

```bash
git clone https://github.com/ORIGIN-HQ/UNDP-frontend.git
cd UNDP-frontend
pnpm install
cp .env.example .env.local
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000). Requires Node.js 20+ and pnpm 9+.

The backend (FastAPI) must run separately on `http://localhost:8000`. See the [technical specification](./CLAUDE.md) for the API contract.

---

## Architecture overview

The system has two primary interfaces:

- **Reporter App** — mobile-first PWA for citizens in the field. Works offline: reports are queued in IndexedDB and synced automatically when connectivity is restored.
- **Analyst Dashboard** — desktop-first UI for UNDP Analysts. Live map (MapLibre GL + PMTiles), severity-filtered feed, and CSV/GeoJSON/Shapefile export.

```
Next.js 15 (App Router)   →   FastAPI + PostgreSQL/PostGIS
Tailwind CSS + shadcn/ui      Redis Queue (async AI + GIS)
TanStack Query + Zustand
MapLibre GL + PMTiles (offline tiles)
Serwist service worker + IndexedDB
```

Full architectural decisions are documented in [CLAUDE.md](./CLAUDE.md).

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for branch naming, commit format, and PR process.

---

## License

[MIT](./LICENSE)
