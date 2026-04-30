'use client';

import { useState, useMemo } from 'react';
import { useRole } from '@/store/authStore';
import { useCampusStore } from '@/store/campusStore';
import { useCampuses } from '@/features/campus/hooks/useCampus';
import { useSections, useToggleSectionStatus } from '@/features/sections/hooks/useSections';
import { Section } from '@/features/sections/types/sections.types';
import { SectionForm } from '@/features/sections/components/SectionForm';
import { SectionCard } from '@/features/sections/components/SectionCard';
import PageHeader from '@/components/layout/PageHeader';
import {
  Button,
  Modal,
  ConfirmDialog,
  Skeleton,
  ErrorState,
  EmptyState,
} from '@/components/ui';

export default function SectionsPage() {
  const role = useRole();
  const isAdminOrSuper = role === 'SUPER_ADMIN' || role === 'ADMIN';

  const { activeCampusId } = useCampusStore();
  const { data: campuses = [] } = useCampuses();

  // null = "All Campuses" explicitly; a string = specific campus filter
  const [filterCampusId, setFilterCampusId] = useState<string | null>(null);

  // ADMIN campus is enforced by backend middleware — never pass campusId for ADMIN
  // SUPER_ADMIN: use local filter if set, otherwise no filter (returns all campuses)
  const campusIdForApi = role === 'SUPER_ADMIN'
    ? (filterCampusId ?? undefined)
    : undefined;

  const { data: sections = [], isLoading, isError, refetch } = useSections(undefined, campusIdForApi);
  const toggleMutation = useToggleSectionStatus();

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [sectionToToggle, setSectionToToggle] = useState<Section | null>(null);

  const handleToggleConfirm = () => {
    if (sectionToToggle) {
      toggleMutation.mutate(sectionToToggle.id, {
        onSuccess: () => setSectionToToggle(null),
      });
    }
  };

  // Group sections by campus → program → grade for organised display
  const grouped = useMemo(() => {
    const byCampus: Record<string, {
      campusName: string;
      programs: Record<string, {
        programName: string;
        grades: Record<string, { gradeName: string; sections: Section[] }>;
      }>;
    }> = {};

    for (const s of sections) {
      const campusId = s.grade?.program?.campus?.id ?? 'unknown';
      const campusName = s.grade?.program?.campus?.name ?? 'Unknown Campus';
      const programId = s.grade?.program?.id ?? 'unknown';
      const programName = s.grade?.program?.name ?? 'Unknown Program';
      const gradeId = s.grade?.id ?? 'unknown';
      const gradeName = s.grade?.name ?? 'Unknown Grade';

      if (!byCampus[campusId]) byCampus[campusId] = { campusName, programs: {} };
      const cp = byCampus[campusId].programs;
      if (!cp[programId]) cp[programId] = { programName, grades: {} };
      const gp = cp[programId].grades;
      if (!gp[gradeId]) gp[gradeId] = { gradeName, sections: [] };
      gp[gradeId].sections.push(s);
    }

    return byCampus;
  }, [sections]);

  const campusEntries = Object.entries(grouped);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <PageHeader
        title="Sections Management"
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Sections' }]}
        actions={
          isAdminOrSuper && (
            <Button variant="gold" onClick={() => setIsAddModalOpen(true)}>
              Add Section
            </Button>
          )
        }
      />

      {/* ─── FILTERS ─────────────────────────────────────────────────────────── */}
      {role === 'SUPER_ADMIN' && campuses.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2 items-center">
          <span className="text-xs text-[var(--text-muted)] mr-1">Filter:</span>
          <button
            onClick={() => setFilterCampusId(null)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              filterCampusId === null
                ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                : 'bg-[var(--surface)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--primary)]'
            }`}
          >
            All Campuses
          </button>
          {campuses.map((c) => (
            <button
              key={c.id}
              onClick={() => setFilterCampusId(c.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                filterCampusId === c.id
                  ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                  : 'bg-[var(--surface)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--primary)]'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {/* ─── CONTENT ─────────────────────────────────────────────────────────── */}
      <div className="mt-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[0, 1, 2, 3].map((i) => <Skeleton key={i} variant="card" />)}
          </div>
        ) : isError ? (
          <ErrorState action={{ label: 'Retry', onClick: () => refetch() }} />
        ) : campusEntries.length === 0 ? (
          <EmptyState
            title="No sections found"
            description="Add your first section to get started."
          />
        ) : (
          <div className="space-y-10">
            {campusEntries.map(([campusId, { campusName, programs }]) => (
              <div key={campusId}>
                {/* Show campus heading only when viewing all campuses */}
                {filterCampusId === null && campusEntries.length > 1 && (
                  <h2 className="text-base font-semibold text-[var(--text)] mb-4 pb-2 border-b border-[var(--border)]">
                    {campusName}
                  </h2>
                )}

                <div className="space-y-8">
                  {Object.entries(programs).map(([programId, { programName, grades }]) => (
                    <div key={programId}>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
                        {programName}
                      </p>
                      <div className="space-y-6">
                        {Object.entries(grades)
                          .sort(([, a], [, b]) => a.gradeName.localeCompare(b.gradeName))
                          .map(([gradeId, { gradeName, sections: gradeSections }]) => (
                            <div key={gradeId}>
                              <p className="text-xs text-[var(--text-muted)] mb-2 pl-1">
                                {gradeName}
                                <span className="ml-2 text-[var(--text-muted)] opacity-60">
                                  ({gradeSections.length} section{gradeSections.length !== 1 ? 's' : ''})
                                </span>
                              </p>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {gradeSections.map((section) => (
                                  <SectionCard
                                    key={section.id}
                                    section={section}
                                    onEdit={(s) => setEditingSection(s)}
                                    onToggle={(id) => {
                                      const s = sections.find((x) => x.id === id);
                                      if (s) setSectionToToggle(s);
                                    }}
                                  />
                                ))}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Section" size="md">
        <SectionForm onSuccess={() => setIsAddModalOpen(false)} onCancel={() => setIsAddModalOpen(false)} />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editingSection} onClose={() => setEditingSection(null)} title="Edit Section" size="md">
        <SectionForm
          section={editingSection || undefined}
          onSuccess={() => setEditingSection(null)}
          onCancel={() => setEditingSection(null)}
        />
      </Modal>

      {/* Toggle Confirm */}
      <ConfirmDialog
        isOpen={!!sectionToToggle}
        onClose={() => setSectionToToggle(null)}
        onConfirm={handleToggleConfirm}
        title={sectionToToggle?.isActive ? 'Deactivate Section' : 'Activate Section'}
        message={`Are you sure you want to ${sectionToToggle?.isActive ? 'deactivate' : 'activate'} Section ${sectionToToggle?.name}?`}
        confirmText={sectionToToggle?.isActive ? 'Deactivate' : 'Activate'}
        variant={sectionToToggle?.isActive ? 'danger' : 'warning'}
        loading={toggleMutation.isPending}
      />
    </div>
  );
}
