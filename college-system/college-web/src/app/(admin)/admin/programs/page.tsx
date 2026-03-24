'use client';

import { useState } from 'react';
import { useRole } from '@/store/authStore';
import { usePrograms, useToggleProgramStatus } from '@/features/programs/hooks/usePrograms';
import { useCampuses } from '@/features/campus/hooks/useCampus';
import { Program } from '@/features/programs/types/programs.types';
import { ProgramForm } from '@/features/programs/components/ProgramForm';
import { ProgramCard } from '@/features/programs/components/ProgramCard';
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

export default function ProgramsPage() {
  const role = useRole();
  const isAdminOrSuper = role === 'SUPER_ADMIN' || role === 'ADMIN';

  const [selectedCampus, setSelectedCampus] = useState<string>('');
  
  const { data: campuses = [] } = useCampuses();
  const campusOptions = [
    { label: 'All Campuses', value: '' },
    ...campuses.map(c => ({ label: c.name, value: c.id }))
  ];

  const { data: programs = [], isLoading, isError, refetch } = usePrograms(
    selectedCampus || undefined
  );
  const toggleMutation = useToggleProgramStatus();

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  
  // Toggle states
  const [programToToggle, setProgramToToggle] = useState<Program | null>(null);

  const handleToggleConfirm = () => {
    if (programToToggle) {
      toggleMutation.mutate(programToToggle.id, {
        onSuccess: () => setProgramToToggle(null),
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <PageHeader
        title="Programs Management"
        breadcrumb={[
          { label: 'Home', href: '/' },
          { label: 'Programs' }
        ]}
        actions={
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
            <div className="w-[200px]">
              <Select
                options={campusOptions}
                value={selectedCampus}
                onChange={(e) => setSelectedCampus(e.target.value)}
              />
            </div>
            {isAdminOrSuper && (
              <Button variant="gold" onClick={() => setIsAddModalOpen(true)}>
                Add Program
              </Button>
            )}
          </div>
        }
      />

      <div className="mt-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton variant="card" />
            <Skeleton variant="card" />
            <Skeleton variant="card" />
          </div>
        ) : isError ? (
          <ErrorState
            action={{ label: 'Retry', onClick: () => refetch() }}
          />
        ) : programs.length === 0 ? (
          <EmptyState
            title="No programs added yet"
            description="Add your first program to start managing academic structures."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program) => (
              <ProgramCard
                key={program.id}
                program={program}
                onEdit={(p) => setEditingProgram(p)}
                onToggle={(id) => {
                  const p = programs.find((x) => x.id === id);
                  if (p) setProgramToToggle(p);
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
        title="Add Program"
        size="md"
      >
        <ProgramForm
          onSuccess={() => setIsAddModalOpen(false)}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingProgram}
        onClose={() => setEditingProgram(null)}
        title="Edit Program"
        size="md"
      >
        <ProgramForm
          program={editingProgram || undefined}
          onSuccess={() => setEditingProgram(null)}
          onCancel={() => setEditingProgram(null)}
        />
      </Modal>

      {/* Toggle Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!programToToggle}
        onClose={() => setProgramToToggle(null)}
        onConfirm={handleToggleConfirm}
        title={programToToggle?.is_active ? 'Deactivate Program' : 'Activate Program'}
        message={`Are you sure you want to ${
          programToToggle?.is_active ? 'deactivate' : 'activate'
        } ${programToToggle?.name}?`}
        confirmText={programToToggle?.is_active ? 'Deactivate' : 'Activate'}
        variant={programToToggle?.is_active ? 'danger' : 'warning'}
        loading={toggleMutation.isPending}
      />
    </div>
  );
}
