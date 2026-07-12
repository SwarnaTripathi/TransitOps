# TransitOps — Architecture & Team Execution Plan

Goal: 4 people ship one coherent, secure, deployed app in 8 hours, using Antigravity to code and Stitch to design, without stepping on each other's work.

---

## 0. The One Decision That Matters Most: Contract-First Development

With 4 people and 8 hours, the #1 failure mode is "we all built things that don't fit together at hour 7." The fix: **agree on the API contract and DB schema in the first 20 minutes, before anyone writes app logic.** Everyone codes against that contract. Frontend people can mock the API and swap in the real one later; nobody blocks on anybody else.

That contract is defined once in this doc (Section 3) — copy it into a shared file in the repo (`/docs/API_CONTRACT.md`) and treat changes to it as requiring a 30-second Slack/Discord ping to the team.

---

## 1. Tech Stack (optimized for 8-hour build + free deploy)

| Layer | Choice | Why |
|---|---|---|
| Frontend | React + Vite + TailwindCSS | Fast dev server, Stitch exports React/HTML+Tailwind cleanly |
| Backend | Node.js + Express | Matches your MERN experience, fast to scaffold, huge middleware ecosystem |
| Database | MongoDB Atlas (free M0 tier) | No local DB setup, works from any deploy target, schema flexibility for hackathon speed |
| Auth | JWT (access token) + bcrypt | Simple, stateless, easy RBAC middleware |
| Charts | Recharts | Fast to wire, good with Tailwind |
| Validation | Zod (or Joi) | Shared shape between frontend forms and backend validation |
| Hosting (frontend) | GitHub Pages **or** Vercel | See Section 7 |
| Hosting (backend) | Render (free web service) | GitHub Pages can't run Node — Render can, and deploys straight from your GitHub repo |
| Hosting (DB) | MongoDB Atlas | Free tier, works with Render |

**Important:** GitHub Pages is static-hosting only. You have two real options:
- **Split hosting** — frontend on GitHub Pages, backend on Render, DB on Atlas. All free, all deployable in minutes, all from GitHub.
- **All-on-Vercel** — frontend + backend (as serverless functions) on Vercel, DB on Atlas. Slightly less "GitHub Pages" but arguably faster to set up as one deploy.

Given your time budget, **Option 1 (GitHub Pages + Render + Atlas)** is recommended — it keeps GitHub as the single source of truth your team already understands, and satisfies "deploy on GitHub" literally for the piece that can run there.

---

## 2. Repo Structure (Monorepo)

One repo, clearly split folders, so all 4 people push to the same repo without directory collisions.

```
transitops/
├── frontend/                  # React app
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/          # Member A
│   │   │   ├── dashboard/     # Member A
│   │   │   ├── vehicles/      # Member B
│   │   │   ├── drivers/       # Member B
│   │   │   ├── trips/         # Member C
│   │   │   ├── maintenance/   # Member D
│   │   │   ├── fuel-expense/  # Member D
│   │   │   └── reports/       # Member D
│   │   ├── shared/
│   │   │   ├── api/           # axios instance + endpoint functions (contract lives here)
│   │   │   ├── components/    # shared UI: buttons, tables, modals, layout
│   │   │   ├── hooks/
│   │   │   └── context/       # AuthContext, RoleContext
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── backend/                   # Express app
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/           # Member A: login, RBAC middleware, users, roles
│   │   │   ├── vehicles/       # Member B
│   │   │   ├── drivers/        # Member B
│   │   │   ├── trips/          # Member C: state machine lives here
│   │   │   ├── maintenance/    # Member D
│   │   │   ├── fuelExpense/    # Member D
│   │   │   └── reports/        # Member D
│   │   ├── shared/
│   │   │   ├── middleware/     # authGuard, roleGuard, errorHandler, validate(zodSchema)
│   │   │   ├── models/         # shared model index
│   │   │   └── utils/
│   │   ├── config/db.js
│   │   ├── app.js
│   │   └── server.js
│   └── package.json
├── docs/
│   ├── API_CONTRACT.md
│   └── DB_SCHEMA.md
└── README.md
```

Each `modules/<name>` folder on both frontend and backend has its **own routes/controllers/components** — this is what lets 4 people commit constantly with almost zero merge conflicts, because nobody edits the same file.

---

## 3. Module Split — Who Owns What

| Member | Backend module(s) | Frontend module(s) | Core responsibility |
|---|---|---|---|
| **A** | `auth`, `users` | `auth`, `dashboard` | Login, JWT, RBAC middleware, role-based routing, Dashboard KPIs + filters |
| **B** | `vehicles`, `drivers` | `vehicles`, `drivers` | Vehicle/Driver CRUD, status enums, uniqueness/expiry validation |
| **C** | `trips` | `trips` | Trip lifecycle state machine, dispatch validation rules (cargo weight, availability, license/suspension checks) |
| **D** | `maintenance`, `fuelExpense`, `reports` | `maintenance`, `fuel-expense`, `reports` | Maintenance workflow (auto status flip), fuel/expense logging, cost & ROI calculations, CSV export |

This split matches the PDF's sections 3.3–3.8 almost 1:1, so each person can build straight from the spec independently.

**Cross-cutting rule engine:** Business rules that touch more than one module (e.g., "dispatching a trip flips vehicle AND driver status") belong in a small shared service — `backend/src/shared/services/statusEngine.js` — that Member C calls, but which Member B's models expose an update function for. Agree on this function signature in minute one:

```js
// shared/services/statusEngine.js
async function setVehicleStatus(vehicleId, newStatus) { ... }
async function setDriverStatus(driverId, newStatus) { ... }
```
Trips module calls these; Vehicles/Drivers modules own the implementation. This is the one function signature the whole team should agree on before splitting off.

---

## 4. Database Schema (MongoDB collections)

```js
// User
{ _id, name, email (unique), passwordHash, role: 'fleet_manager'|'driver'|'safety_officer'|'financial_analyst', createdAt }

// Vehicle
{ _id, regNumber (unique, indexed), name, type, maxLoadCapacity, odometer,
  acquisitionCost, status: 'Available'|'On Trip'|'In Shop'|'Retired', region }

// Driver
{ _id, name, licenseNumber, licenseCategory, licenseExpiryDate,
  contactNumber, safetyScore, status: 'Available'|'On Trip'|'Off Duty'|'Suspended' }

// Trip
{ _id, source, destination, vehicleId (ref), driverId (ref), cargoWeight,
  plannedDistance, actualDistance, fuelConsumed,
  status: 'Draft'|'Dispatched'|'Completed'|'Cancelled',
  createdAt, dispatchedAt, completedAt }

// MaintenanceLog
{ _id, vehicleId (ref), type, description, cost, status: 'Active'|'Closed',
  openedAt, closedAt }

// FuelLog
{ _id, vehicleId (ref), liters, cost, date }

// Expense
{ _id, vehicleId (ref), type: 'toll'|'other', amount, date, note }
```

Indexes to add day-1: `Vehicle.regNumber` (unique), `Driver.licenseNumber` (unique), `Trip.vehicleId`, `Trip.driverId` — needed for the availability-check queries every dispatch does.

---

## 5. API Contract (high-level — flesh out per module in `docs/API_CONTRACT.md`)

```
POST   /api/auth/login
GET    /api/auth/me

GET    /api/dashboard/kpis?type=&status=&region=

GET    /api/vehicles
POST   /api/vehicles
PATCH  /api/vehicles/:id
GET    /api/vehicles/available        # excludes Retired/In Shop — used by trip creation

GET    /api/drivers
POST   /api/drivers
PATCH  /api/drivers/:id
GET    /api/drivers/available         # excludes expired license/Suspended/On Trip

POST   /api/trips                     # validates cargo ≤ capacity, availability
PATCH  /api/trips/:id/dispatch
PATCH  /api/trips/:id/complete
PATCH  /api/trips/:id/cancel

POST   /api/maintenance               # auto-sets vehicle → In Shop
PATCH  /api/maintenance/:id/close     # restores vehicle → Available unless Retired

POST   /api/fuel-logs
POST   /api/expenses

GET    /api/reports/fuel-efficiency
GET    /api/reports/utilization
GET    /api/reports/cost
GET    /api/reports/roi
GET    /api/reports/export.csv
```

Every response follows one envelope so frontend error-handling is written once:
```json
{ "success": true, "data": {...} }
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "Cargo exceeds capacity" } }
```

---

## 6. Security Checklist (don't skip these — they're graded/expected and cheap to add)

- **Passwords:** bcrypt hash, never store plaintext. Never log passwords.
- **JWT:** short-lived access token (e.g. 2h), signed with a secret from `.env`, never committed. Add `.env` to `.gitignore` on commit #1.
- **RBAC middleware:** one `requireRole(['fleet_manager'])` middleware reused across routes — don't duplicate role checks in each controller.
- **Input validation:** Zod/Joi schema per route, reject before touching the DB (prevents bad cargo weights, malformed dates, etc. from ever reaching business logic).
- **CORS:** lock to your deployed frontend origin, not `*`, once you have the real URL.
- **Helmet.js:** one line, sets sane security headers.
- **Rate limiting:** `express-rate-limit` on `/api/auth/login` specifically — cheap brute-force protection.
- **Never trust the frontend for status transitions** — always re-check vehicle/driver availability server-side even if the UI already filtered the dropdown (this is literally rule 4.3/4.4 in your spec, and it's a server-side rule, not a UI rule).
- **Secrets:** all API keys/DB URIs in `.env` locally and in Render's/Vercel's environment variable dashboard — never in code.

---

## 7. Git Workflow for 4 People, 8 Hours

- `main` branch stays deployable at all times.
- Each person branches per module: `feat/auth`, `feat/vehicles-drivers`, `feat/trips`, `feat/maintenance-reports`.
- Commit small, commit often (every 20–30 min) — reduces conflict size and gives you a rollback point.
- Merge order matters less than you'd think because of the folder split, but do merge **Member B's models before Member C's trips** (trips reference vehicle/driver schemas) — a 5-minute early sync avoids a scramble later.
- Use PRs even solo — habit of review catches the "oops I hardcoded my test JWT" mistakes before deploy.

---

## 8. Deployment Plan (do this at hour ~1 with a placeholder app, not at hour 8)

Deploying early with a "hello world" on each layer means your *final* deploy at hour 7 is just a `git push` — not a scramble.

1. **Atlas:** create free M0 cluster, get connection string, add to Render env vars.
2. **Render:** connect GitHub repo → deploy `backend/` as a Web Service → set `MONGO_URI`, `JWT_SECRET` env vars → note the live backend URL.
3. **Frontend:** set `VITE_API_URL=<render-url>` in `frontend/.env`.
4. **GitHub Pages:** in `frontend/vite.config.js` set `base: '/transitops/'` (repo name), build with `npm run build`, deploy `dist/` via `gh-pages` npm package or GitHub Actions (`peaceiris/actions-gh-pages`).
5. **CORS:** update backend's allowed origin to the GitHub Pages URL once you have it.

Do steps 1–4 as skeleton apps in the first hour so every later push auto-deploys and you can demo *something* at any checkpoint.

---

## 9. UI/UX Plan (using Stitch)

Feed Stitch the page list below (matches spec sections 3.2–3.8) plus the provided Excalidraw mockup link for visual direction. Ask Stitch for a consistent design system first (color palette, spacing scale, component set) so all 4 people's screens look like one app, not four:

- Login
- Dashboard (KPI cards + filters + charts)
- Vehicle Registry (table + add/edit modal, status badges)
- Driver Management (table + add/edit modal, license-expiry warning badge)
- Trip Management (create form with live availability filtering, kanban-style status view: Draft/Dispatched/Completed/Cancelled)
- Maintenance Log (table, "Close maintenance" action)
- Fuel & Expense entry forms
- Reports (charts + CSV export button)

Shared components to build once, reuse everywhere (put these in `frontend/src/shared/components/`): `<StatusBadge>`, `<DataTable>`, `<Modal>`, `<KpiCard>`, `<AppLayout>` (sidebar + role-aware nav).

---

## 10. Suggested 8-Hour Timeline

| Hour | Everyone |
|---|---|
| 0–1 | Agree contract/schema (this doc), scaffold repo + skeleton deploy (Section 8) |
| 1–4 | Build own module: backend routes + frontend screens against contract |
| 4–5 | First integration pass — wire real API calls, kill mocks |
| 5–6 | Cross-module testing: run the Section 5 example workflow end-to-end |
| 6–7 | Bug fixes, RBAC/security pass, polish UI |
| 7–8 | Final deploy, README, demo run-through |

---

## Quick Reference: The Example Workflow as a Test Script

Use the spec's own example (Van-05, 500kg, Alex) as your integration test at hour 5 — if it passes end-to-end across all 4 modules, your core system works.

---

## 11. Novelty Features (what makes this look like more than CRUD)

Keep these scoped — each is a few hours max, owned by one person, and layered on top of modules that already exist. Don't add all of them if time is tight; do Feature 1 and the Activity Feed first, they're the highest payoff for the least effort.

### Feature 1 — Fuel Anomaly Detection (owner: Member D, extends Reports/Fuel module)

**The idea:** instead of just charting fuel efficiency, the system flags fuel logs that look statistically off — a classic real-world fleet-fraud/leak detector, and something no other team building this spec will have.

**Schema addition (FuelLog):**
```js
{ ..., expectedEfficiency: Number, actualEfficiency: Number, deviationPct: Number, flagged: Boolean }
```

**Logic (runs on fuel log creation):**
1. Compute `actualEfficiency = distance / liters` for the log.
2. Compute `expectedEfficiency` as the rolling average of that vehicle's last N logs (or a static per-`vehicleType` baseline if it's the vehicle's first log — e.g., van: 12 km/l, truck: 6 km/l — hardcode a small lookup table).
3. `deviationPct = (expectedEfficiency - actualEfficiency) / expectedEfficiency`
4. If `deviationPct > 0.25` (25% worse than expected), set `flagged: true`.

```js
function evaluateFuelLog(log, vehicleHistory, vehicleType) {
  const actual = log.distance / log.liters;
  const expected = vehicleHistory.length
    ? average(vehicleHistory.map(l => l.actualEfficiency))
    : BASELINE_EFFICIENCY[vehicleType];
  const deviationPct = (expected - actual) / expected;
  return { actualEfficiency: actual, expectedEfficiency: expected, deviationPct, flagged: deviationPct > 0.25 };
}
```

**UI:** a red "⚠ Review" badge on flagged rows in the Fuel Log table, plus a "Fuel Anomalies" count card on the Dashboard KPI row. This is the single most "wow, that's smart" moment you can add for about 2 hours of work.

### Feature 2 — Compliance Risk Watchlist (owner: Member A or D, extends Safety/Dashboard)

**The idea:** instead of a static "license expired" badge, compute a **Risk Score** per driver combining two spec fields that already exist — license expiry proximity and safety score — into one prioritized list for the Safety Officer.

```js
function riskScore(driver) {
  const daysToExpiry = daysBetween(today, driver.licenseExpiryDate);
  const expiryRisk = daysToExpiry < 0 ? 100 : Math.max(0, 100 - daysToExpiry * 2); // ramps up inside 50 days
  const safetyRisk = 100 - driver.safetyScore; // assuming safetyScore is 0-100
  return Math.round(0.6 * expiryRisk + 0.4 * safetyRisk);
}
```
Sort drivers by this descending → render as a "Compliance Watchlist" panel: top 5 highest-risk drivers, color-coded (red >70, amber 40-70, green <40). This turns two boring fields into one feature that looks like real fleet-safety software.

### Feature 3 — Unified Activity Feed (owner: whoever finishes their module first — cheap, high visual payoff)

**The idea:** one small collection that every module writes one line to whenever a status changes. Rendered as a live feed on the Dashboard, it makes the whole app feel like a cohesive operations platform rather than 4 separate CRUD screens stitched together — which is exactly the "digitizes operations" pitch in the spec's own Business Context.

```js
// ActivityLog
{ _id, actorId, actorName, action: string, entityType: 'Vehicle'|'Driver'|'Trip'|'Maintenance', entityId, timestamp }
```
Any controller that changes a status (`dispatch`, `complete`, `cancel`, `close maintenance`) writes one line, e.g. `"Alex dispatched Trip #4821 (Van-05)"`. Dashboard shows the last 10, newest first. ~1 hour of work, touches every module lightly, and is the thing that makes your demo narrate itself.

### Optional stretch (only if hours 6-7 have slack) — Live Fleet Map
`react-leaflet` + mock lat/lng fields on Vehicle, colored pins by status (green=Available, blue=On Trip, orange=In Shop). Visually the biggest "wow" of all of these, but the highest risk to your timeline — only attempt this if the core spec is fully working and demoed already.

---

## 12. Professional-Polish Checklist

These are what separate "we finished the spec" from "this looks shippable" — most cost minutes, not hours.

**Frontend polish**
- Every list/table has a **loading skeleton**, an **empty state** ("No vehicles yet — add your first one"), and an **error state** — not just a blank screen while judges wait.
- Toast notifications for every mutation (create/dispatch/complete/cancel) — confirms the action worked without a page reload.
- One consistent design system pulled from Stitch (same button styles, spacing, color tokens) across all 4 people's screens — assign one person (or 15 minutes at hour 4) to a visual consistency pass across all modules.
- A real login/branding screen, not a bare form — first impression for judges.
- 404 page and a basic error boundary so a crash doesn't white-screen the whole demo.

**Repo/engineering polish**
- `README.md` with: one-paragraph pitch, architecture diagram (can be a simple draw.io/excalidraw export), setup instructions, and a **demo GIF or 3 screenshots** — judges often skim the README before anything else.
- `.env.example` committed (never the real `.env`) — signals you understand config hygiene.
- A **seed script** (`npm run seed`) that populates realistic demo data (10 vehicles, 8 drivers, some already On Trip, a couple flagged fuel logs, a couple near-expiry licenses) — so the demo doesn't start from an empty database and you can show the novelty features immediately without live-typing 20 records.
- One GitHub Actions workflow that runs lint/build on push (`.github/workflows/ci.yml`) — a green checkmark badge on the README is a small, cheap signal of engineering maturity.
- Basic input labels/contrast (accessibility) — low effort, and judges do notice a form with no labels.

**Demo-day polish**
- Rehearse the Section 5 example workflow (Van-05/Alex) as your live demo script — it's already in the spec, so it maps 1:1 to "look, it does exactly what was asked," then layer the novelty features on top as the "and here's what we added" moment.
- Lead the demo with the Activity Feed and Compliance Watchlist/Fuel Anomaly panel on the Dashboard — that's the 10 seconds that makes your project distinct from every other team's before you even walk through CRUD.

---

## Novelty Summary (one-line version for your pitch)

> "TransitOps doesn't just digitize fleet records — it flags fuel-cost anomalies automatically, prioritizes safety-compliance risk instead of just listing expiry dates, and gives every operator a live audit trail of what's happening across the fleet in real time."

---

## 13. Final Task Assignment Sheet

Copy each person's block into a shared doc/issue tracker as their personal checklist. Order matters within each block — top items unblock the ones below.

### Member A — Auth, RBAC, Dashboard
**Backend (`modules/auth`, `modules/users`)**
- [ ] User + Role schema, bcrypt password hashing
- [ ] `POST /api/auth/login` → JWT issuance
- [ ] `GET /api/auth/me`
- [ ] `authGuard` middleware (verifies JWT)
- [ ] `requireRole([...])` middleware (used by everyone — ship this early, hour 1)
- [ ] Seed script: create 4 demo users, one per role (do this early so others can log in and test)

**Frontend (`modules/auth`, `modules/dashboard`)**
- [ ] Login page (Stitch-designed)
- [ ] AuthContext + protected route wrapper
- [ ] Role-aware sidebar nav (hide modules the role can't access)
- [ ] Dashboard KPI cards (Active/Available Vehicles, Active/Pending Trips, Drivers On Duty, Fleet Utilization %)
- [ ] Dashboard filters (vehicle type / status / region)
- [ ] **Activity Feed panel** (Feature 3 — reads `ActivityLog`, others just write to it)

**Depends on:** nothing — this is the module everyone else needs first (login + `requireRole`), so Member A should ship the skeleton of these by end of hour 1.

---

### Member B — Vehicles & Drivers
**Backend (`modules/vehicles`, `modules/drivers`)**
- [ ] Vehicle schema + CRUD (`regNumber` unique constraint)
- [ ] `GET /api/vehicles/available` (excludes Retired/In Shop)
- [ ] Driver schema + CRUD (`licenseNumber` unique constraint)
- [ ] `GET /api/drivers/available` (excludes expired license/Suspended/On Trip)
- [ ] `statusEngine.js` — `setVehicleStatus()`, `setDriverStatus()` (shared service — Member C depends on this, ship by hour 2)
- [ ] Wire `ActivityLog` write on every status change

**Frontend (`modules/vehicles`, `modules/drivers`)**
- [ ] Vehicle Registry table + add/edit modal + status badges
- [ ] Driver Management table + add/edit modal + license-expiry warning badge
- [ ] **Compliance Risk Watchlist panel** (Feature 2 — risk score using licenseExpiryDate + safetyScore)

**Depends on:** Member A's `requireRole` middleware for route protection. **Blocks:** Member C needs the Vehicle/Driver schema and `statusEngine` functions to build Trips — sync with C by end of hour 2.

---

### Member C — Trip Management
**Backend (`modules/trips`)**
- [ ] Trip schema (Draft → Dispatched → Completed → Cancelled)
- [ ] `POST /api/trips` — validate cargo weight ≤ capacity, vehicle/driver availability, license validity/suspension
- [ ] `PATCH /api/trips/:id/dispatch` — calls `setVehicleStatus`/`setDriverStatus` → On Trip
- [ ] `PATCH /api/trips/:id/complete` — restores both to Available, records odometer + fuel consumed
- [ ] `PATCH /api/trips/:id/cancel` — restores both to Available
- [ ] Wire `ActivityLog` write on dispatch/complete/cancel

**Frontend (`modules/trips`)**
- [ ] Trip creation form (source/destination/vehicle/driver dropdowns fed by `available` endpoints — dropdowns auto-filter)
- [ ] Kanban-style or tabbed trip status view (Draft/Dispatched/Completed/Cancelled)
- [ ] Dispatch/Complete/Cancel action buttons with confirmation + toast

**Depends on:** Member B's Vehicle/Driver schema and `statusEngine` — this is the tightest dependency in the whole project, so treat the hour-2 sync with B as non-negotiable. Can build UI against mocked availability data in the meantime.

---

### Member D — Maintenance, Fuel/Expense, Reports
**Backend (`modules/maintenance`, `modules/fuelExpense`, `modules/reports`)**
- [ ] MaintenanceLog schema — creating an Active record calls `setVehicleStatus(vehicleId, 'In Shop')`
- [ ] `PATCH /api/maintenance/:id/close` — restores vehicle to Available *unless Retired*
- [ ] FuelLog + Expense schemas, `POST` endpoints
- [ ] Total operational cost calc (Fuel + Maintenance) per vehicle
- [ ] Reports: fuel efficiency, fleet utilization, cost, ROI formula
- [ ] `GET /api/reports/export.csv`
- [ ] **Fuel Anomaly Detection** (Feature 1 — `evaluateFuelLog()` on log creation)
- [ ] Wire `ActivityLog` write on maintenance open/close

**Frontend (`modules/maintenance`, `modules/fuel-expense`, `modules/reports`)**
- [ ] Maintenance table + "Close maintenance" action
- [ ] Fuel/Expense entry forms — flagged rows shown with "⚠ Review" badge
- [ ] Reports page: charts (Recharts) for efficiency/utilization/cost/ROI + CSV export button

**Depends on:** Member B's `statusEngine` (for the In Shop / Available transition, same function C uses for trips).

---

### Shared, Cross-Cutting (rotate or assign to whoever's ahead by hour 5-6)
- [ ] Visual consistency pass — one design-token sweep across all 4 modules' screens
- [ ] `README.md` (pitch, setup, screenshots/GIF, architecture diagram)
- [ ] `.env.example`, CI workflow (lint/build on push)
- [ ] Deploy: Atlas → Render (backend) → GitHub Pages (frontend), CORS updated to real URLs
- [ ] Run the Section 5 example workflow (Van-05/Alex) as an end-to-end smoke test
