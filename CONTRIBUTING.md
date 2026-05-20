# Contributing to Beacon

Thank you for your interest in contributing to Beacon. This document explains how to get started, how we work, and what we expect from contributors.

---

## Local setup

```bash
git clone https://github.com/ORIGIN-HQ/UNDP-frontend
cd beacon
pnpm install
cp .env.example .env.local   # fill in values
pnpm run dev                  # http://localhost:3000
```

**Requirements:** Node.js 20+, pnpm 9+

The backend (FastAPI) must be running separately on `http://localhost:8000`. See the backend repository for setup instructions.

---

## Branch naming

| Type | Pattern | Example |
|---|---|---|
| New feature | `feature/<short-description>` | `feature/offline-sync` |
| Bug fix | `fix/<short-description>` | `fix/map-marker-overlap` |
| Documentation | `docs/<short-description>` | `docs/api-contract` |
| Tooling / deps | `chore/<short-description>` | `chore/upgrade-maplibre` |

- Branch from `develop`, not `main`
- Keep branches focused — one feature or fix per branch
- Delete your branch after the PR is merged

---

## Commit format (Conventional Commits)

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

**Types:** `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `style`, `perf`

**Examples:**
```
feat(report): add offline queue for photo submissions
fix(map): correct building footprint rendering on mobile
docs(readme): update local development setup
chore(deps): upgrade maplibre-gl to 4.x
```

---

## Pull request process

1. Ensure `pnpm run type-check`, `pnpm run lint`, `pnpm run test`, and `pnpm run build` all pass locally
2. Fill in the PR template completely
3. Request review from at least one maintainer
4. Address all review comments before merging
5. Squash-merge into `develop` (the CI gate enforces passing checks)

**Never push directly to `main` or `develop`** — both are protected branches.

---

## Code conventions

See `CLAUDE.md` for the full list of conventions. Key points:

- TypeScript strict mode — no `any`, no `// @ts-ignore`
- Named exports only for components — no default exports
- No `console.log` in production code — use `logger` from `src/lib/logger.ts`
- All user-facing strings must use `t()` — no hardcoded English
- No `localStorage` / `sessionStorage` — use IndexedDB via `idb`

---

## Reporting bugs

Use the [Bug Report](https://github.com/ORIGIN-HQ/UNDP-frontend/issues/new?template=bug_report.md) issue template. Do not open security issues publicly — see `SECURITY.md`.

---

## Licence

By contributing, you agree that your contributions will be licensed under the MIT License.
