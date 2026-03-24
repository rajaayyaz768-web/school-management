'use client';

import { useState } from 'react';
import { useRole } from '@/store/authStore';
import { useSections, useProgramGrades, useToggleSectionStatus } from '@/features/sections/hooks/useSections';
import { useCampuses } from '@/features/campus/hooks/useCampus';
import { usePrograms } from '@/features/programs/hooks/usePrograms';
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
  Select,
} from '@/components/ui';

export default function SectionsPage() {
  const role = useRole();
  const isAdminOrSuper = role === 'SUPER_ADMIN' || role === 'ADMIN';

  // Cascading filters logic
  const [selectedCampus, setSelectedCampus] = useState<string>('');
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [selectedGrade, setSelectedGrade] = useState<string>('');

  const handleCampusFilterChange = (val: string) => {
    setSelectedCampus(val);
    setSelectedProgram('');
    setSelectedGrade('');
  };

  const handleProgramFilterChange = (val: string) => {
    setSelectedProgram(val);
    setSelectedGrade('');
  };

  const { data: campuses = [] } = useCampuses();
  const { data: programs = [] } = usePrograms(selectedCampus || undefined);
  const { data: grades = [] } = useProgramGrades(selectedProgram || undefined);

  // We only fetch sections based on gradeId natively for performance, but if null we can fetch all and filter client-side 
  // or pass queries natively over GET parameters downstream
  const { data: sections = [], isLoading, isError, refetch } = useSections(selectedGrade || undefined);
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

  // Filter sections purely locally if grade filter is empty but program or campus are selected
  const filteredSections = sections.filter((sec) => {
    if (selectedGrade) {
      return sec.gradeId === selectedGrade;
    }
    if (selectedProgram) {
      return sec.grade?.program?.id === selectedProgram;
    }
    if (selectedCampus) {
      return sec.grade?.program?.campus?.id === selectedCampus;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <PageHeader
        title="Sections Management"
        breadcrumb={[
          { label: 'Home', href: '/' },
          { label: 'Sections' }
        ]}
        actions={
          <div className="flex items-center gap-4">
            {isAdminOrSuper && (
              <Button variant="gold" onClick={() => setIsAddModalOpen(true)}>
                Add Section
              </Button>
            )}
          </div>
        }
      />

      {/* Cascading Filters Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Select
          options={[
            { label: 'All Campuses', value: '' },
            ...campuses.map((c) => ({ label: c.name, value: c.id }))
          ]}
          value={selectedCampus}
          onChange={(e) => handleCampusFilterChange(e.target.value)}
          placeholder="Filter by Campus"
        />
        
        <Select
          options={[
            { label: 'All Programs', value: '' },
            ...programs.map((p) => ({ label: p.name, value: p.id }))
          ]}
          value={selectedProgram}
          onChange={(e) => handleProgramFilterChange(e.target.value)}
          disabled={!selectedCampus}
          placeholder={!selectedCampus ? 'Select campus first' : 'Filter by Program'}
        />

        <Select
          options={[
            { label: 'All Grades', value: '' },
            ...grades.map((g) => ({ label: g.name, value: g.id }))
          ]}
          value={selectedGrade}
          onChange={(e) => setSelectedGrade(e.target.value)}
          disabled={!selectedProgram}
          placeholder={!selectedProgram ? 'Select program first' : 'Filter by Grade'}
        />
      </div>

      <div className="mt-4">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <Skeleton variant="card" />
            <Skeleton variant="card" />
            <Skeleton variant="card" />
            <Skeleton variant="card" />
          </div>
        ) : isError ? (
          <ErrorState action={{ label: 'Retry', onClick: () => refetch() }} />
        ) : filteredSections.length === 0 ? (
          <EmptyState
            title="No sections found"
            description="Add your first section to organize classrooms natively."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSections.map((section) => (
              <SectionCard
                key={section.id}
                section={section}
                onEdit={(s) => setEditingSection(s)}
                onToggle={(id) => {
                  const s = filteredSections.find((x) => x.id === id);
                  if (s) setSectionToToggle(s);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Section"
        size="md"
      >
        <SectionForm
          onSuccess={() => setIsAddModalOpen(false)}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingSection}
        onClose={() => setEditingSection(null)}
        title="Edit Section"
        size="md"
      >
        <SectionForm
          section={editingSection || undefined}
          onSuccess={() => setEditingSection(null)}
          onCancel={() => setEditingSection(null)}
        />
      </Modal>

      {/* Toggle Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!sectionToToggle}
        onClose={() => setSectionToToggle(null)}
        onConfirm={handleToggleConfirm}
        title={sectionToToggle?.isActive ? 'Deactivate Section' : 'Activate Section'}
        message={`Are you sure you want to ${
          sectionToToggle?.isActive ? 'deactivate' : 'activate'
        } Section ${sectionToToggle?.name}?`}
        confirmText={sectionToToggle?.isActive ? 'Deactivate' : 'Activate'}
        variant={sectionToToggle?.isActive ? 'danger' : 'warning'}
        loading={toggleMutation.isPending}
      />
    </div>
  );
}
