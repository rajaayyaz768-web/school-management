"use client";

import { Bell } from "lucide-react";
import { usePathname } from "next/navigation";

const PAGE_TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  "live-view": "Live Timetable",
  "teachers-live": "Teachers Live",
  staff: "Staff",
  students: "Students",
  admins: "Admin Management",
  programs: "Programs",
  "section-assignment": "Section Assignments",
  promotion: "Promotion",
  hierarchy: "Hierarchy",
  reports: "Reports",
  settings: "Settings",
  chat: "Chat",
  announcements: "Announcements",
  campus: "Campus",
  subjects: "Subjects",
  sections: "Sections",
  timetable: "Timetable",
  "campus-management": "Campus Management",
  parents: "Parents",
};

export default function MobileTopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();

  const getTitle = () => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length < 2) return "Dashboard";
    // Check for nested settings pages
    if (segments[1] === "settings" && segments[2]) {
      if (segments[2] === "backups") return "System Backups";
      if (segments[2] === "account") return "Account Settings";
      return "Settings";
    }
    return PAGE_TITLES[segments[1]] || segments[1].charAt(0).toUpperCase() + segments[1].slice(1).replace(/-/g, " ");
  };

  return (
    <header className="md:hidden sticky top-0 z-40 bg-[var(--bg)]/95 backdrop-blur-md border-b border-[var(--border)] px-4 h-14 flex items-center justify-between">
      <h1 className="text-lg font-bold text-[var(--text)] tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
        {getTitle()}
      </h1>
      <button className="p-2 -mr-2 relative rounded-full active:bg-white/5 transition-colors">
        <Bell className="w-5 h-5 text-[var(--text-muted)]" />
        <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 border-2 border-[var(--bg)] rounded-full" />
      </button>
    </header>
  );
}
