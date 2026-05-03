"use client";

import { useState, useRef, useEffect } from "react";
import { useCurrentUser } from "@/store/authStore";
import { useLogout } from "@/features/auth/hooks/useAuth";
import { useCampusStore } from "@/store/campusStore";
import { useCampuses } from "@/features/campus/hooks/useCampus";
import { cn } from "@/lib/utils";
import { MessageSquare, Bell, ChevronDown, User, LogOut, Building2, Menu } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export interface TopBarProps {
  title?: string;
  onMobileMenuToggle?: () => void;
}

const ROLE_LABEL_MAP: Record<string, string> = {
  SUPER_ADMIN: "Principal",
  ADMIN: "Administrator",
  TEACHER: "Teacher",
  PARENT: "Parent",
  STUDENT: "Student",
};

// ── Campus picker (SUPER_ADMIN only) ─────────────────────────────────────────

function CampusPicker() {
  const { activeCampusId, setActiveCampusId } = useCampusStore()
  const { data: campuses } = useCampuses()

  return (
    <div className="flex items-center gap-1.5">
      <Building2 className="w-3.5 h-3.5 text-[var(--text-muted)]" />
      <select
        value={activeCampusId ?? ''}
        onChange={(e) => setActiveCampusId(e.target.value || null)}
        className="text-xs bg-transparent border border-[var(--border)] rounded-md px-2 py-1 text-[var(--text)] focus:outline-none focus:border-[var(--gold)] cursor-pointer hover:border-[var(--gold)]/50 transition-colors"
      >
        <option value="">All Campuses</option>
        {(campuses ?? []).map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
    </div>
  )
}

function AdminCampusBadge({ campusId }: { campusId: string | null }) {
  const { data: campuses } = useCampuses()
  const name = campuses?.find((c) => c.id === campusId)?.name
  if (!name) return null
  return (
    <>
      <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--gold)]/10 border border-[var(--gold)]/20">
        <Building2 className="w-3 h-3 text-[var(--gold)]" />
        <span className="text-xs font-medium text-[var(--gold)]">{name}</span>
      </div>
      <div className="mx-1 h-6 w-px bg-[var(--border)]" />
    </>
  )
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

  const getInitials = () => {
    if (user.fullName) {
      const words = user.fullName.split(" ").filter(Boolean);
      return words
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase();
    }
    return user.email.substring(0, 2).toUpperCase();
  };

  const showChat = user.role === "SUPER_ADMIN" || user.role === "TEACHER";

  return (
    <header className="relative z-[60] flex h-14 w-full shrink-0 flex-row items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-4 md:px-6">
      {/* LEFT SIDE */}
      <div className="flex items-center min-w-0 pr-2">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMobileMenuToggle}
          className="mr-2 md:hidden flex h-9 w-9 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text)] transition-colors cursor-pointer shrink-0"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        {title ? (
          <h1 className="font-display text-base md:text-xl font-bold text-[var(--primary)] truncate flex-1 min-w-0 sm:max-w-none">
            {title}
          </h1>
        ) : (
          <span className="font-display text-base md:text-xl font-bold text-[var(--primary)] truncate flex-1 min-w-0 sm:max-w-none">
            College Portal
          </span>
        )}
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* SUPER_ADMIN: global campus picker — hidden on mobile */}
        {user.role === 'SUPER_ADMIN' && (
          <div className="hidden md:flex items-center gap-1.5">
            <CampusPicker />
            <div className="mx-1 h-6 w-px bg-[var(--border)]" />
          </div>
        )}

        {/* ADMIN: read-only campus badge */}
        {user.role === 'ADMIN' && <AdminCampusBadge campusId={user.campusId} />}

        {/* Chat Button */}
        {showChat && (
          <Button
            variant="ghost"
            size="sm"
            className="h-10 w-10 p-0 rounded-full"
            icon={<MessageSquare className="h-5 w-5" />}
            aria-label="Messages"
          />
        )}

        {/* Notifications Button */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="h-10 w-10 p-0 rounded-full"
            icon={<Bell className="h-5 w-5" />}
            aria-label="Notifications"
          />
          {unreadCount > 0 && (
            <Badge
              variant="danger"
              size="sm"
              className="absolute -right-2 -top-1 flex h-5 min-w-[20px] items-center justify-center p-0.5 text-[10px]"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </div>

        {/* Dark / Light Mode Toggle */}
        <ThemeToggle />

        {/* Vertical Divider */}
        <div className="mx-0.5 sm:mx-1 md:mx-2 h-6 w-px bg-[var(--border)]" />

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center sm:gap-3 rounded-full hover:bg-[var(--bg-secondary)] p-1 sm:pr-3 transition-colors focus:outline-none cursor-pointer shrink-0"
          >
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[var(--primary)] text-[var(--gold)] shadow-sm shrink-0">
              {user.profilePhotoUrl ? (
                <img
                  src={user.profilePhotoUrl}
                  alt={user.fullName || "User Avatar"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-sm font-semibold tracking-wide">
                  {getInitials()}
                </span>
              )}
            </div>

            <div className="hidden flex-col items-start leading-none sm:flex">
              <span className="text-sm font-medium text-[var(--text)]">
                {user.fullName || user.email.split("@")[0]}
              </span>
              <span className="mt-1 text-xs text-[var(--text-muted)]">
                {ROLE_LABEL_MAP[user.role] || user.role}
              </span>
            </div>
            <ChevronDown className="hidden sm:block h-4 w-4 text-[var(--text-muted)]" />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-[min(90vw,14rem)] z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <Card padding="sm" className="shadow-[var(--shadow-lg)]">
                <div className="flex flex-col">
                  {/* Mobile Profile Info */}
                  <div className="mb-2 border-b border-[var(--border)] pb-2 px-2 sm:hidden">
                    <p className="truncate font-semibold text-[var(--text)]">
                      {user.fullName || user.email.split("@")[0]}
                    </p>
                    <p className="truncate text-xs text-[var(--text-muted)]">
                      {user.email}
                    </p>
                  </div>

                  {/* Options */}
                  <Button variant="ghost" size="sm" fullWidth className="justify-start gap-3 text-[var(--text-secondary)]">
                    <User className="h-4 w-4" />
                    My Profile
                  </Button>

                  <div className="my-1 border-t border-[var(--border)]" />

                  <Button
                    variant="ghost"
                    size="sm"
                    fullWidth
                    onClick={() => { setDropdownOpen(false); logout(); }}
                    className="justify-start gap-3 text-red-600 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default TopBar;
