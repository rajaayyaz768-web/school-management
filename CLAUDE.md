# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Layout

```
college-system/
  college-backend/   # Node.js + Express + Prisma API
  college-web/       # Next.js 16 frontend
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
npm run prisma:seed         # seed database
npm run prisma:studio       # open Prisma Studio GUI
```

### Required Environment Variables

The backend expects a `.env` file with:
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — access token secret
- `JWT_REFRESH_SECRET` — refresh token secret
- `JWT_ACCESS_EXPIRES` — e.g., `15m`
- `JWT_REFRESH_EXPIRES` — e.g., `7d`
- `PORT` — defaults to `5000`

### Architecture

**Entry**: `src/server.ts` → creates HTTP server, attaches Socket.io, verifies DB connection, then listens.

**App setup**: `src/app.ts` → middleware stack order: Helmet → CORS → body-parser → cookie-parser → rate-limiter → request-logger → routes → 404 → global error handler.

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
1. `authenticate` — verifies Bearer JWT, attaches `req.user` (`{ id, email, role, campusId }`)
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

**Database**: PostgreSQL via Prisma. Schema is at `prisma/schema.prisma`. Key models: `User`, `Campus`, `Program`, `Grade`, `Section`, `StaffProfile`, `StudentProfile`, `ParentProfile`. Auth tokens use httpOnly cookies for refresh tokens; access tokens are sent in `Authorization: Bearer` header.

**Real-time**: Socket.io server initialised via `src/config/socket.ts`. Users join a room keyed by their `userId` on login.

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

**Routing**: Next.js App Router with route groups for role isolation:
- `(auth)/login` — unauthenticated entry point
- `(principal)/` — SUPER_ADMIN routes
- `(admin)/` — ADMIN routes
- `(teacher)/`, `(parent)/`, `(student)/` — respective role routes

**Middleware** (`src/middleware.ts`) — reads `access-token` and `user-role` cookies; redirects unauthenticated users to `/login` and enforces role-based route access before the page renders.

**Auth state**: Zustand store (`src/store/authStore.ts`) persisted to `localStorage` as `college-auth`. On `setAuth`, sets `access-token` and `user-role` cookies (1-day expiry) and connects Socket.io. On `logout`, removes cookies and disconnects socket.

**API client** (`src/lib/axios.ts`): Axios instance with `baseURL = NEXT_PUBLIC_API_URL`. Automatically attaches `Authorization: Bearer <token>` from the auth store. On 401, silently attempts token refresh via `POST /auth/refresh-token` using the httpOnly refresh cookie; queues concurrent failed requests during refresh; redirects to `/login` if refresh fails.

**Feature structure** — each feature under `src/features/<name>/` follows:
```
api/      # axios calls, React Query hooks (useQuery / useMutation)
components/  # feature-specific UI components
hooks/    # feature-specific hooks
types/    # TypeScript types
```

**Shared UI components** live in `src/components/ui/` — use these rather than creating new primitives. Layout shell (`MainLayout`, `Sidebar`, `TopBar`) is in `src/components/layout/`.

**Global state**:
- `authStore` — user identity, tokens
- `campusStore` — currently selected campus (for SUPER_ADMIN multi-campus)
- `notificationStore` — in-app notifications
- `themeStore` — light/dark theme

**Data fetching**: React Query (`@tanstack/react-query`) via the `queryClient` in `src/lib/queryClient.ts`. Wrap API calls in React Query hooks inside `features/<name>/api/`.

**Styling**: Tailwind CSS v4 with `tailwind-merge` (`cn()` util in `src/lib/utils.ts`) and `clsx`.

**Forms**: `react-hook-form` + `@hookform/resolvers` with Zod schemas for validation.

**Socket.io client** (`src/lib/socket.ts`): singleton socket connecting to `NEXT_PUBLIC_API_URL`. User joins their personal room (`join_room` event) on login.
