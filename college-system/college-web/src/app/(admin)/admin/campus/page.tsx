'use client';

import { useState } from 'react';
import { useRole, useCurrentUser } from '@/store/authStore';
import { useCampusStore } from '@/store/campusStore';
import { useCampuses, useToggleCampusStatus } from '@/features/campus/hooks/useCampus';
import { Campus } from '@/features/campus/types/campus.types';
import { CampusForm } from '@/features/campus/components/CampusForm';
import { CampusCard } from '@/features/campus/components/CampusCard';
import PageHeader from '@/components/layout/PageHeader';
import {
  Button,
  Modal,
  ConfirmDialog,
  Skeleton,
  ErrorState,
  EmptyState,
} from '@/components/ui';

export default function CampusPage() {
  const role = useRole();
  const user = useCurrentUser();
  const activeCampusId = useCampusStore((s) => s.activeCampusId);
  const { data: campuses = [], isLoading, isError, refetch } = useCampuses();

  const resolvedCampusId =
    role === 'ADMIN' ? user?.campusId : activeCampusId;

  const pageTitle =
    campuses.find((c) => c.id === resolvedCampusId)?.name ?? 'Campus Management';
  const toggleMutation = useToggleCampusStatus();

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCampus, setEditingCampus] = useState<Campus | null>(null);
  
  // Toggle states
  const [campusToToggle, setCampusToToggle] = useState<Campus | null>(null);

  const handleToggleConfirm = () => {
    if (campusToToggle) {
      toggleMutation.mutate(campusToToggle.id, {
        onSuccess: () => setCampusToToggle(null),
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <PageHeader
        title={pageTitle}
        breadcrumb={[
          { label: 'Home', href: '/' },
          { label: pageTitle }
        ]}
        actions={
          role === 'SUPER_ADMIN' ? (
            <Button variant="gold" onClick={() => setIsAddModalOpen(true)}>
              Add Campus
            </Button>
          ) : undefined
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton variant="card" />
          <Skeleton variant="card" />
        </div>
      ) : isError ? (
        <ErrorState
          action={{ label: 'Retry', onClick: () => refetch() }}
        />
      ) : campuses.length === 0 ? (
        <EmptyState
          title="No campuses added yet"
          description="Click the Add Campus button to create a new campus."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {campuses.map((campus) => (
            <CampusCard
              key={campus.id}
              campus={campus}
              onEdit={(c) => setEditingCampus(c)}
              onToggle={(id) => {
                const c = campuses.find((x) => x.id === id);
                if (c) setCampusToToggle(c);
              }}
            />
          ))}
        </div>
      )}

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Campus"
        size="md"
      >
        <CampusForm
          onSuccess={() => setIsAddModalOpen(false)}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingCampus}
        onClose={() => setEditingCampus(null)}
        title="Edit Campus"
        size="md"
      >
        <CampusForm
          campus={editingCampus || undefined}
          onSuccess={() => setEditingCampus(null)}
          onCancel={() => setEditingCampus(null)}
        />
      </Modal>

      {/* Toggle Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!campusToToggle}
        onClose={() => setCampusToToggle(null)}
        onConfirm={handleToggleConfirm}
        title={campusToToggle?.is_active ? 'Deactivate Campus' : 'Activate Campus'}
        message="Are you sure you want to change the status of this campus?"
        confirmText={campusToToggle?.is_active ? 'Deactivate' : 'Activate'}
        variant={campusToToggle?.is_active ? 'danger' : 'warning'}
        loading={toggleMutation.isPending}
      />
    </div>
  );
}
