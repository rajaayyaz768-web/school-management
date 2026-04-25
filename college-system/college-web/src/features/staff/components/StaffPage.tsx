'use client';

import { useState } from 'react';
import { useRole } from '@/store/authStore';
import { useInfiniteStaff, useToggleStaffStatus } from '@/features/staff/hooks/useStaff';
import { Staff } from '@/features/staff/types/staff.types';
import { StaffTable } from '@/features/staff/components/StaffTable';
import { StaffProfileDrawer } from '@/features/staff/components/StaffProfileDrawer';
import { StaffForm } from '@/features/staff/components/StaffForm';
import { useToast } from '@/hooks/useToast';

import PageHeader from '@/components/layout/PageHeader';
import {
  Button,
  ConfirmDialog,
  Select,
  SearchInput,
  Modal,
} from '@/components/ui';
import { InfiniteScrollSentinel } from '@/components/ui/InfiniteScrollSentinel';

interface StaffPageProps {
  campusId?: string
  navigation?: React.ReactNode
}

export function StaffPage({ campusId, navigation }: StaffPageProps) {
  const role = useRole();
  const isAdminOrSuper = role === 'SUPER_ADMIN' || role === 'ADMIN';

  const [selectedEmployment, setSelectedEmployment] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Combine filters for React Query
  const apiFilters = {
    campusId: campusId || undefined,
    employmentType: selectedEmployment !== 'ALL' ? selectedEmployment : undefined,
    isActive: selectedStatus !== 'ALL' ? (selectedStatus === 'ACTIVE') : undefined,
  };

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } = useInfiniteStaff(apiFilters);
  const staffList = data?.pages.flatMap((p) => p.data) ?? [];
  const toggleMutation = useToggleStaffStatus();

  // Drawers and Modals
  const [drawerStaffId, setDrawerStaffId] = useState<string | null>(null);
  const [staffToToggle, setStaffToToggle] = useState<Staff | null>(null);

  // Derive active toggle status from user sub-record
  const isToggleStatusActive = staffToToggle?.user?.isActive ?? false;

  // Form modaling state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  // Password sharing state
  const [showTempPasswordModal, setShowTempPasswordModal] = useState(false);
  const [tempPassword, setTempPassword] = useState('');
  const { success } = useToast();

  const handleToggleConfirm = () => {
    if (staffToToggle) {
      toggleMutation.mutate(staffToToggle.id, {
        onSuccess: () => setStaffToToggle(null),
      });
    }
  };

  const handleAddStaffClick = () => {
    setEditingStaff(null);
    setIsFormModalOpen(true);
  };

  const handleEditStaffClick = (staff: Staff) => {
    setEditingStaff(staff);
    setIsFormModalOpen(true);
  };

  const handleFormSuccess = (pw?: string) => {
    setIsFormModalOpen(false);
    if (pw) {
      setTempPassword(pw);
      setShowTempPasswordModal(true);
    }
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(tempPassword);
    success('Password copied to clipboard');
  };

  const filteredClientList = staffList.filter((s) => {
    if (!searchQuery) return true;
    const lowerQuery = searchQuery.toLowerCase();
    const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
    return fullName.includes(lowerQuery) || s.staffCode.toLowerCase().includes(lowerQuery);
  });

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <PageHeader
        title="Staff Management"
        breadcrumb={[
          { label: 'Home', href: '/' },
          { label: 'Staff' }
        ]}
        actions={
          <div className="flex items-center gap-4">
            {isAdminOrSuper && (
              <Button variant="gold" onClick={handleAddStaffClick}>
                Add Staff
              </Button>
            )}
          </div>
        }
      />

      {navigation}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 bg-[var(--surface-container-low)] p-4 rounded-lg items-end">
        <Select
          label="Employment Type"
          options={[
            { label: 'All', value: 'ALL' },
            { label: 'Permanent', value: 'PERMANENT' },
            { label: 'Contract', value: 'CONTRACT' },
            { label: 'Visiting', value: 'VISITING' },
          ]}
          value={selectedEmployment}
          onChange={(e) => setSelectedEmployment(e.target.value)}
        />
        <Select
          label="Status"
          options={[
            { label: 'All', value: 'ALL' },
            { label: 'Active', value: 'ACTIVE' },
            { label: 'Inactive', value: 'INACTIVE' },
          ]}
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        />
        <div className="w-full">
          <SearchInput 
            placeholder="Search by name or code..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>
      </div>

      <StaffTable
        staffList={filteredClientList}
        isLoading={isLoading}
        onView={(staff) => setDrawerStaffId(staff.id)}
        onEdit={handleEditStaffClick}
        onToggle={(id) => {
          const s = staffList.find(x => x.id === id);
          if (s) setStaffToToggle(s);
        }}
      />

      <InfiniteScrollSentinel onVisible={fetchNextPage} hasMore={!!hasNextPage} isFetching={isFetchingNextPage} />

      <StaffProfileDrawer
        staffId={drawerStaffId}
        isOpen={!!drawerStaffId}
        onClose={() => setDrawerStaffId(null)}
        onEdit={handleEditStaffClick}
      />

      <ConfirmDialog
        isOpen={!!staffToToggle}
        onClose={() => setStaffToToggle(null)}
        onConfirm={handleToggleConfirm}
        title={isToggleStatusActive ? 'Deactivate Staff' : 'Activate Staff'}
        message={`Are you sure you want to ${
          isToggleStatusActive ? 'deactivate' : 'activate'
        } ${staffToToggle?.firstName} ${staffToToggle?.lastName}?`}
        confirmText={isToggleStatusActive ? 'Deactivate' : 'Activate'}
        variant={isToggleStatusActive ? 'danger' : 'warning'}
        loading={toggleMutation.isPending}
      />

      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingStaff ? 'Edit Staff Profile' : 'Add New Staff'}
        size="lg"
      >
        <StaffForm
          staff={editingStaff || undefined}
          onSuccess={handleFormSuccess}
          onCancel={() => setIsFormModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={showTempPasswordModal}
        onClose={() => setShowTempPasswordModal(false)}
        title="Account Created"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--text)]">
            The staff member profile and associated login account have been successfully generated.
          </p>
          <div className="bg-[var(--surface-container-low)] p-4 rounded-lg flex items-center justify-between">
            <div>
              <p className="text-xs text-[var(--text-muted)] font-semibold uppercase mb-1">Temporary Password</p>
              <p className="font-mono text-lg font-bold text-[var(--text)]">{tempPassword}</p>
            </div>
            <Button variant="secondary" onClick={handleCopyPassword}>
              Copy
            </Button>
          </div>
          <p className="text-sm font-semibold text-[var(--danger)]">
            Save this password — it will not be shown again.
          </p>
          <div className="flex justify-end pt-4">
            <Button variant="primary" onClick={() => setShowTempPasswordModal(false)}>
              Done
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
