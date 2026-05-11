"use client";

import { useState, useRef, useEffect } from "react";
import { useCurrentUser } from "@/store/authStore";
import { useLogout } from "@/features/auth/hooks/useAuth";
import { useCampusStore } from "@/store/campusStore";
import { useCampuses } from "@/features/campus/hooks/useCampus";
import { cn } from "@/lib/utils";
import { Bell, ChevronDown, User, LogOut, Building2, Menu, Search } from "lucide-react";

export interface TopBarProps {
  title?: string;
  onMobileMenuToggle?: () => void;
}

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: "Principal",
  ADMIN: "Administrator",
  TEACHER: "Teacher",
  PARENT: "Parent",
  STUDENT: "Student",
};

// Avatar background uses primary tint — always theme-aware
const AVATAR_OPACITY: Record<string, string> = {
  SUPER_ADMIN: "0.9",
  ADMIN:       "0.75",
  TEACHER:     "0.6",
  PARENT:      "0.5",
  STUDENT:     "0.4",
};

function CampusPicker() {
  const { activeCampusId, setActiveCampusId } = useCampusStore();
  const { data: campuses } = useCampuses();

  return (
    <div className="flex items-center gap-1.5">
      <Building2 className="w-3.5 h-3.5 text-[var(--slate-400)]" />
      <select
        value={activeCampusId ?? ""}
        onChange={e => setActiveCampusId(e.target.value || null)}
        className={cn(
          "text-[var(--font-size-base)] font-600 bg-transparent",
          "border border-[var(--slate-200)] rounded-[var(--radius-md)] px-2.5 py-[5px]",
          "text-[var(--slate-700)] outline-none cursor-pointer",
          "transition-all duration-[var(--dur-fast)]",
          "hover:border-[var(--slate-300)]",
          "focus:border-[var(--primary)] focus:shadow-[var(--shadow-focus)]"
        )}
      >
        <option value="">All Campuses</option>
        {(campuses ?? []).map(c => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
    </div>
  );
}

function AdminCampusBadge({ campusId }: { campusId: string | null }) {
  const { data: campuses } = useCampuses();
  const name = campuses?.find(c => c.id === campusId)?.name;
  if (!name) return null;
  return (
    <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-md)] bg-[var(--bg-tint)] border border-[var(--primary-light)]">
      <Building2 className="w-3 h-3 text-[var(--primary-dark)]" />
      <span className="text-[var(--font-size-sm)] font-700 text-[var(--primary-dark)]">{name}</span>
    </div>
  );
}

export function TopBar({ title, onMobileMenuToggle }: TopBarProps) {
  const user = useCurrentUser();
  const { mutate: logout } = useLogout();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const unreadCount = 3;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  const initials = user.fullName
    ? user.fullName.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase()
    : user.email.substring(0, 2).toUpperCase();

  return (
    <header
      className="relative z-[60] flex h-[64px] w-full shrink-0 items-center justify-between px-4 md:px-6"
      style={{
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {/* LEFT */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMobileMenuToggle}
          className="mr-1 md:hidden flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] text-[var(--slate-500)] hover:bg-[var(--slate-50)] hover:text-[var(--slate-900)] transition-colors"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <h1
          className="font-display font-800 truncate"
          style={{
            fontSize: "22px",
            letterSpacing: "-0.018em",
            color: "var(--slate-900)",
          }}
        >
          {title || "Portal"}
        </h1>
      </div>

      {/* CENTRE — search (md+) */}
      <div className="hidden md:flex flex-1 max-w-[320px] mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--slate-400)]" />
          <input
            type="search"
            placeholder="Search…"
            className={cn(
              "w-full pl-8 pr-3 py-[7px]",
              "font-body text-[var(--font-size-base)] font-500",
              "bg-[var(--slate-50)] border border-[var(--slate-200)] rounded-[var(--radius-md)]",
              "text-[var(--slate-900)] placeholder:text-[var(--slate-400)]",
              "outline-none transition-all duration-[var(--dur-fast)]",
              "focus:bg-[var(--bg)] focus:border-[var(--primary)]",
              "focus:shadow-[var(--shadow-focus)]"
            )}
          />
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* SUPER_ADMIN campus picker */}
        {user.role === "SUPER_ADMIN" && (
          <div className="hidden md:flex items-center gap-1.5">
            <CampusPicker />
            <div className="mx-1 h-5 w-px bg-[var(--slate-100)]" />
          </div>
        )}

        {/* ADMIN campus badge */}
        {user.role === "ADMIN" && (
          <>
            <AdminCampusBadge campusId={user.campusId} />
            <div className="mx-1 h-5 w-px bg-[var(--slate-100)]" />
          </>
        )}

        {/* Notifications */}
        <div className="relative">
          <button
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)]",
              "text-[var(--slate-500)] transition-colors duration-[var(--dur-fast)]",
              "hover:bg-[var(--slate-50)] hover:text-[var(--slate-900)]"
            )}
            aria-label="Notifications"
          >
            <Bell className="h-[18px] w-[18px]" />
          </button>
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--red-500)] text-white text-[var(--font-size-xs)] font-bold px-1">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </div>

        {/* Vertical divider */}
        <div className="mx-1 h-5 w-px bg-[var(--slate-100)]" />

        {/* Profile dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(o => !o)}
            className="flex items-center gap-2 rounded-[10px] p-1.5 pr-2.5 transition-colors duration-[var(--dur-fast)] hover:bg-[var(--slate-50)] focus:outline-none"
          >
            {user.profilePhotoUrl ? (
              <img
                src={user.profilePhotoUrl}
                alt={user.fullName ?? "Avatar"}
                className="h-7 w-7 rounded-full object-cover"
              />
            ) : (
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[var(--font-size-sm)] font-bold text-white"
                style={{ background: `var(--primary)`, opacity: AVATAR_OPACITY[user.role] ?? "0.8" }}
              >
                {initials}
              </div>
            )}
            <div className="hidden sm:flex flex-col items-start leading-none">
              <span className="text-[var(--font-size-base)] font-700 text-[var(--slate-900)]">
                {user.fullName || user.email.split("@")[0]}
              </span>
              <span className="mt-0.5 text-[var(--font-size-sm)] text-[var(--slate-500)]">
                {ROLE_LABEL[user.role] ?? user.role}
              </span>
            </div>
            <ChevronDown className="hidden sm:block h-3.5 w-3.5 text-[var(--slate-400)]" />
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div
              className="absolute right-0 mt-2 z-50 w-[min(90vw,200px)] rounded-[var(--radius-lg)] overflow-hidden"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                boxShadow: "var(--shadow-lg)",
              }}
            >
              {/* Profile header */}
              <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
                <p className="text-[var(--font-size-base)] font-700 text-[var(--slate-900)] truncate">
                  {user.fullName || user.email.split("@")[0]}
                </p>
                <p className="text-[var(--font-size-sm)] text-[var(--slate-500)] truncate mt-0.5">
                  {user.email}
                </p>
              </div>

              {/* Actions */}
              <div className="p-1.5 flex flex-col gap-0.5">
                <button className="flex items-center gap-2.5 w-full px-3 py-2 rounded-[8px] text-[var(--font-size-base)] font-600 text-[var(--slate-700)] hover:bg-[var(--slate-50)] transition-colors text-left">
                  <User className="h-3.5 w-3.5 text-[var(--slate-400)]" />
                  My profile
                </button>

                <div className="h-px bg-[var(--slate-100)] my-1" />

                <button
                  onClick={() => { setDropdownOpen(false); logout(); }}
                  className="flex items-center gap-2.5 w-full px-3 py-2 rounded-[8px] text-[var(--font-size-base)] font-600 text-[var(--red-700)] hover:bg-[var(--red-50)] transition-colors text-left"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default TopBar;
