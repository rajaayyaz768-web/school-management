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
      {/* Sidebar (handles its own mobile visibility via props/internal state) */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <div className="flex-1 block md:flex md:flex-col overflow-y-auto md:overflow-hidden relative bg-[var(--bg)]">
        {/* Top Bar (Visible on all devices so mobile gets hamburger & profile) */}
        <TopBar onMobileMenuToggle={() => setMobileSidebarOpen(true)} />

        {/* Content Area - pb-24 accounts for bottom nav on mobile */}
        <main className="block md:flex-1 overflow-visible md:overflow-y-auto min-h-0 pb-24 md:pb-6 md:p-6">
          {children}
        </main>

        {/* Mobile Bottom Navigation (Visible only on mobile) */}
        <MobileBottomNav />
      </div>
    </div>
  );
}

export default MobilePrincipalLayout;
