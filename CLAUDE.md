# StashPass Admin — CLAUDE.md

**Stack:** React 18 · Vite · TypeScript · Tailwind CSS  
**Repo:** github.com/MysterWolf/stashpass-admin  
**Deploy:** GitHub Pages → https://mysterwolf.github.io/stashpass-admin/  
**API:** https://stashpass-api-production.up.railway.app  
**Auth:** `x-api-secret: <CIRCLES_API_SECRET>` header — stored in browser localStorage  

---

## Overview

Admin-only dashboard for managing StashPass operators, locations, specials, and strains. No user login — the API secret is entered once and stored in localStorage. Locking clears the secret.

---

## Design System

| Token | Value |
|---|---|
| `bg` | `#0F1117` |
| `surface` | `#1A1D27` |
| `border` | `#2A2D3A` |
| `teal` | `#00C2A8` (primary accent) |
| `text` | `#E8EAF0` |
| `muted` | `#8A8FA0` |

Custom Tailwind classes: `input`, `btn-primary`, `btn-ghost`, `btn-danger`, `card`, `label`, `badge` — defined in `src/index.css` under `@layer components`.

---

## Navigation

- **Sidebar** — desktop (md+): persistent left column
- **BottomNav** — mobile: icons + labels at bottom
- **HashRouter** — required for GitHub Pages (no server-side routing)

---

## File Structure

```
src/
  api/
    client.ts         — fetch wrapper, getSecret/setSecret, API_BASE
    operators.ts      — all /operators/* API calls
    strains.ts        — stub; replace with real API calls when backend is ready
  components/
    Layout.tsx        — sidebar + main + bottom nav
    Sidebar.tsx       — desktop nav + lock button
    BottomNav.tsx     — mobile nav
    Modal.tsx         — reusable overlay modal
    Badge.tsx         — colored status chip
    Spinner.tsx       — teal loading indicator
  pages/
    Setup.tsx         — API secret entry screen (shown when localStorage empty)
    Dashboard.tsx     — stats overview + recent operators
    Operators.tsx     — list all operators, create new
    OperatorEdit.tsx  — 4-tab edit: Profile / Brand & Badges / Locations / Specials
    Strains.tsx       — strain list (session-only until API built)
    StrainEdit.tsx    — full strain intelligence form + AI enrichment placeholder
    Queue.tsx         — operators with tier='pending'
  types/index.ts      — TypeScript interfaces matching API shapes
```

---

## API Coverage

### Operators (real endpoints)
| Action | Endpoint |
|---|---|
| List all | `GET /operators[?tier=&category=]` |
| Get one | `GET /operators/:id` |
| Create | `POST /operators` |
| Get profile | `GET /operators/:id/profile` |
| Create/replace profile | `POST /operators/:id/profile` |
| Patch profile | `PUT /operators/:id/profile` |
| List locations | `GET /operators/:id/locations` |
| Add location | `POST /operators/:id/locations` |
| Update location | `PUT /operators/:id/locations/:locationId` |
| Delete location (soft) | `DELETE /operators/:id/locations/:locationId` |
| Replace specials | `POST /operators/:id/specials` |
| Delete special | `DELETE /operators/:id/specials/:specialId` |

### Strains (not yet built)
The `src/api/strains.ts` file stubs all CRUD with in-memory mock data. To wire up:
1. Add `strains` table + migration to `stashpass-api`
2. Add `GET/POST/PUT/DELETE /strains` routes
3. Replace stub functions in `src/api/strains.ts` with real `api.get/post/put/delete` calls
4. Remove the `STRAINS_STUB` warning banners

---

## Invariants

- The `GET /operators` route was added in the admin dashboard session (with `?tier` / `?category` filters). It joins `operator_locations` to include `location_count`.
- `x-api-secret` is the only auth mechanism. The setup screen shows when `localStorage.getItem('sp_admin_secret')` is empty/null.
- Locations use soft-delete (`active = FALSE`) — the delete button calls `DELETE /operators/:id/locations/:locationId` which sets `active = false`, not a hard delete.
- Specials are stored as a JSONB array on `operator_profiles.specials`. Replace the whole array via `POST /specials` or remove one via `DELETE /specials/:specialId`.
- The Queue page filters operators with `tier = 'pending'`. The "Enrich" button navigates to the operator's edit page. "Skip" is a placeholder (no tier change on the backend — needs a `PATCH /operators/:id` route to update tier).
- Strains form supports: name, aliases, type (sativa/indica/hybrid), lineage, THC/CBD ranges, terpenes (name+effect), effects chips, use case chips, flavor chips, about text, cautions, best method, beginner-friendly toggle, AI enrichment placeholder.

---

## Deployment

GitHub Actions workflow (`.github/workflows/deploy.yml`) triggers on push to `main`:
1. `npm ci` + `npm run build` → outputs to `dist/`
2. Uploads `dist/` as Pages artifact
3. Deploys to GitHub Pages

**Vite config:** `base: '/stashpass-admin/'` — all asset paths are prefixed.  
**Router:** `HashRouter` — hash-based routing works without server config.

---

## Running Locally

```bash
npm install
npm run dev    # http://localhost:5173/stashpass-admin/
```

Enter `CIRCLES_API_SECRET` value from Railway env vars at the setup screen.

---

## Session Log

| Date | Work |
|------|------|
| 2026-06-15 | Initial scaffold — Vite + React + TS + Tailwind; all 6 nav sections; full operator CRUD + profile + locations + specials; strain intelligence form; queue page; GitHub Actions deploy; added GET /operators to stashpass-api |
