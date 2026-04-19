'use client';

import { useState } from 'react';
import { useRole } from '@/store/authStore';
import { usePrograms, useToggleProgramStatus } from '@/features/programs/hooks/usePrograms';
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
} from '@/components/ui';

interface ProgramsPageProps {
  campusId?: string
  groupByCampus?: boolean
  navigation?: React.ReactNode
}

export function ProgramsPage({ campusId, groupByCampus = false, navigation }: ProgramsPageProps) {
  const role = useRole();
  const isAdminOrSuper = role === 'SUPER_ADMIN' || role === 'ADMIN';

  const { data: programs = [], isLoading, isError, refetch } = usePrograms(campusId || undefined);
  const toggleMutation = useToggleProgramStatus();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [programToToggle, setProgramToToggle] = useState<Program | null>(null);

  const handleToggleConfirm = () => {
    if (programToToggle) {
      toggleMutation.mutate(programToToggle.id, {
        onSuccess: () => setProgramToToggle(null),
      });
    }
  };

  const renderGrid = (list: Program[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {list.map((program) => (
        <ProgramCard
          key={program.id}
          program={program}
          onEdit={(p) => setEditingProgram(p)}
          onToggle={(id) => {
            const p = list.find((x) => x.id === id);
            if (p) setProgramToToggle(p);
          }}
        />
      ))}
    </div>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton variant="card" />
          <Skeleton variant="card" />
          <Skeleton variant="card" />
        </div>
      );
    }
    if (isError) {
      return <ErrorState action={{ label: 'Retry', onClick: () => refetch() }} />;
    }
    if (programs.length === 0) {
      return (
        <EmptyState
          title="No programs added yet"
          description="Add your first program to start managing academic structures."
        />
      );
    }
    if (groupByCampus) {
      const grouped = programs.reduce<Record<string, Program[]>>((acc, p) => {
        const key = p.campus?.name ?? 'Unknown Campus';
        if (!acc[key]) acc[key] = [];
        acc[key].push(p);
        return acc;
      }, {});
      return (
        <div className="space-y-8">
          {Object.entries(grouped).map(([campusName, list]) => (
            <div key={campusName}>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-4">
                {campusName}
              </p>
              {renderGrid(list)}
            </div>
          ))}
        </div>
      );
    }
    return renderGrid(programs);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <PageHeader
        title="Programs Management"
        breadcrumb={[
          { label: 'Home', href: '/' },
          { label: 'Programs' },
        ]}
        actions={
          isAdminOrSuper ? (
            <Button variant="gold" onClick={() => setIsAddModalOpen(true)}>
              Add Program
            </Button>
          ) : undefined
        }
      />

      {navigation}

      <div className="mt-8">{renderContent()}</div>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Program" size="md">
        <ProgramForm onSuccess={() => setIsAddModalOpen(false)} onCancel={() => setIsAddModalOpen(false)} />
      </Modal>

      <Modal isOpen={!!editingProgram} onClose={() => setEditingProgram(null)} title="Edit Program" size="md">
        <ProgramForm
          program={editingProgram || undefined}
          onSuccess={() => setEditingProgram(null)}
          onCancel={() => setEditingProgram(null)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!programToToggle}
        onClose={() => setProgramToToggle(null)}
        onConfirm={handleToggleConfirm}
        title={programToToggle?.is_active ? 'Deactivate Program' : 'Activate Program'}
        message={`Are you sure you want to ${programToToggle?.is_active ? 'deactivate' : 'activate'} ${programToToggle?.name}?`}
        confirmText={programToToggle?.is_active ? 'Deactivate' : 'Activate'}
        variant={programToToggle?.is_active ? 'danger' : 'warning'}
        loading={toggleMutation.isPending}
      />
    </div>
  );
}
