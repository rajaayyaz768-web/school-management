"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { MobileBottomNav } from "./MobileBottomNav";

export interface MainLayoutProps {
  children: ReactNode;
  title?: string;
}

export function MainLayout({ children, title }: MainLayoutProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg)]">
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />
      <div className="flex-1 block md:flex md:flex-col overflow-y-auto md:overflow-hidden relative bg-[var(--bg)]">
        <TopBar
          title={title}
          onMobileMenuToggle={() => setMobileSidebarOpen(o => !o)}
        />
        <main className="block md:flex-1 overflow-visible md:overflow-y-auto min-h-0 p-4 sm:p-6 pb-24 md:pb-6">
          {children}
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}

export default MainLayout;
