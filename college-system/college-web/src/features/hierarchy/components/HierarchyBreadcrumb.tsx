'use client';

import { Campus } from '@/features/campus/types/campus.types';
import { Program } from '@/features/programs/types/programs.types';
import { Section } from '@/features/sections/types/sections.types';
import { Breadcrumb } from '@/components/layout';

interface HierarchyBreadcrumbProps {
  selectedCampus: Campus | null;
  selectedProgram: Program | null;
  selectedGrade: { id: string; name: string } | null;
  selectedSection: Section | null;
  onCampusClick: () => void;
  onProgramClick: () => void;
  onGradeClick: () => void;
  onSectionClick: () => void;
}

export function HierarchyBreadcrumb({
  selectedCampus,
  selectedProgram,
  selectedGrade,
  selectedSection,
  onCampusClick,
  onProgramClick,
  onGradeClick,
  onSectionClick,
}: HierarchyBreadcrumbProps) {
  const items = [];

  // Always show root
  items.push({
    label: 'All Campuses',
    href: '#',
    onClick: (e: React.MouseEvent) => {
      e.preventDefault();
      onCampusClick();
    },
  });

  if (selectedCampus) {
    items.push({
      label: selectedCampus.name,
      href: '#',
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        onProgramClick(); // resets level below campus natively
      },
    });
  }

  if (selectedProgram) {
    items.push({
      label: selectedProgram.name,
      href: '#',
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        onGradeClick(); // resets level below program natively
      },
    });
  }

  if (selectedGrade) {
    items.push({
      label: selectedGrade.name,
      href: '#',
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        onSectionClick(); // resets level below grade natively
      },
    });
  }

  if (selectedSection) {
    items.push({
      label: `Section ${selectedSection.name}`,
    });
  }

  return (
    <div className="bg-[var(--surface)] px-4 py-3 rounded-xl border border-[var(--border)] shadow-sm mb-6">
      <Breadcrumb items={items} />
    </div>
  );
}
