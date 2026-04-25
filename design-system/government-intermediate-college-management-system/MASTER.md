# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** Government Intermediate College Management System
**Stack:** Next.js 16 (App Router) + React 19 + Tailwind CSS v4
**Updated:** 2026-04-25

---

## Global Rules

### Color Palette — Light Mode (default)

| Role | Hex | CSS Variable |
|------|-----|--------------|
| Primary | `#B45309` | `--primary` (warm amber) |
| Primary Dark | `#8A3D04` | `--primary-dark` |
| Primary Light | `#C96010` | `--primary-light` |
| Gold Accent | `#D4A843` | `--gold` |
| Background | `#FDFBF7` | `--bg` (warm parchment) |
| Surface | `#F8F4EE` | `--surface` |
| Surface Alt | `#F1E9DA` | `--surface-alt` |
| Text | `#4A3B33` | `--text` (warm brown) |
| Text Secondary | `#57534E` | `--text-secondary` |
| Text Muted | `#78716C` | `--text-muted` |
| Border | `#E4D9BC` | `--border` |
| Border Focus | `#B45309` | `--border-focus` |
| Success | `#10B981` | `--success` |
| Warning | `#F59E0B` | `--warning` |
| Danger | `#991B1B` | `--danger` |
| Info | `#3B82F6` | `--info` |

### Color Palette — Dark Mode (`.dark` class)

| Role | Hex | CSS Variable |
|------|-----|--------------|
| Primary | `#F97316` | `--primary` (orange) |
| Gold Accent | `#EAB308` | `--gold` |
| Background | `#1C1917` | `--bg` (warm stone) |
| Surface | `#292524` | `--surface` |
| Text | `#F5F5F4` | `--text` |
| Border | `#44403C` | `--border` |

### Sidebar

| Property | Value |
|----------|-------|
| Background | `#1A1A1B` (dark charcoal, always — ignores theme) |
| Texture | SVG fractalNoise grain at 5.5% opacity, 300×300px tile |
| Active item | Gold `var(--gold)` text + `gold/15` background fill |
| Inactive item | `white/55`, hover `white/7` fill |
| Collapse button | `#2A2A2B` bg, `#333335` hover |
| Shadow | `2px 0 16px rgba(0,0,0,0.35)` |

### Typography

| Role | Font | Variable |
|------|------|----------|
| Display / Headings | Playfair Display | `var(--font-display)` → `var(--font-playfair)` |
| Body / UI | DM Sans | `var(--font-body)` → `var(--font-dm-sans)` |
| Monospace / Code | JetBrains Mono | `var(--font-mono)` → `var(--font-jetbrains)` |

**Mood:** Institutional elegance — serif headings give authority, DM Sans keeps UI legible and modern.

### Spacing Variables

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | `4px` | Tight gaps |
| `--space-sm` | `8px` | Icon gaps, inline |
| `--space-md` | `16px` | Standard padding |
| `--space-lg` | `24px` | Section padding |
| `--space-xl` | `32px` | Large gaps |
| `--space-2xl` | `48px` | Section margins |

### Border Radius

| Token | Value |
|-------|-------|
| `--radius-sm` | `8px` |
| `--radius-md` | `12px` |
| `--radius-lg` | `16px` |
| `--radius-xl` | `24px` |
| `--radius-pill` | `999px` |

### Shadows

| Token | Light Mode | Dark Mode |
|-------|-----------|-----------|
| `--shadow-sm` | `0 1px 3px rgba(74,59,51,0.07)` | `0 1px 3px rgba(0,0,0,0.25)` |
| `--shadow-md` | `0 4px 12px rgba(74,59,51,0.09)` | `0 4px 12px rgba(0,0,0,0.35)` |
| `--shadow-lg` | `0 8px 32px rgba(74,59,51,0.13)` | `0 8px 32px rgba(0,0,0,0.45)` |
| `--shadow-gold-var` | `0 4px 20px rgba(212,168,67,0.30)` | `0 4px 24px rgba(234,179,8,0.22)` |

---

## Component Specs

### Buttons

```css
/* Primary */
background: var(--primary);  color: white;
padding: 10px 20px;  border-radius: var(--radius-sm);
font-family: var(--font-body);  font-weight: 500;
transition: all var(--transition-base);  cursor: pointer;

/* Primary:hover */
background: var(--primary-dark);  transform: translateY(-1px);

/* Ghost */
background: transparent;  color: var(--primary);
border: 1px solid var(--border);
hover: background: var(--surface-hover);
```

### Cards

```css
background: var(--surface);
border: 1px solid var(--border);
border-radius: var(--radius-lg);
padding: 24px;
box-shadow: var(--shadow-sm);
transition: box-shadow var(--transition-base);

card:hover { box-shadow: var(--shadow-md); }
```

### Inputs

```css
background: var(--surface);  color: var(--text);
border: 1px solid var(--border);
border-radius: var(--radius-sm);
padding: 10px 14px;  font-size: 14px;
transition: border-color var(--transition-base);

input:focus {
  border-color: var(--border-focus);
  box-shadow: var(--shadow-glow);  /* 0 0 0 3px rgba(180,83,9,0.14) */
}
```

### Modals

```css
overlay: background: rgba(0,0,0,0.45);  backdrop-filter: blur(4px);

modal:
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 32px;
  box-shadow: var(--shadow-lg);
  max-width: 520px;  width: 90%;
```

### Status Badges

```css
/* success */  bg-emerald-100 text-emerald-700  dark:bg-emerald-900/30 dark:text-emerald-400
/* warning */  bg-amber-100 text-amber-700      dark:bg-amber-900/30 dark:text-amber-400
/* danger  */  bg-red-100 text-red-700          dark:bg-red-900/30 dark:text-red-400
/* info    */  bg-blue-100 text-blue-700         dark:bg-blue-900/30 dark:text-blue-400
```

---

## Style Guidelines

**Style:** Institutional Data Dashboard — warm parchment light mode, warm stone dark mode.

**Page pattern:** Role-scoped dashboards (Principal, Admin, Teacher, Parent, Student).
Data surfaces via KPI cards → data tables → drill-down modals.

**Key Effects:**
- Hover: `box-shadow` lift, no layout-shifting `scale` transforms
- Transitions: `150–300ms` cubic-bezier ease
- Loading: skeleton shimmer (`--animate-shimmer`) or `Loader2` spinner
- Animations: `motion/react` (Motion library) — **always use `motion` for every new animated component**

---

## Architecture Notes

| Concern | Pattern |
|---------|---------|
| API calls | `src/features/<name>/api/` plain async functions |
| Data fetching | React Query hooks in `src/features/<name>/hooks/` |
| Forms | `react-hook-form` + Zod schemas |
| Global state | Zustand stores (`authStore`, `campusStore`) |
| Campus scoping | Enforced server-side; ADMIN sees only their campus |
| Response helpers | `sendSuccess` / `sendError` — never `res.json()` directly |
| Socket | Socket.io singleton; users join room by `userId` |

---

## Anti-Patterns (Do NOT Use)

- ❌ **Emojis as icons** — use Lucide icons
- ❌ `res.json()` directly — use `sendSuccess` / `sendError` helpers
- ❌ `new PrismaClient()` in services — import from `src/config/database.ts`
- ❌ Hardcoded campus IDs in services — read from `req.query.campusId`
- ❌ Layout-shifting hover transforms (`scale`)
- ❌ Low contrast text (< 4.5:1) in light mode
- ❌ Instant state changes — always use transitions 150–300ms
- ❌ Missing `cursor-pointer` on interactive elements
- ❌ Purple / violet / teal colors — the palette is **warm amber + parchment**
- ❌ Hardcoded hex colors in components — use CSS variables (`var(--primary)`)

---

## Pre-Delivery Checklist

- [ ] No emojis used as icons — Lucide only
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150–300ms)
- [ ] Light mode text contrast ≥ 4.5:1
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected
- [ ] Animated components use `motion/react` (not CSS keyframes alone)
- [ ] Responsive: 375px, 768px, 1024px, 1440px
- [ ] Dark mode tested — surfaces use `--surface` / `--bg` not hardcoded greys
- [ ] No horizontal scroll on mobile
- [ ] Campus scoping unchanged (server enforces it)
