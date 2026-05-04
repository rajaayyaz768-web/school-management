"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { FalconEagleLogo } from "@/components/landing/FalconEagleLogo";
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
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface NavItem {
  label: string;
  href:  string;
  icon:  React.ElementType;
}

interface NavGroup {
  id:       string;
  label:    string;
  items:    NavItem[];
  defaultOpen?: boolean;
}

interface NavConfig {
  pinned: NavItem[];
  groups: NavGroup[];
}

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

// ─── Nav definitions ─────────────────────────────────────────────────────────
const NAV: Record<UserRole, NavConfig> = {
  SUPER_ADMIN: {
    pinned: [
      { label: "Dashboard",     href: "/principal/dashboard",     icon: LayoutDashboard },
      { label: "Live View",     href: "/principal/live-view",     icon: Radio },
      { label: "Teachers Live", href: "/principal/teachers-live", icon: UserCheck },
    ],
    groups: [
      {
        id: "people", label: "People", defaultOpen: false,
        items: [
          { label: "Students",          href: "/principal/students",           icon: GraduationCap },
          { label: "Staff",             href: "/principal/staff",              icon: Users },
          { label: "Parents",           href: "/principal/parents",            icon: Heart },
          { label: "Admin Management",  href: "/principal/admins",             icon: UserCog },
        ],
      },
      {
        id: "academic", label: "Academic", defaultOpen: false,
        items: [
          { label: "Programs",           href: "/principal/programs",           icon: BookOpen },
          { label: "Sections",           href: "/principal/sections",           icon: Layers },
          { label: "Subjects",           href: "/principal/subjects",           icon: BookMarked },
          { label: "Section Assignment", href: "/principal/section-assignment", icon: Shuffle },
          { label: "Timetable",          href: "/principal/timetable",          icon: Clock },
        ],
      },
      {
        id: "operations", label: "Operations", defaultOpen: false,
        items: [
          { label: "Staff Attendance",   href: "/attendance/staff",    icon: ClipboardCheck },
          { label: "Student Attendance", href: "/attendance/students", icon: CalendarCheck },
          { label: "Fees",               href: "/fees",                icon: CreditCard },
          { label: "Exams",              href: "/exams",               icon: FileText },
          { label: "Results",            href: "/admin/results",       icon: BarChart2 },
        ],
      },
      {
        id: "campus", label: "Campus", defaultOpen: false,
        items: [
          { label: "Campus",     href: "/principal/campus-management", icon: Building2 },
          { label: "Hierarchy",  href: "/principal/hierarchy",         icon: Network },
          { label: "Promotion",  href: "/principal/promotion",         icon: ArrowUpCircle },
        ],
      },
      {
        id: "communication", label: "Communication", defaultOpen: false,
        items: [
          { label: "Chat",          href: "/principal/chat", icon: MessageSquare },
          { label: "Announcements", href: "/announcements",  icon: Megaphone },
          { label: "Reports",       href: "/reports",        icon: PieChart },
        ],
      },
      {
        id: "system", label: "System", defaultOpen: false,
        items: [
          { label: "Settings", href: "/principal/settings/backups", icon: Settings },
        ],
      },
    ],
  },

  ADMIN: {
    pinned: [
      { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    ],
    groups: [
      {
        id: "people", label: "People", defaultOpen: true,
        items: [
          { label: "Students", href: "/admin/students", icon: GraduationCap },
          { label: "Staff",    href: "/admin/staff",    icon: Users },
          { label: "Parents",  href: "/admin/parents",  icon: Heart },
        ],
      },
      {
        id: "academic", label: "Academic", defaultOpen: false,
        items: [
          { label: "Programs",           href: "/admin/programs",           icon: BookOpen },
          { label: "Sections",           href: "/admin/sections",           icon: Layers },
          { label: "Subjects",           href: "/admin/subjects",           icon: BookMarked },
          { label: "Section Assignment", href: "/admin/section-assignment", icon: Shuffle },
          { label: "Timetable",          href: "/admin/timetable",          icon: Clock },
        ],
      },
      {
        id: "operations", label: "Operations", defaultOpen: false,
        items: [
          { label: "Staff Attendance",   href: "/attendance/staff",    icon: ClipboardCheck },
          { label: "Absent Today",       href: "/attendance/absent",   icon: UserX },
          { label: "Student Attendance", href: "/attendance/students", icon: CalendarCheck },
          { label: "Fees",               href: "/fees",                icon: CreditCard },
          { label: "Exams",              href: "/exams",               icon: FileText },
          { label: "Results",            href: "/admin/results",       icon: BarChart2 },
        ],
      },
      {
        id: "campus", label: "Campus", defaultOpen: false,
        items: [
          { label: "Promotion", href: "/admin/promotion", icon: ArrowUpCircle },
        ],
      },
      {
        id: "communication", label: "Communication", defaultOpen: false,
        items: [
          { label: "Announcements", href: "/announcements",  icon: Megaphone },
          { label: "Reports",       href: "/reports",        icon: PieChart },
        ],
      },
      {
        id: "system", label: "System", defaultOpen: false,
        items: [
          { label: "Settings", href: "/admin/settings", icon: Settings },
        ],
      },
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
      { label: "Home",       href: "/student/dashboard",      icon: Home },
      { label: "Timetable",  href: "/student/timetable",      icon: Clock },
      { label: "Attendance", href: "/student/attendance",     icon: CalendarCheck },
      { label: "Exams",      href: "/student/exams",          icon: FileText },
      { label: "Results",    href: "/student/results",        icon: ClipboardList },
      { label: "Notices",    href: "/student/announcements",  icon: Megaphone },
    ],
    groups: [],
  },
};

const ROLE_LABEL: Record<UserRole, string> = {
  SUPER_ADMIN: "Principal", ADMIN: "Administrator",
  TEACHER: "Teacher", PARENT: "Parent", STUDENT: "Student",
};

// ─── Single nav link ──────────────────────────────────────────────────────────
function NavLink({ item, collapsed, isActive }: {
  item: NavItem; collapsed: boolean; isActive: boolean;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={cn(
        "group relative flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] transition-colors duration-150",
        isActive
          ? "bg-white/[0.09] text-white"
          : "text-white/48 hover:bg-white/[0.05] hover:text-white/82"
      )}
    >
      {isActive && (
        <motion.span
          layoutId="nav-active-pill"
          className="absolute left-0 top-1/2 h-[18px] w-[3px] -translate-y-1/2 rounded-r-full bg-[var(--gold)]"
          transition={{ type: "spring", stiffness: 400, damping: 34 }}
        />
      )}
      <Icon className={cn(
        "h-4 w-4 shrink-0 transition-colors duration-150",
        isActive ? "text-[var(--gold)]" : "text-white/42 group-hover:text-white/72"
      )} />
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -4 }}
            transition={{ duration: 0.13 }}
            className={cn(
              "truncate text-[12.5px] font-medium leading-none",
              isActive ? "text-white" : "text-white/52 group-hover:text-white/84"
            )}
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
}

// ─── Collapsible group ────────────────────────────────────────────────────────
function NavGroupSection({ group, collapsed, pathname }: {
  group: NavGroup; collapsed: boolean; pathname: string;
}) {
  const hasActive = group.items.some(
    i => pathname === i.href || (i.href !== "/" && pathname.startsWith(i.href + "/"))
  );

  const [open, setOpen] = useState(group.defaultOpen || hasActive);

  return (
    <div>
      {collapsed ? (
        <div className="sidebar-collapsed-divider" />
      ) : (
        <button
          onClick={() => setOpen(o => !o)}
          className={cn(
            "sidebar-group-header w-full",
            hasActive && "sidebar-group-header-active"
          )}
        >
          <span>{group.label}</span>
          <Caret className={cn(
            "sidebar-group-chevron",
            open && "sidebar-group-chevron-open"
          )} />
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
              {!collapsed && <span className="sidebar-group-rail pointer-events-none" />}
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

  // Detect mobile breakpoint (SSR-safe: starts false, corrects after hydration)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Auto-close drawer when navigating on mobile
  useEffect(() => {
    if (isMobile) onMobileClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!user) return null;

  const config = NAV[user.role] ?? { pinned: [], groups: [] };
  const pinned = process.env.NODE_ENV === "development"
    ? [...config.pinned, { label: "Design System", href: "/showcase", icon: Paintbrush }]
    : config.pinned;

  // On mobile: 260px fixed drawer; on desktop: 228/60 collapsible
  const desktopWidth = collapsed ? 60 : 228;

  return (
    <>
      {/* Backdrop — mobile only, behind sidebar, in front of content */}
      <AnimatePresence>
        {isMobile && mobileOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={onMobileClose}
          />
        )}
      </AnimatePresence>

      <motion.aside
        animate={{
          width: isMobile ? 260 : desktopWidth,
          x: isMobile ? (mobileOpen ? 0 : -260) : 0,
        }}
        transition={{ duration: 0.26, ease: "easeInOut" }}
        className="fixed md:relative inset-y-0 left-0 z-50 flex h-screen shrink-0 flex-col text-white"
        style={{
          background: "linear-gradient(180deg, #1c1c1e 0%, #141415 100%)",
          boxShadow: "1px 0 0 rgba(255,255,255,0.055), 4px 0 24px rgba(0,0,0,0.38)",
        }}
      >
        {/* Logo */}
        <div className="flex h-14 shrink-0 items-center gap-3 border-b border-white/[0.06] px-3.5 overflow-hidden">
          <FalconEagleLogo size={collapsed && !isMobile ? 28 : 36} />
          <AnimatePresence initial={false}>
            {(!collapsed || isMobile) && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="truncate text-[14.5px] font-bold tracking-tight text-white"
              >
                Falcon School
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile close button */}
        <button
          onClick={onMobileClose}
          className="absolute right-3 top-4 md:hidden flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-colors"
          aria-label="Close navigation"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2.5 scrollbar-none">
          <div className="flex flex-col gap-0.5 px-2">
            {pinned.map(item => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href + "/"));
              return (
                <NavLink key={item.href} item={item} collapsed={collapsed && !isMobile} isActive={isActive} />
              );
            })}

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

        {/* User footer */}
        <AnimatePresence initial={false}>
          {(!collapsed || isMobile) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.13 }}
              className="shrink-0 border-t border-white/[0.06] px-4 py-3"
            >
              <p className="text-[9.5px] text-white/28 uppercase tracking-widest mb-0.5">Signed in as</p>
              <p className="truncate text-[12.5px] font-semibold text-white/80">
                {user.fullName || ROLE_LABEL[user.role]}
              </p>
              <p className="text-[10px] text-white/28 mt-0.5">{ROLE_LABEL[user.role]}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapse toggle — desktop only */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="hidden md:flex absolute -right-3 top-[18px] h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-[#252527] text-white/45 shadow-md transition-colors hover:bg-[#2e2e30] hover:text-white focus:outline-none"
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
