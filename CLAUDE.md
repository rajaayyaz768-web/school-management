# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Layout

```
college-system/
  college-backend/   # Node.js + Express + Prisma 6 API
  college-web/       # Next.js 16 / React 19 frontend
scripts/             # VPS backup shell scripts (daily/weekly/monthly/restore)
DEPLOY.md            # VPS deployment runbook
```

---

## Backend (`college-system/college-backend/`)

### Commands

```bash
# Development (hot reload via ts-node-dev)
npm run dev

# Build TypeScript
npm run build

# Start compiled output
npm run start

# Database
npm run prisma:migrate      # apply migrations
npm run prisma:generate     # regenerate Prisma client after schema changes
npm run prisma:seed         # seed database (creates all test users — see credentials below)
npm run prisma:studio       # open Prisma Studio GUI

# Type-check without emitting (run before committing)
npx tsc --noEmit
```

### Seed credentials (password: `Test@1234`)

| Role | Email | Scope |
|------|-------|-------|
| SUPER_ADMIN | principal@college.edu.pk | All campuses |
| ADMIN | admin@college.edu.pk | Boys Campus only |
| ADMIN | admin.girls@college.edu.pk | Girls Campus only |
| TEACHER | teacher@college.edu.pk | — |
| PARENT | parent@college.edu.pk | — |
| STUDENT | student@college.edu.pk / student2 / student3 | — |

### Required Environment Variables

```
DATABASE_URL      PostgreSQL connection string
JWT_SECRET        access token secret
JWT_REFRESH_SECRET
JWT_ACCESS_EXPIRES   e.g. 15m
JWT_REFRESH_EXPIRES  e.g. 7d
PORT              defaults to 5000
ALLOWED_ORIGINS   comma-separated allowed frontend origins
BACKUP_DIR        /var/backups/college  (VPS only — enables the backups dashboard)
BACKUP_SCRIPT     /opt/college/scripts/backup-now.sh  (VPS only)
```

See `.env.example` for the full production set.

### Architecture

**Entry**: `src/server.ts` → creates HTTP server, attaches Socket.io, verifies DB connection, then listens.

**App setup**: `src/app.ts` → `trust proxy` → Helmet → CORS → body-parser → cookie-parser → rate-limiter → request-logger → routes → 404 → global error handler.

**API base path**: `http://localhost:5000/api/v1`

**Module structure** — each feature under `src/modules/<name>/` follows this pattern:
```
<name>.routes.ts       # Express Router, applies middleware chains
<name>.controller.ts   # req/res handling, calls service
<name>.service.ts      # business logic, Prisma queries
<name>.validation.ts   # Zod schemas for request validation
<name>.types.ts        # TypeScript types for the module
```

**Middleware pipeline for protected routes**:
1. `authenticate` — verifies Bearer JWT, attaches `req.user` (`{ id, email, role, campusId }`), **and sanitizes `req.query.campusId` by role** (see Campus Scoping below)
2. `authorize(...roles)` — checks `req.user.role` against allowed roles
3. `campusMiddleware` / `requireCampus` — sets `req.campusId`; `requireCampus` returns 403 if user has no campus
4. `validate(schema)` — runs Zod validation on `req.body` / `req.params`

**Role constants** (in `src/middlewares/role.middleware.ts`):
```ts
Roles.PRINCIPAL_ONLY      // [SUPER_ADMIN]
Roles.ADMIN_AND_ABOVE     // [SUPER_ADMIN, ADMIN]
Roles.STAFF               // [SUPER_ADMIN, ADMIN, TEACHER]
Roles.ALL                 // all five roles
```

**Response helpers** (`src/utils/response.ts`): always use `sendSuccess`, `sendCreated`, `sendError`, `sendNotFound`, etc. — never call `res.json()` directly.

**Database**: PostgreSQL via Prisma 6. Schema at `prisma/schema.prisma`. Key models: `User`, `Campus`, `Program`, `Grade`, `Section`, `StaffProfile`, `StudentProfile`, `ParentProfile`, `StaffCampusAssignment`. Auth uses httpOnly cookies for refresh tokens; access tokens sent as `Authorization: Bearer`.

**Prisma singleton**: always import from `src/config/database.ts` (exports the shared `prisma` instance) — never `new PrismaClient()` in service files.

**Real-time**: Socket.io server initialised via `src/config/socket.ts`. Users join a room keyed by `userId` on login.

### Campus Scoping (security-critical)

The system has three active campuses: Boys Campus, Girls Campus, Primary School. Campus isolation is enforced **server-side in `auth.middleware.ts`**, not by the frontend:

- **ADMIN**: `req.query.campusId` is **forcibly overwritten** to their assigned campus regardless of what the client sends. No `StaffCampusAssignment` → 403.
- **SUPER_ADMIN**: `req.query.campusId` is left as-is (null = all campuses, or a specific ID from the global picker).
- **TEACHER / STUDENT / PARENT**: `req.query.campusId` is locked to their resolved campus if one exists.

All campus-aware services read `campusId` from `req.query.campusId` (via controller). No service-level changes are needed when adding new campus-filtered endpoints — the middleware boundary handles it.

### Backup System (`src/modules/system/`)

Principal-only endpoints at `/api/v1/system/`:
- `GET /backups` — lists `.sql.gz` files from `BACKUP_DIR`
- `GET /backups/status` — reads `last-status.json` from `BACKUP_DIR` + disk usage
- `POST /backups/trigger` — executes `BACKUP_SCRIPT` (120s timeout)
- `GET /backups/:filename/download` — streams file; path-traversal guarded by `path.resolve()` + filename regex

Returns `configured: false` when `BACKUP_DIR` is not set — the frontend shows a "not configured" state gracefully.

---

## Frontend (`college-system/college-web/`)

### Commands

```bash
# Development
npm run dev

# Build
npm run build

# Lint
npm run lint
```

### Required Environment Variables

- `NEXT_PUBLIC_API_URL` — backend base URL, e.g., `http://localhost:5000/api/v1`

### Architecture

**Routing**: Next.js 16 App Router with route groups for role isolation:
- `(auth)/login` — unauthenticated entry point
- `(principal)/principal/` — SUPER_ADMIN routes (dashboard, students, staff, settings/backups, …)
- `(admin)/admin/` — ADMIN routes
- `(teacher)/`, `(parent)/`, `(student)/` — respective role routes

**Middleware** (`src/middleware.ts`) — reads `access-token` and `user-role` cookies; redirects unauthenticated users to `/login` and enforces role-based route access before the page renders.

**Auth state**: Zustand store (`src/store/authStore.ts`) persisted to `localStorage` as `college-auth`. On `setAuth`, sets `access-token` and `user-role` cookies (1-day expiry) and connects Socket.io. On `logout`, removes cookies and disconnects socket.

**API client** (`src/lib/axios.ts`): Axios instance with `baseURL = NEXT_PUBLIC_API_URL`. Attaches `Authorization: Bearer <token>` from auth store. For `SUPER_ADMIN`, also injects `?campusId` from `campusStore` when not already present (lets the backend filter to the selected campus). On 401, silently refreshes via `POST /auth/refresh-token`; queues concurrent failed requests; redirects to `/login` if refresh fails.

**Feature structure** — each feature under `src/features/<name>/` follows:
```
api/         # axios calls wrapped in React Query useQuery / useMutation
components/  # feature-specific UI components
hooks/       # feature-specific hooks
types/       # TypeScript types
```

**Shared UI components** live in `src/components/ui/` — use these rather than creating new primitives. Layout shell (`MainLayout`, `Sidebar`, `TopBar`) is in `src/components/layout/`.

**Global state**:
- `authStore` — user identity, tokens, socket connection
- `campusStore` — active campus for SUPER_ADMIN multi-campus picker (wired in `TopBar.tsx` + `axios.ts`)
- `notificationStore` — in-app notifications
- `themeStore` — light/dark theme

**Data fetching**: React Query via `src/lib/queryClient.ts`. All API calls go through React Query hooks in `features/<name>/api/` or `features/<name>/hooks/`.

**Styling**: Tailwind CSS v4 + `tailwind-merge` (`cn()` in `src/lib/utils.ts`). Design tokens are CSS variables (`--gold`, `--primary`, `--text`, `--border`, `--surface`, `--radius-lg`, etc.) defined in the global stylesheet — use these rather than hardcoded colors.

**Forms**: `react-hook-form` + `@hookform/resolvers` with Zod schemas.

**Socket.io client** (`src/lib/socket.ts`): singleton connecting to `NEXT_PUBLIC_API_URL`. User joins their personal room (`join_room` event) on login.
