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

No test framework is configured — the project relies on TypeScript strict-mode compilation and manual QA.

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

Additional vars required for optional integrations:
```
# File uploads
UPLOAD_DIR           path for multer disk storage
MAX_FILE_SIZE_MB     defaults to 5

# Email (Nodemailer / Gmail SMTP)
SMTP_HOST  SMTP_PORT  SMTP_USER  SMTP_PASS  SMTP_FROM

# WhatsApp Meta Business API
META_WHATSAPP_ENABLED              true/false
META_WHATSAPP_TOKEN
META_WHATSAPP_PHONE_NUMBER_ID
META_WHATSAPP_TEMPLATE_NAME        fee payment template name
META_WHATSAPP_CREDENTIALS_TEMPLATE student/staff credential template name
META_WHATSAPP_LANGUAGE_CODE        e.g. en_US

# Google Drive backup (OAuth2)
GOOGLE_CLIENT_ID  GOOGLE_CLIENT_SECRET  GOOGLE_REDIRECT_URI
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

**Error handling**: throw `new AppError(message, statusCode)` from services; the global error middleware (`src/middlewares/error.middleware.ts`) catches it, maps known Prisma error codes (P2002 duplicate, P2003 foreign key, P2025 not found), and logs via Winston. Never let Prisma errors bubble unhandled to the client.

**Logger** (`src/utils/logger.ts`): Winston with color-coded namespaces — `logger.auth`, `logger.db`, `logger.validation`, `logger.socket`, etc. Use the relevant namespace rather than `console.log`.

**Pagination** (`src/utils/pagination.ts`): use `parsePagination(query)` to read `page`/`limit` from query params, `getPrismaSkipTake()` for Prisma `skip`/`take`, and `buildPaginationMeta()` to attach metadata to the response. All list endpoints should go through this utility.

**Campus ownership guard** (`src/utils/campusGuard.ts`): use these when a service needs to verify ownership beyond what the auth middleware already scopes — all throw `CampusScopeError(403)` on mismatch:
- `assertSectionCampus(sectionId, user)` — section belongs to user's campus
- `assertStudentCampus(studentId, user)` — student belongs to user's campus
- `assertStaffCampus(staffId, user)` — staff belongs to user's campus
- `requireOwnCampus(user, targetCampusId)` — campusId on a payload matches user's campus
- `assertTeacherSubjectAccess(sectionId, subjectId, user)` — **TEACHER only**: verifies a `SectionSubjectTeacher` record exists for this teacher+section+subject. SUPER_ADMIN/ADMIN always pass. Apply this to any endpoint where a teacher writes data (mark attendance, enter results). For read endpoints, filter the query by the teacher's assignments instead (see Teacher Subject Scoping below).

**Database**: PostgreSQL via Prisma 6. Schema at `prisma/schema.prisma`. Key model groups:
- Auth/profiles: `User` (5 roles), `StaffProfile`, `StudentProfile`, `ParentProfile`
- Hierarchy: `Campus` (`campusType`: COLLEGE | PRIMARY_SCHOOL) → `Program` → `Grade` (`teachingMode`: MORNING | AFTERNOON | optional) → `Section`
- Assignments: `StaffCampusAssignment`, `SectionSubjectTeacher`, `TimetableSlot`
- Attendance: `StudentAttendance`, `StaffAttendance`, `MonthlyAttendanceSummary`
- Academics: `ExamSchedule` (admin bulk-schedules one event across sections/subjects) → `Exam` (1 section + 1 subject + marks; `isClassTest: bool`, `examScheduleId?`, `createdByStaffId?`), `ExamResult`, `BoardExamRecord`
- Finance: `FeeStructure`, `FeeRecord`
- Messaging: `ChatConversation`, `ChatMessage`, `Announcement`, `Notification`, `OutgoingMessage`
- Ops: `AuditLog`, `AppVersion`, `GoogleDriveToken`
- Promotion: `PromotionCycle` (`promotionType`: ANNUAL | TRANSITIONAL), `PromotionRecord`

**Import module** (`src/modules/import/`): uses `multer` for file uploads and `exceljs` for parsing Excel. Validates rows against Zod schemas before bulk-inserting via Prisma. Critical invariants:
- Roll numbers are stored **UPPERCASE** (`${campusCode}-${programCode}-${gradeOrder}-${secName}-${seq}`.toUpperCase()). Auth login uses case-insensitive `findFirst` for roll number lookup.
- Fee record generation has a **30-day duplicate check** using `createdAt >= now - 30 days` — re-running within 30 days skips students who already have a record for that fee structure.
- New students in a section get roll numbers continuing from the highest existing sequence (`maxSeq + 1`). Existing roll numbers are never reset.

**Caching** (`src/utils/cache.ts`): wrapper around `node-cache` — do not introduce a second caching layer. Use `cacheGet()`, `cacheSet()`, `cacheDel()`, `cacheDelPattern()`. TTL constants: `MASTER_DATA` 30 min (campuses/programs/subjects), `SECTIONS` 10 min, `DASHBOARD` 5 min, `FEES` 3 min, `ANNOUNCEMENTS` 2 min, `RESULTS` 60 s.

**Rate limiting** (`src/middlewares/rateLimit.middleware.ts`): two limiters — `generalLimiter` (100 req/min) and `authLimiter` (10 req/15 min), both using express-rate-limit with `standardHeaders: true`.

**File uploads** (`src/middlewares/upload.middleware.ts`): multer with disk storage to `UPLOAD_DIR`. Use `uploadSingle(field)` or `uploadMultiple(field, max=5)`. Allowed types: jpeg/jpg/png/pdf/doc/docx/xlsx/xls; max size from `MAX_FILE_SIZE_MB`.

**Email service** (`src/services/email.service.ts`): Nodemailer over SMTP (Gmail app passwords). Sends password-reset OTPs, recovery verification, backup OTPs, and staff welcome emails via HTML templates.

**WhatsApp service** (`src/services/whatsapp/metaClient.ts`): Meta Business API. Normalises Pakistani phone numbers (03001234567 → 923001234567). Used to send student/parent credentials and fee payment confirmations via pre-approved template messages. Returns `MetaSendResult { messageId? | error }`. Disabled when `META_WHATSAPP_ENABLED` is not `"true"`.

**Google Drive backup** (in `src/modules/system/`): OAuth2 flow; OTP-verified before connecting. Endpoints under `/api/v1/system/google/` (`auth-url`, `callback`, `send-otp`, `verify-otp`, `status`, `disconnect`) plus backup CRUD. Requires `GOOGLE_*` env vars.

**Active backend modules**: admin-management, announcements, app-version, attendance, auth, campus, chat, dashboard, exams, fees, grades, import, leave, notifications, parents, programs, promotion, reports, results, section-assignment, sections, staff, staff-attendance, student-attendance, students, subjects, system, timetable.

**Prisma singleton**: always import from `src/config/database.ts` (exports the shared `prisma` instance) — never `new PrismaClient()` in service files.

**Real-time**: Socket.io server initialised via `src/config/socket.ts`. Users join a room keyed by `userId` on login.

**Docker**: a multi-stage `Dockerfile` (Node 20 Alpine) builds TypeScript, regenerates Prisma client, then serves from `dist/` with production-only dependencies. No `docker-compose` is provided.

### Teacher Subject Scoping (security-critical)

Teachers are scoped to the subjects they are assigned to in each section, via `SectionSubjectTeacher`. Two layers must both be present:

1. **Backend data filter** — for list endpoints (GET exams, GET section assignments), filter the query to only return rows matching the teacher's `SectionSubjectTeacher` records. See `subjects.service.ts` `getAssignmentsBySection` and `exams.service.ts` `getAllExams` for the pattern.
2. **Backend write guard** — for mutation endpoints (mark attendance, enter results), call `assertTeacherSubjectAccess(sectionId, subjectId, user)` before writing. Returns 403 if the teacher has no assignment for that pair.

The frontend does **not** need separate filtering logic — once the backend returns only the teacher's subjects, the existing UI components automatically show the right data. Do not skip either layer (filter prevents info leak; guard prevents unauthorized writes).

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

# Lint (ESLint 9 with Next.js preset — only frontend has a linter)
npm run lint
```

### Required Environment Variables (`.env.local`)

- `NEXT_PUBLIC_API_URL` — backend base URL, e.g., `http://localhost:5000/api/v1`
- `NEXT_PUBLIC_SOCKET_URL` — Socket.io server URL (usually same host without `/api/v1`)

### Architecture

**Routing**: Next.js 16 App Router with route groups for role isolation:
- `(auth)/login` — unauthenticated entry point
- `(principal)/principal/` — SUPER_ADMIN routes (dashboard, students, staff, settings/backups, …)
- `(admin)/admin/` — ADMIN routes
- `(teacher)/`, `(parent)/`, `(student)/` — respective role routes
- Shared admin routes (`/exams`, `/results`, `/fees`, `/attendance`, `/announcements`, `/reports`) are accessible by both SUPER_ADMIN and ADMIN; the middleware enforces this before the page renders.

**Middleware** (`src/middleware.ts`) — reads `access-token` and `user-role` cookies; redirects unauthenticated users to `/login` and enforces role-based route access before the page renders.

**Auth state**: Zustand store (`src/store/authStore.ts`) persisted to `localStorage` as `college-auth`. On `setAuth`, sets `access-token` and `user-role` cookies (1-day expiry) and connects Socket.io. On `logout`, calls `queryClient.clear()` (purges all React Query cache so a new user never sees stale data from the previous session), removes cookies, and disconnects socket.

**API client** (`src/lib/axios.ts`): Axios instance with `baseURL = NEXT_PUBLIC_API_URL`. Attaches `Authorization: Bearer <token>` from auth store. For `SUPER_ADMIN`, also injects `?campusId` from `campusStore` when not already present (lets the backend filter to the selected campus). On 401, silently refreshes via `POST /auth/refresh-token`; queues concurrent failed requests; redirects to `/login` if refresh fails.

**Feature structure** — each feature under `src/features/<name>/` follows:
```
api/         # axios calls (not hooks — plain async functions)
components/  # feature-specific UI components
hooks/       # React Query useQuery / useMutation wrappers; onSuccess invalidates related keys and shows toast
types/       # TypeScript types
```

**Shared UI components** live in `src/components/ui/` — use these rather than creating new primitives. Layout shell (`MainLayout`, `Sidebar`, `TopBar`) is in `src/components/layout/`.

**Global state**:
- `authStore` — user identity, tokens, socket connection
- `campusStore` — active campus for SUPER_ADMIN multi-campus picker (wired in `TopBar.tsx` + `axios.ts`)
- `notificationStore` — in-app notifications
- `themeStore` — light/dark theme

**Styling**: Tailwind CSS v4 + `tailwind-merge` (`cn()` in `src/lib/utils.ts`). Design tokens are CSS variables defined in `globals.css` — use these, never hardcode colors:
- **Palette**: `--color-teal-{50…950}`, `--color-gold-{100…700}`, `--color-charcoal-{300…950}`, `--color-parchment` / `--color-parchment-dark` / `--color-parchment-darker`
- **Radii**: `--radius-card` (16px), `--radius-card-sm` (12px), `--radius-card-lg` (20px), `--radius-pill`
- **Shadows**: `--shadow-card`, `--shadow-card-md`, `--shadow-card-lg`, `--shadow-gold`, `--shadow-teal`, `--shadow-dark-card`
- **Fonts**: `--font-display` (Playfair Display), `--font-body` (DM Sans), `--font-mono` (JetBrains Mono)

**Animations**: always use the `motion` package (`import { motion, AnimatePresence, … } from "motion/react"`) for every new component — never raw CSS transitions or other animation libraries.

**Utilities** (`src/lib/utils.ts`): `cn()` for class merging, `formatDate()` / `formatTime()` (locale `en-PK`), `getInitials()`, `capitalizeFirst()` — use these before writing new helpers.

**Custom hooks** (`src/hooks/`): `useDebounce`, `useIntersectionObserver` (infinite scroll), `useOnline` (network status), `usePermission`, `useToast` — check here before writing new hooks.

**API error parsing** (`src/lib/apiError.ts`): utility that extracts a human-readable message from Axios errors — use in React Query `onError` callbacks instead of accessing `error.response.data` directly.

**Data fetching**: React Query via `src/lib/queryClient.ts`. Default config: `staleTime: 5 min`, `refetchOnWindowFocus: false`, no retry on 401/403/404. All API calls go through React Query hooks in `features/<name>/hooks/`.

**Forms**: `react-hook-form` + `@hookform/resolvers` with Zod schemas.

**Socket.io client** (`src/lib/socket.ts`): singleton connecting to `NEXT_PUBLIC_API_URL`. User joins their personal room (`join_room` event) on login.

**Filter UI pattern** — the site uses **pill-chip buttons**, not `<Select>` dropdowns, for all filtering (sections, subjects, campuses, exam types, etc.). Pattern from `src/app/(admin)/admin/sections/page.tsx`:
```tsx
const chipBase = 'px-3 py-1 rounded-full text-xs font-medium border transition-colors'
const chipActive = 'bg-[var(--primary)] text-white border-[var(--primary)]'
const chipInactive = 'bg-[var(--surface)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--primary)]'
// Render: <button onClick={() => setFilter(id)} className={`${chipBase} ${active ? chipActive : chipInactive}`}>
```
Never introduce a new `<Select>` for a filter that's better served by chips.

**Exam system** — two exam types share the same `Exam` model:
- **Scheduled exams** (`isClassTest: false`): created by admin via `POST /exams/schedule` (bulk — one schedule event generates N individual exams across sections/subjects). Teachers can only see exams for their assigned `(sectionId, subjectId)` pairs.
- **Class tests** (`isClassTest: true`): created by teacher via `POST /exams/class-test`. Teacher must have a `SectionSubjectTeacher` record for the section+subject. A "Class Test" `ExamType` is auto-created per campus on first use.
- Teachers, students, and parents access `GET /exams` — each role gets server-side filtered results (teacher: their assignments; student: their section; parent: selected child's section).

**Fee challan** (`src/features/fees/components/ChalanModal.tsx`): opens inline as an animated modal overlay — never a new browser tab. The "Download PDF" button injects a `<style id="challan-print-override">` tag that uses `body * { visibility: hidden } + #challan-print-area { visibility: visible }` to isolate only the challan content, calls `window.print()`, then removes the style via `window.onafterprint`. This is the standard pattern for any future print-to-PDF features.
