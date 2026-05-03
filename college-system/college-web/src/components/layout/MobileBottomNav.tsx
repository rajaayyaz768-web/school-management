"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useCurrentUser } from "@/store/authStore";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, CalendarCheck, BookOpen, FileText,
  Clock, MessageSquare, BookMarked, MoreHorizontal, X,
  Home, Wallet, Megaphone, ClipboardList, Radio, UserCheck,
  GraduationCap, Settings,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const BOTTOM_NAV: Record<string, { primary: NavItem[]; more: NavItem[] }> = {
  TEACHER: {
    primary: [
      { label: "Home",    href: "/teacher/dashboard",          icon: Home },
      { label: "Classes", href: "/teacher/my-classes",         icon: Users },
      { label: "Attend",  href: "/teacher/attendance/history", icon: CalendarCheck },
      { label: "Exams",   href: "/teacher/exams",              icon: FileText },
    ],
    more: [
      { label: "My Teaching",   href: "/teacher/teaching",  icon: BookMarked },
      { label: "Enter Results", href: "/teacher/results",   icon: BookOpen },
      { label: "Timetable",     href: "/teacher/timetable", icon: Clock },
      { label: "Chat",          href: "/teacher/chat",      icon: MessageSquare },
    ],
  },
  SUPER_ADMIN: {
    primary: [
      { label: "Dashboard", href: "/principal/dashboard",     icon: LayoutDashboard },
      { label: "Live",      href: "/principal/live-view",     icon: Radio },
      { label: "Teachers",  href: "/principal/teachers-live", icon: UserCheck },
      { label: "Students",  href: "/principal/students",      icon: GraduationCap },
    ],
    more: [
      { label: "Staff",    href: "/principal/staff",            icon: Users },
      { label: "Programs", href: "/principal/programs",         icon: BookOpen },
      { label: "Exams",    href: "/exams",                      icon: FileText },
      { label: "Reports",  href: "/reports",                    icon: ClipboardList },
      { label: "Settings", href: "/principal/settings/backups", icon: Settings },
    ],
  },
  ADMIN: {
    primary: [
      { label: "Dashboard", href: "/admin/dashboard",     icon: LayoutDashboard },
      { label: "Students",  href: "/admin/students",      icon: GraduationCap },
      { label: "Attend",    href: "/attendance/students", icon: CalendarCheck },
      { label: "Fees",      href: "/fees",                icon: Wallet },
    ],
    more: [
      { label: "Staff",    href: "/admin/staff",    icon: Users },
      { label: "Exams",    href: "/exams",           icon: FileText },
      { label: "Results",  href: "/admin/results",  icon: BookOpen },
      { label: "Reports",  href: "/reports",         icon: ClipboardList },
      { label: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
  PARENT: {
    primary: [
      { label: "Home",       href: "/parent/dashboard",  icon: Home },
      { label: "Attendance", href: "/parent/attendance", icon: CalendarCheck },
      { label: "Fees",       href: "/parent/fees",       icon: Wallet },
      { label: "Exams",      href: "/parent/exams",      icon: FileText },
    ],
    more: [
      { label: "Results",       href: "/parent/results",       icon: BookOpen },
      { label: "Announcements", href: "/parent/announcements", icon: Megaphone },
    ],
  },
  STUDENT: {
    primary: [
      { label: "Home",       href: "/student/dashboard",  icon: Home },
      { label: "Timetable",  href: "/student/timetable",  icon: Clock },
      { label: "Attendance", href: "/student/attendance", icon: CalendarCheck },
      { label: "Exams",      href: "/student/exams",      icon: FileText },
    ],
    more: [
      { label: "Results", href: "/student/results",       icon: BookOpen },
      { label: "Notices", href: "/student/announcements", icon: Megaphone },
    ],
  },
};

export function MobileBottomNav() {
  const pathname = usePathname();
  const user = useCurrentUser();
  const [moreOpen, setMoreOpen] = useState(false);

  const role = user?.role ?? "TEACHER";
  const config = BOTTOM_NAV[role];
  if (!config) return null;

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const anyMoreActive = config.more.some((item) => isActive(item.href));

  return (
    <>
      <AnimatePresence>
        {moreOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 md:hidden"
              onClick={() => setMoreOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed bottom-20 left-0 right-0 z-50 mx-4 mb-1 rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-4 md:hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">More</span>
                <button
                  onClick={() => setMoreOpen(false)}
                  className="w-7 h-7 rounded-full bg-[var(--border)] flex items-center justify-center text-[var(--text-muted)]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {config.more.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMoreOpen(false)}
                      className={cn(
                        "flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl transition-all active:scale-95",
                        active
                          ? "text-[var(--primary)] bg-[var(--primary)]/10"
                          : "text-[var(--text-muted)] bg-[var(--bg)] hover:text-[var(--text)]"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-[10px] font-semibold text-center leading-tight">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center px-2 h-20 bg-[var(--surface)]/95 backdrop-blur-md border-t border-[var(--border)]">
        {config.primary.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 min-w-[56px] min-h-[48px] px-2 rounded-xl transition-all duration-150 active:scale-90",
                active
                  ? "text-[var(--primary)] bg-[var(--primary)]/10"
                  : "text-[var(--text-muted)] hover:text-[var(--text)]"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-semibold tracking-wide leading-none">{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={() => setMoreOpen((o) => !o)}
          className={cn(
            "flex flex-col items-center justify-center gap-1 min-w-[56px] min-h-[48px] px-2 rounded-xl transition-all duration-150 active:scale-90",
            moreOpen || anyMoreActive
              ? "text-[var(--primary)] bg-[var(--primary)]/10"
              : "text-[var(--text-muted)] hover:text-[var(--text)]"
          )}
        >
          <MoreHorizontal className="w-5 h-5" />
          <span className="text-[10px] font-semibold tracking-wide leading-none">More</span>
        </button>
      </nav>
    </>
  );
}

export default MobileBottomNav;
