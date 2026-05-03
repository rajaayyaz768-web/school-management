'use client';

import { ArrowLeft } from 'lucide-react';
import SectionAssignmentPage from '@/app/(admin)/admin/section-assignment/page';

export default function PrincipalSectionAssignmentPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <header className="sticky top-0 z-40 bg-[var(--bg)]/95 backdrop-blur-md border-b border-[var(--border)] px-4 h-14 flex items-center gap-3 md:hidden">
        <h1 className="font-bold text-lg text-[var(--text)]" style={{ fontFamily: 'var(--font-display)' }}>Section Assignment</h1>
      </header>
      <div className="p-4 md:p-6">
        <SectionAssignmentPage />
      </div>
    </div>
  );
}
