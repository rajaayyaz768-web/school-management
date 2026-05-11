"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { usePathname } from "next/navigation";
import { useCurrentUser, UserRole } from "@/store/authStore";
import { cn } from "@/lib/utils";
import {
  GraduationCap, LayoutDashboard, Users, CalendarCheck, Clock, Wallet,
  BookOpen, ClipboardList, ClipboardCheck, Megaphone, Settings,
  ChevronLeft, ChevronRight, ChevronRight as Caret,
  MessageSquare, Home, UserCog, Building2, FileText, Paintbrush,
  BookMarked, Heart, Shuffle, Network, Radio, PieChart, Layers,
  CreditCard, BarChart2, UserCheck, ArrowUpCircle, X, UserX,
  Sparkles,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface NavItem  { label: string; href: string; icon: React.ElementType }
interface NavGroup { id: string; label: string; items: NavItem[]; defaultOpen?: boolean; color?: string }
interface NavConfig { pinned: NavItem[]; groups: NavGroup[] }
interface SidebarProps { mobileOpen: boolean; onMobileClose: () => void }

// ─── Category color palette ───────────────────────────────────────────────────
const GROUP_COLORS: Record<string, string> = {
  people:        '#34d399', // emerald-400  — humans, family
  academic:      '#818cf8', // indigo-400   — learning, knowledge
  operations:    '#fbbf24', // amber-400    — work, process
  campus:        '#22d3ee', // cyan-400     — place, structure
  communication: '#c084fc', // purple-400  — connection, voice
  system:        '#94a3b8', // slate-400    — infrastructure
};

// ─── Nav config ───────────────────────────────────────────────────────────────
const NAV: Record<UserRole, NavConfig> = {
  SUPER_ADMIN: {
    pinned: [
      { label: "Dashboard",     href: "/principal/dashboard",     icon: LayoutDashboard },
      { label: "Live View",     href: "/principal/live-view",     icon: Radio },
      { label: "Teachers Live", href: "/principal/teachers-live", icon: UserCheck },
    ],
    groups: [
      { id: "people", label: "People", color: GROUP_COLORS.people, defaultOpen: false, items: [
        { label: "Students",         href: "/principal/students",           icon: GraduationCap },
        { label: "Staff",            href: "/principal/staff",              icon: Users },
        { label: "Parents",          href: "/principal/parents",            icon: Heart },
        { label: "Admin Management", href: "/principal/admins",             icon: UserCog },
      ]},
      { id: "academic", label: "Academic", color: GROUP_COLORS.academic, defaultOpen: false, items: [
        { label: "Programs",           href: "/principal/programs",           icon: BookOpen },
        { label: "Sections",           href: "/principal/sections",           icon: Layers },
        { label: "Subjects",           href: "/principal/subjects",           icon: BookMarked },
        { label: "Section Assignment", href: "/principal/section-assignment", icon: Shuffle },
        { label: "Timetable",          href: "/principal/timetable",          icon: Clock },
      ]},
      { id: "operations", label: "Operations", color: GROUP_COLORS.operations, defaultOpen: false, items: [
        { label: "Staff Attendance",   href: "/attendance/staff",    icon: ClipboardCheck },
        { label: "Absent Today",       href: "/attendance/absent",   icon: UserX },
        { label: "Student Attendance", href: "/attendance/students", icon: CalendarCheck },
        { label: "Fees",               href: "/fees",                icon: CreditCard },
        { label: "Exams",              href: "/exams",               icon: FileText },
        { label: "Results",            href: "/admin/results",       icon: BarChart2 },
      ]},
      { id: "campus", label: "Campus", color: GROUP_COLORS.campus, defaultOpen: false, items: [
        { label: "Campus",    href: "/principal/campus-management", icon: Building2 },
        { label: "Hierarchy", href: "/principal/hierarchy",         icon: Network },
        { label: "Promotion", href: "/principal/promotion",         icon: ArrowUpCircle },
      ]},
      { id: "communication", label: "Communication", color: GROUP_COLORS.communication, defaultOpen: false, items: [
        { label: "Chat",          href: "/principal/chat", icon: MessageSquare },
        { label: "Announcements", href: "/announcements",  icon: Megaphone },
        { label: "Reports",       href: "/reports",        icon: PieChart },
      ]},
      { id: "system", label: "System", color: GROUP_COLORS.system, defaultOpen: false, items: [
        { label: "Settings", href: "/principal/settings/backups", icon: Settings },
      ]},
    ],
  },
  ADMIN: {
    pinned: [
      { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    ],
    groups: [
      { id: "people", label: "People", color: GROUP_COLORS.people, defaultOpen: true, items: [
        { label: "Students", href: "/admin/students", icon: GraduationCap },
        { label: "Staff",    href: "/admin/staff",    icon: Users },
        { label: "Parents",  href: "/admin/parents",  icon: Heart },
      ]},
      { id: "academic", label: "Academic", color: GROUP_COLORS.academic, defaultOpen: false, items: [
        { label: "Programs",           href: "/admin/programs",           icon: BookOpen },
        { label: "Sections",           href: "/admin/sections",           icon: Layers },
        { label: "Subjects",           href: "/admin/subjects",           icon: BookMarked },
        { label: "Section Assignment", href: "/admin/section-assignment", icon: Shuffle },
        { label: "Timetable",          href: "/admin/timetable",          icon: Clock },
      ]},
      { id: "operations", label: "Operations", color: GROUP_COLORS.operations, defaultOpen: false, items: [
        { label: "Staff Attendance",   href: "/attendance/staff",    icon: ClipboardCheck },
        { label: "Absent Today",       href: "/attendance/absent",   icon: UserX },
        { label: "Student Attendance", href: "/attendance/students", icon: CalendarCheck },
        { label: "Fees",               href: "/fees",                icon: CreditCard },
        { label: "Exams",              href: "/exams",               icon: FileText },
        { label: "Results",            href: "/admin/results",       icon: BarChart2 },
      ]},
      { id: "campus", label: "Campus", color: GROUP_COLORS.campus, defaultOpen: false, items: [
        { label: "Promotion", href: "/admin/promotion", icon: ArrowUpCircle },
      ]},
      { id: "communication", label: "Communication", color: GROUP_COLORS.communication, defaultOpen: false, items: [
        { label: "Announcements", href: "/announcements", icon: Megaphone },
        { label: "Reports",       href: "/reports",       icon: PieChart },
      ]},
      { id: "system", label: "System", color: GROUP_COLORS.system, defaultOpen: false, items: [
        { label: "Settings", href: "/admin/settings", icon: Settings },
      ]},
    ],
  },
  TEACHER: {
    pinned: [
      { label: "My Day",        href: "/teacher/dashboard",  icon: LayoutDashboard },
      { label: "My Teaching",   href: "/teacher/teaching",   icon: BookMarked },
      { label: "My Classes",    href: "/teacher/my-classes", icon: Users },
      { label: "Attendance",    href: "/teacher/attendance", icon: CalendarCheck },
      { label: "Enter Results", href: "/teacher/results",    icon: BookOpen },
      { label: "Timetable",     href: "/teacher/timetable",  icon: Clock },
      { label: "Exams",         href: "/teacher/exams",      icon: FileText },
      { label: "Chat",          href: "/teacher/chat",       icon: MessageSquare },
    ],
    groups: [],
  },
  PARENT: {
    pinned: [
      { label: "Home",          href: "/parent/dashboard",     icon: Home },
      { label: "Attendance",    href: "/parent/attendance",    icon: CalendarCheck },
      { label: "Fees",          href: "/parent/fees",          icon: Wallet },
      { label: "Exams",         href: "/parent/exams",         icon: FileText },
      { label: "Results",       href: "/parent/results",       icon: BookOpen },
      { label: "Announcements", href: "/parent/announcements", icon: Megaphone },
    ],
    groups: [],
  },
  STUDENT: {
    pinned: [
      { label: "Home",       href: "/student/dashboard",     icon: Home },
      { label: "Timetable",  href: "/student/timetable",     icon: Clock },
      { label: "Attendance", href: "/student/attendance",    icon: CalendarCheck },
      { label: "Exams",      href: "/student/exams",         icon: FileText },
      { label: "Results",    href: "/student/results",       icon: ClipboardList },
      { label: "Notices",    href: "/student/announcements", icon: Megaphone },
    ],
    groups: [],
  },
};

const ROLE_LABEL: Record<UserRole, string> = {
  SUPER_ADMIN: "Principal", ADMIN: "Administrator",
  TEACHER: "Teacher", PARENT: "Parent", STUDENT: "Student",
};

// Role gradient for user avatar
const ROLE_GRADIENT: Record<UserRole, string> = {
  SUPER_ADMIN: 'linear-gradient(135deg, #6366f1, #818cf8)',
  ADMIN:       'linear-gradient(135deg, #34d399, #10b981)',
  TEACHER:     'linear-gradient(135deg, #fbbf24, #f59e0b)',
  PARENT:      'linear-gradient(135deg, #c084fc, #8b5cf6)',
  STUDENT:     'linear-gradient(135deg, #22d3ee, #06b6d4)',
};

// ─── NavLink ──────────────────────────────────────────────────────────────────
// ALL colours are inline styles — guaranteed to override any CSS rule.
// Active items use var(--primary) so scheme changes instantly recolour them.
function NavLink({ item, collapsed, isActive }: {
  item: NavItem; collapsed: boolean; isActive: boolean;
}) {
  const Icon = item.icon;

  const baseStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: collapsed ? '9px 0' : '9px 10px',
    justifyContent: collapsed ? 'center' : undefined,
    borderRadius: 10,
    fontWeight: 600,
    fontSize: 14,
    textDecoration: 'none',
    transition: 'background 140ms, color 140ms, border-color 140ms',
    borderLeft: isActive && !collapsed ? '2.5px solid var(--primary)' : '2.5px solid transparent',
    background: isActive
      ? 'color-mix(in srgb, var(--primary) 20%, transparent)'
      : 'transparent',
    color: isActive ? '#ffffff' : 'rgba(203, 213, 225, 0.75)',
    cursor: 'pointer',
  };

  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      style={baseStyle}
      onMouseEnter={e => {
        if (!isActive) {
          e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
          e.currentTarget.style.color = '#e2e8f0';
        }
      }}
      onMouseLeave={e => {
        if (!isActive) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = 'rgba(203,213,225,0.75)';
        }
      }}
    >
      <Icon
        style={{
          width: 16,
          height: 16,
          flexShrink: 0,
          color: isActive ? 'var(--primary)' : 'rgba(148,163,184,0.70)',
          transition: 'color 140ms',
        }}
      />
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -4 }}
            transition={{ duration: 0.13 }}
            style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1 }}
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
}

// ─── NavGroupSection ──────────────────────────────────────────────────────────
function NavGroupSection({ group, collapsed, pathname }: {
  group: NavGroup; collapsed: boolean; pathname: string
}) {
  const dotColor = group.color ?? '#94a3b8'; // semantic dot — stays constant
  const hasActive = group.items.some(
    i => pathname === i.href || (i.href !== "/" && pathname.startsWith(i.href + "/"))
  );
  const [open, setOpen] = useState(group.defaultOpen || hasActive);

  return (
    <div>
      {collapsed ? (
        <div className="my-2 h-px mx-2" style={{ background: 'rgba(255,255,255,0.08)' }} />
      ) : (
        <button
          onClick={() => setOpen(o => !o)}
          className="w-full flex items-center justify-between px-2.5 mt-1 rounded-lg hover:bg-white/[0.04]"
          style={{ padding: '10px', transition: 'background 140ms', cursor: 'pointer' }}
        >
          <div className="flex items-center gap-2">
            {/* Semantic colour dot — identifies category regardless of scheme */}
            <span className="h-[7px] w-[7px] rounded-full flex-shrink-0"
              style={{
                background: dotColor,
                opacity: hasActive ? 1 : 0.35,
                boxShadow: hasActive ? `0 0 6px ${dotColor}90` : 'none',
                transition: 'opacity 140ms, box-shadow 140ms',
              }} />
            {/* Label uses var(--primary) when section has active item */}
            <span className="text-[10px] font-bold uppercase tracking-[0.15em]"
              style={{
                color: hasActive ? 'var(--primary)' : 'rgba(148,163,184,0.50)',
                transition: 'color 140ms',
              }}>
              {group.label}
            </span>
          </div>
          <motion.div animate={{ rotate: open ? 0 : -90 }} transition={{ duration: 0.2 }}>
            <Caret className="h-3 w-3" style={{ color: 'rgba(148,163,184,0.40)' }} />
          </motion.div>
        </button>
      )}

      <AnimatePresence initial={false}>
        {(open || collapsed) && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className={cn("relative flex flex-col gap-0.5 py-0.5", !collapsed && "pl-1")}>
              {!collapsed && (
                <span className="pointer-events-none absolute left-[14px] top-0 bottom-0 w-px rounded-full"
                  style={{ background: 'rgba(255,255,255,0.08)' }} />
              )}
              {group.items.map(item => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href + "/"));
                return (
                  <NavLink key={item.href} item={item} collapsed={collapsed} isActive={isActive} />
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
export default function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const user     = useCurrentUser();
  const pathname = usePathname();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (isMobile) onMobileClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!user) return null;

  const config = NAV[user.role] ?? { pinned: [], groups: [] };
  const pinned = process.env.NODE_ENV === "development"
    ? [...config.pinned, { label: "Design System", href: "/showcase", icon: Paintbrush }]
    : config.pinned;

  const desktopWidth = collapsed ? 62 : 264;
  const initials = user.fullName
    ? user.fullName.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase()
    : user.email.substring(0, 2).toUpperCase();

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {isMobile && mobileOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-40 md:hidden"
            style={{ background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(4px)' }}
            onClick={onMobileClose}
          />
        )}
      </AnimatePresence>

      <motion.aside
        animate={{
          width: isMobile ? 264 : desktopWidth,
          x: isMobile ? (mobileOpen ? 0 : -264) : 0,
        }}
        transition={{ duration: 0.26, ease: "easeInOut" }}
        className="fixed md:relative inset-y-0 left-0 z-50 flex h-screen shrink-0 flex-col"
        style={{
          background: 'linear-gradient(180deg, #0f172a 0%, #111827 100%)',
          borderRight: '1px solid rgba(255,255,255,0.07)',
          boxShadow: isMobile && mobileOpen ? '8px 0 32px rgba(0,0,0,0.4)' : 'none',
        }}
      >
        {/* ── Brand ─────────────────────────────────────── */}
        <div
          className="flex h-[64px] shrink-0 items-center gap-3 px-3.5 overflow-hidden"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
        >
          {/* Gradient logo */}
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white text-base font-black shadow-lg"
            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 50%, #a78bfa 100%)' }}
          >
            S
          </div>
          <AnimatePresence initial={false}>
            {(!collapsed || isMobile) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="min-w-0"
              >
                <p style={{ fontSize: 14, fontWeight: 700, color: '#ffffff', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  Falcon School
                </p>
                <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(148,163,184,0.65)' }}>
                  Management System
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile close */}
        <button
          onClick={onMobileClose}
          className="absolute right-3 top-4 md:hidden flex h-7 w-7 items-center justify-center rounded-full text-white/50 hover:text-white transition-colors"
          style={{ background: 'rgba(255,255,255,0.08)' }}
          aria-label="Close navigation"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        {/* ── Nav ───────────────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 scrollbar-none">
          <div className="flex flex-col gap-0.5 px-[14px]">

            {/* Pinned items */}
            {pinned.map(item => {
              const isActive = pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href + "/"));
              return (
                <NavLink key={item.href} item={item}
                  collapsed={collapsed && !isMobile} isActive={isActive} />
              );
            })}

            {/* Group separator */}
            {config.groups.length > 0 && (
              <div className="my-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
            )}

            {/* Grouped nav */}
            {config.groups.map(group => (
              <NavGroupSection
                key={group.id}
                group={group}
                collapsed={collapsed && !isMobile}
                pathname={pathname}
              />
            ))}
          </div>
        </nav>

        {/* ── User footer ───────────────────────────────── */}
        <AnimatePresence initial={false}>
          {(!collapsed || isMobile) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.13 }}
              className="shrink-0 px-[14px] py-3 flex items-center gap-2.5"
              style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: 'rgba(0,0,0,0.15)' }}
            >
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-md"
                style={{ background: ROLE_GRADIENT[user.role] }}
              >
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ fontSize: 13, fontWeight: 700, color: '#ffffff', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.fullName || ROLE_LABEL[user.role]}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Sparkles style={{ width: 10, height: 10, color: 'rgba(148,163,184,0.55)', flexShrink: 0 }} />
                  <p style={{ fontSize: 11, fontWeight: 500, color: 'rgba(148,163,184,0.65)' }}>
                    {ROLE_LABEL[user.role]}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapsed user avatar */}
        <AnimatePresence initial={false}>
          {collapsed && !isMobile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.13 }}
              className="shrink-0 flex justify-center py-3"
              style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ background: ROLE_GRADIENT[user.role] }}>
                {initials}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Collapse toggle (desktop only) ──────────── */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="hidden md:flex absolute -right-3 top-[20px] h-6 w-6 items-center justify-center rounded-full text-white/50 transition-all hover:text-white shadow-md"
          style={{ background: '#1e2540', border: '1px solid rgba(255,255,255,0.12)' }}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed
            ? <ChevronRight className="h-3.5 w-3.5" />
            : <ChevronLeft  className="h-3.5 w-3.5" />}
        </button>
      </motion.aside>
    </>
  );
}
