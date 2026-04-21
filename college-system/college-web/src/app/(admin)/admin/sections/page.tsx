'use client';

import { useState } from 'react';
import { useRole } from '@/store/authStore';
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

  const { data: sections = [], isLoading, isError, refetch } = useSections();
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
        ) : sections.length === 0 ? (
          <EmptyState
            title="No sections found"
            description="Add your first section to organize classrooms natively."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sections.map((section) => (
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
