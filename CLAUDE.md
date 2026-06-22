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

### Strains (live)
| Action | Endpoint |
|---|---|
| List / search | `GET /strains[?q=&type=]` |
| Get one | `GET /strains/:id` |
| Create | `POST /strains` |
| Update | `PUT /strains/:id` |
| Delete (soft) | `DELETE /strains/:id` |

---

## Invariants

- The `GET /operators` route was added in the admin dashboard session (with `?tier` / `?category` filters). It joins `operator_locations` to include `location_count`.
- `x-api-secret` is the only auth mechanism. The setup screen shows when `localStorage.getItem('sp_admin_secret')` is empty/null.
- Locations use soft-delete (`active = FALSE`) — the delete button calls `DELETE /operators/:id/locations/:locationId` which sets `active = false`, not a hard delete.
- Specials are stored as a JSONB array on `operator_profiles.specials`. Replace the whole array via `POST /specials` or remove one via `DELETE /specials/:specialId`.
- The Queue page filters operators with `tier = 'pending'`. The "Enrich" button navigates to the operator's edit page. "Skip" is a placeholder (no tier change on the backend — needs a `PATCH /operators/:id` route to update tier).
- Strains form: name, aliases (comma-separated or add one-by-one), type chips, lineage, THC/CBD min/max, terpenes (name+effect rows), effects chips (7), use-case chips (6), flavor chips (8), about textarea, cautions textarea, best method (Flower/Vape/Edible/Concentrate/Pre-Roll), beginner-friendly toggle, AI enrichment placeholder.
- Strains list: debounced server-side search (`?q=`) hits name + JSONB alias array; columns are name/aliases, type badge, session count, date added.
- Strains uses soft-delete (`active = FALSE`); deleted records remain in the DB.

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
| 2026-06-16 | Strains section live — 006_strains.sql migration, strain.service.ts, /strains routes in API; admin wired to real endpoints; debounced search, session count column, pre-roll method, cautions textarea, comma-separated aliases |
| 2026-06-18 | Operator name inline edit — `OperatorEdit.tsx` now has an editable name field using the same inline form pattern as category/subcategory. Calls `PATCH /operators/:id { name }`. |
| 2026-06-22 | Strain name inline edit — `StrainEdit.tsx` H1 now renders as an inline-edit field (same pattern as operator name). Clicking "edit name" reveals an inline input+Save+Cancel form. Save calls `PUT /strains/:id { name }`, updates local form state on success. |
