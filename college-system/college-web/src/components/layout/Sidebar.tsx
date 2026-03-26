"use client";

import { useState } from "react";
import Link from "next/link";
import { FalconEagleLogo } from "@/components/landing/FalconEagleLogo";
import { usePathname } from "next/navigation";
import { useCurrentUser, UserRole } from "@/store/authStore";
import { cn } from "@/lib/utils";
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  CalendarCheck,
  Clock,
  Wallet,
  BookOpen,
  ClipboardList,
  Megaphone,
  Settings,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Home,
  UserCog,
  MonitorPlay,
  Building2,
  BarChart3,
  FileText,
  Paintbrush,
  BookMarked,
  Heart,
  Shuffle,
  Network,
  Radio,
  PieChart,
  Layers,
  CreditCard,
  BarChart2,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const NAV_ITEMS: Record<UserRole, NavItem[]> = {
  SUPER_ADMIN: [
    { label: "Dashboard", href: "/principal/dashboard", icon: LayoutDashboard },
    { label: "Hierarchy Browser", href: "/principal/hierarchy", icon: Network },
    { label: "Live View", href: "/principal/live-view", icon: Radio },
    { label: "Students", href: "/principal/students", icon: GraduationCap },
    { label: "Staff", href: "/principal/staff", icon: Users },
    { label: "Campus", href: "/admin/campus", icon: Building2 },
    { label: "Programs", href: "/admin/programs", icon: BookOpen },
    { label: "Reports", href: "/principal/reports", icon: PieChart },
    { label: "Chat", href: "/principal/chat", icon: MessageSquare },
    { label: "Announcements", href: "/principal/announcements", icon: Megaphone },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ],
  ADMIN: [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Campus", href: "/admin/campus", icon: Building2 },
    { label: "Programs", href: "/admin/programs", icon: BookOpen },
    { label: "Sections", href: "/admin/sections", icon: Layers },
    { label: "Subjects", href: "/admin/subjects", icon: BookMarked },
    { label: "Students", href: "/admin/students", icon: GraduationCap },
    { label: "Staff", href: "/admin/staff", icon: Users },
    { label: "Parents", href: "/admin/parents", icon: Heart },
    { label: "Section Assignment", href: "/admin/section-assignment", icon: Shuffle },
    { label: "Attendance", href: "/admin/attendance/staff", icon: CalendarCheck },
    { label: "Timetable", href: "/admin/timetable", icon: Clock },
    { label: "Fees", href: "/admin/fees", icon: CreditCard },
    { label: "Exams", href: "/admin/exams", icon: FileText },
    { label: "Results", href: "/admin/results", icon: BarChart2 },
    { label: "Announcements", href: "/admin/announcements", icon: Megaphone },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ],
  TEACHER: [
    { label: "My Day", href: "/teacher/dashboard", icon: LayoutDashboard },
    { label: "Attendance", href: "/teacher/attendance", icon: CalendarCheck },
    { label: "My Classes", href: "/teacher/my-classes", icon: Users },
    { label: "Enter Results", href: "/teacher/results", icon: BookOpen },
    { label: "Timetable", href: "/teacher/timetable", icon: Clock },
    { label: "Chat", href: "/teacher/chat", icon: MessageSquare },
  ],
  PARENT: [
    { label: "Home", href: "/parent/dashboard", icon: Home },
    { label: "Attendance", href: "/parent/attendance", icon: CalendarCheck },
    { label: "Fees", href: "/parent/fees", icon: Wallet },
    { label: "Results", href: "/parent/results", icon: BookOpen },
    { label: "Announcements", href: "/parent/announcements", icon: Megaphone },
  ],
  STUDENT: [
    { label: "Home", href: "/student/dashboard", icon: Home },
    { label: "Timetable", href: "/student/timetable", icon: Clock },
    { label: "Attendance", href: "/student/attendance", icon: CalendarCheck },
    { label: "Results", href: "/student/results", icon: ClipboardList },
    { label: "Notices", href: "/student/announcements", icon: Megaphone },
  ],
};

const ROLE_LABEL_MAP: Record<UserRole, string> = {
  SUPER_ADMIN: "Principal",
  ADMIN: "Administrator",
  TEACHER: "Teacher",
  PARENT: "Parent",
  STUDENT: "Student",
};

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const user = useCurrentUser();
  const pathname = usePathname();

  if (!user) return null;

  const baseNavItems = NAV_ITEMS[user.role] || [];
  const navItems = process.env.NODE_ENV === "development"
    ? [...baseNavItems, { label: "Design System", href: "/showcase", icon: Paintbrush }]
    : baseNavItems;

  const roleName = ROLE_LABEL_MAP[user.role];

  return (
    <aside
      className={cn(
        "relative z-40 flex h-screen shrink-0 flex-col transition-all duration-300",
        "bg-[var(--primary)] text-white shadow-[var(--shadow-lg)]",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Top Section / Logo Area */}
      <div className="flex h-16 shrink-0 items-center border-b border-white/10 px-4">
        <div className="shrink-0">
          <FalconEagleLogo size={collapsed ? 36 : 48} />
        </div>
        {!collapsed && (
          <span
            className="ml-3 truncate font-bold text-lg font-[var(--font-display)]"
          >
            Falcon School
          </span>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 font-[var(--font-body)]">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "group relative flex items-center rounded-lg px-3 py-2.5 transition-colors",
                    isActive
                      ? "bg-[var(--gold)]/20 text-[var(--gold)] font-medium"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  )}
                >
                  {/* Collapsed dot for active state */}
                  {collapsed && isActive && (
                    <div className="absolute left-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[var(--gold)]" />
                  )}

                  <Icon
                    className={cn(
                      "h-5 w-5 shrink-0 transition-colors",
                      isActive
                        ? "text-[var(--gold)]"
                        : "text-white/70 group-hover:text-white"
                    )}
                  />

                  {!collapsed && (
                    <span className="ml-3 truncate text-sm">
                      {item.label}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Section (Expanded Only) */}
      {!collapsed && (
        <div className="shrink-0 border-t border-white/10 p-4 font-[var(--font-body)]">
          <p className="text-xs text-white/50 mb-0.5">Signed in as</p>
          <p className="truncate text-sm font-medium">{roleName}</p>
        </div>
      )}

      {/* Collapse Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-5 flex h-6 w-6 items-center justify-center rounded-[var(--radius-pill)] border border-[var(--border)] bg-[var(--primary)] text-white hover:bg-[var(--primary-light)] focus:outline-none transition-colors"
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>
    </aside>
  );
}
