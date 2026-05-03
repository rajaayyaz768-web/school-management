"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import MobileBottomNav from "./MobileBottomNav";

export interface MobilePrincipalLayoutProps {
  children: ReactNode;
}

export function MobilePrincipalLayout({ children }: MobilePrincipalLayoutProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg)]">
      {/* Sidebar — desktop only */}
      <div className="hidden md:block">
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
        />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden relative">
        {/* Top Bar (Visible on all devices so mobile gets hamburger & profile) */}
        <TopBar onMobileMenuToggle={() => setMobileSidebarOpen(true)} />

        {/* Content Area - pb-24 accounts for bottom nav on mobile */}
        <main className="flex-1 overflow-y-auto pb-24 md:pb-6 md:p-6 bg-[var(--bg)]">
          {children}
        </main>

        {/* Mobile Bottom Navigation (Visible only on mobile) */}
        <MobileBottomNav />
      </div>
    </div>
  );
}

export default MobilePrincipalLayout;
