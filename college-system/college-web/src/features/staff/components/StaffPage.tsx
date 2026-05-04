'use client';

import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Plus, Search, ChevronRight } from 'lucide-react';
import { useRole } from '@/store/authStore';
import { useInfiniteStaff, useToggleStaffStatus, useDeleteStaff } from '@/features/staff/hooks/useStaff';
import { Staff } from '@/features/staff/types/staff.types';
import { StaffTable } from '@/features/staff/components/StaffTable';
import { StaffProfileDrawer } from '@/features/staff/components/StaffProfileDrawer';
import { StaffForm } from '@/features/staff/components/StaffForm';
import { useMonthlySummary } from '@/features/staff-attendance/hooks/useStaffAttendance';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';

import PageHeader from '@/components/layout/PageHeader';
import {
  Button,
  ConfirmDialog,
  Select,
  SearchInput,
  Modal,
  Skeleton,
} from '@/components/ui';
import { InfiniteScrollSentinel } from '@/components/ui/InfiniteScrollSentinel';

const AVATAR_COLORS = [
  'bg-[var(--primary)]', 'bg-[var(--gold)]', 'bg-purple-600', 'bg-rose-600', 'bg-blue-600'
];

const EMPLOYMENT_CHIPS = [
  { label: 'All', value: 'ALL' },
  { label: 'Permanent', value: 'PERMANENT' },
  { label: 'Contract', value: 'CONTRACT' },
  { label: 'Visiting', value: 'VISITING' },
];

const STATUS_CHIPS = [
  { label: 'All', value: 'ALL' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Inactive', value: 'INACTIVE' },
];

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
  const [showSearch, setShowSearch] = useState(false);

  const apiFilters = {
    campusId: campusId || undefined,
    employmentType: selectedEmployment !== 'ALL' ? selectedEmployment : undefined,
    isActive: selectedStatus !== 'ALL' ? (selectedStatus === 'ACTIVE') : undefined,
  };

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } = useInfiniteStaff(apiFilters);
  const staffList = data?.pages.flatMap((p) => p.data) ?? [];

  const now = new Date();
  const { data: summaryData } = useMonthlySummary(campusId || '', now.getMonth() + 1, now.getFullYear());
  const summaryMap = useMemo(() => {
    if (!summaryData) return {};
    return Object.fromEntries(summaryData.map((s) => [s.staffId, s]));
  }, [summaryData]);

  const toggleMutation = useToggleStaffStatus();
  const deleteMutation = useDeleteStaff();

  const [drawerStaffId, setDrawerStaffId] = useState<string | null>(null);
  const [staffToToggle, setStaffToToggle] = useState<Staff | null>(null);
  const isToggleStatusActive = staffToToggle?.user?.isActive ?? false;

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  const [showTempPasswordModal, setShowTempPasswordModal] = useState(false);
  const [tempPassword, setTempPassword] = useState('');
  const [emailSentOk, setEmailSentOk] = useState(true);
  const [emailErrMsg, setEmailErrMsg] = useState<string | null>(null);
  const { success } = useToast();

  const [staffToDelete, setStaffToDelete] = useState<Staff | null>(null);

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

  const handleFormSuccess = (pw?: string, sent?: boolean, emailErr?: string | null) => {
    setIsFormModalOpen(false);
    if (pw) {
      setTempPassword(pw);
      setEmailSentOk(sent ?? true);
      setEmailErrMsg(emailErr ?? null);
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

  // ─── Mobile card view ────────────────────────────────────────────────────
  const MobileStaffList = () => {
    if (isLoading) {
      return (
        <div className="space-y-2.5 md:hidden">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[72px] rounded-xl" />)}
        </div>
      );
    }

    if (filteredClientList.length === 0) {
      return (
        <div className="py-16 text-center md:hidden">
          <p className="text-sm text-[var(--text-muted)]">No staff members found</p>
        </div>
      );
    }

    return (
      <div className="space-y-2 md:hidden">
        {filteredClientList.map((staff, idx) => (
          <motion.button
            key={staff.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.02, duration: 0.25 }}
            onClick={() => setDrawerStaffId(staff.id)}
            className="w-full flex items-center gap-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3.5 active:bg-white/[0.02] transition-all text-left"
          >
            <div className={cn('w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0', AVATAR_COLORS[idx % AVATAR_COLORS.length])}>
              {staff.firstName[0]}{staff.lastName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-[var(--text)] truncate">{staff.firstName} {staff.lastName}</p>
              <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">
                {staff.designation || staff.employmentType} · {staff.staffCode}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {(() => {
                const summary = summaryMap[staff.id];
                if (campusId && summary && summary.totalDays > 0) {
                  const pct = summary.percentage;
                  return (
                    <span className={cn(
                      'text-[10px] font-bold px-2 py-0.5 rounded-full',
                      pct >= 85 ? 'bg-emerald-500/10 text-emerald-400' :
                      pct >= 70 ? 'bg-amber-500/10 text-amber-400' :
                      'bg-red-500/10 text-red-400'
                    )}>
                      {pct}%
                    </span>
                  );
                }
                return null;
              })()}
              <span className={cn(
                'text-[10px] font-bold px-2 py-0.5 rounded-full',
                staff.user?.isActive !== false ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
              )}>
                {staff.user?.isActive !== false ? 'Active' : 'Inactive'}
              </span>
              <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
            </div>
          </motion.button>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* ── Mobile header ────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[var(--bg)]/95 backdrop-blur-md border-b border-[var(--border)] px-4 h-14 flex items-center justify-between md:hidden">
        <h1 className="font-bold text-lg text-[var(--text)]" style={{ fontFamily: 'var(--font-display)' }}>Staff</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowSearch(!showSearch)} className="p-2 rounded-full active:bg-white/5 transition-colors">
            <Search className="w-5 h-5 text-[var(--text-muted)]" />
          </button>
          {isAdminOrSuper && (
            <button onClick={handleAddStaffClick} className="p-2 rounded-full bg-[var(--primary)] text-white active:opacity-80 transition-opacity">
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {/* ── Desktop header ───────────────────────────────────────────────── */}
      <div className="hidden md:block max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="Staff Management"
          breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Staff' }]}
          actions={
            <div className="flex items-center gap-4">
              {isAdminOrSuper && (
                <Button variant="gold" onClick={handleAddStaffClick}>Add Staff</Button>
              )}
            </div>
          }
        />
      </div>

      <div className="p-4 md:max-w-7xl md:mx-auto md:px-6 lg:px-8 md:py-0 space-y-4">
        {navigation}

        {/* Mobile search bar (expandable) */}
        {showSearch && (
          <div className="md:hidden">
            <SearchInput
              placeholder="Search by name or code..."
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </div>
        )}

        {/* Filter chips — horizontal scroll on mobile */}
        <div className="flex overflow-x-auto gap-2 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:flex-wrap">
          {EMPLOYMENT_CHIPS.map(chip => (
            <button
              key={chip.value}
              onClick={() => setSelectedEmployment(chip.value)}
              className={cn(
                'shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all min-h-[36px]',
                selectedEmployment === chip.value
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border)] hover:border-[var(--primary)]/40 active:scale-95'
              )}
            >
              {chip.label}
            </button>
          ))}
          <div className="w-px h-6 my-auto bg-[var(--border)] shrink-0 hidden md:block" />
          {STATUS_CHIPS.map(chip => (
            <button
              key={chip.value}
              onClick={() => setSelectedStatus(chip.value)}
              className={cn(
                'shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all min-h-[36px]',
                selectedStatus === chip.value
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border)] hover:border-[var(--primary)]/40 active:scale-95'
              )}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Desktop: filter bar + table */}
        <div className="hidden md:block">
          <div className="grid grid-cols-3 gap-4 mb-8 bg-[var(--surface-container-low)] p-4 rounded-lg items-end">
            <Select
              label="Employment Type"
              options={EMPLOYMENT_CHIPS}
              value={selectedEmployment}
              onChange={(e) => setSelectedEmployment(e.target.value)}
            />
            <Select
              label="Status"
              options={STATUS_CHIPS}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            />
            <SearchInput
              placeholder="Search by name or code..."
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </div>

          <StaffTable
            staffList={filteredClientList}
            isLoading={isLoading}
            attendanceSummary={campusId ? summaryMap : undefined}
            onView={(staff) => setDrawerStaffId(staff.id)}
            onEdit={handleEditStaffClick}
            onToggle={(id) => {
              const s = staffList.find(x => x.id === id);
              if (s) setStaffToToggle(s);
            }}
            onDelete={(staff) => setStaffToDelete(staff)}
          />
        </div>

        {/* Mobile: card list */}
        <MobileStaffList />

        <InfiniteScrollSentinel onVisible={fetchNextPage} hasMore={!!hasNextPage} isFetching={isFetchingNextPage} />
      </div>

      {/* Shared modals/drawers */}
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
        message={`Are you sure you want to ${isToggleStatusActive ? 'deactivate' : 'activate'} ${staffToToggle?.firstName} ${staffToToggle?.lastName}?`}
        confirmText={isToggleStatusActive ? 'Deactivate' : 'Activate'}
        variant={isToggleStatusActive ? 'danger' : 'warning'}
        loading={toggleMutation.isPending}
      />

      <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={editingStaff ? 'Edit Staff Profile' : 'Add New Staff'} size="lg">
        <StaffForm staff={editingStaff || undefined} onSuccess={handleFormSuccess} onCancel={() => setIsFormModalOpen(false)} />
      </Modal>

      <Modal isOpen={showTempPasswordModal} onClose={() => setShowTempPasswordModal(false)} title="Account Created" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-[var(--text)]">
            The staff member profile and associated login account have been successfully generated.
          </p>
          <div className="bg-[var(--surface-container-low)] p-4 rounded-lg flex items-center justify-between">
            <div>
              <p className="text-xs text-[var(--text-muted)] font-semibold uppercase mb-1">Temporary Password</p>
              <p className="font-mono text-lg font-bold text-[var(--text)]">{tempPassword}</p>
            </div>
            <Button variant="secondary" onClick={handleCopyPassword}>Copy</Button>
          </div>
          {emailSentOk ? (
            <div className="flex items-start gap-2 rounded-md border border-green-300 bg-green-50 dark:bg-green-950/30 dark:border-green-700 px-3 py-2 text-sm text-green-700 dark:text-green-400">
              <span className="mt-0.5">✓</span>
              <span>Welcome email sent successfully. You can always view the password later in their profile → Account tab.</span>
            </div>
          ) : (
            <div className="flex items-start gap-2 rounded-md border border-red-300 bg-red-50 dark:bg-red-950/30 dark:border-red-700 px-3 py-2 text-sm text-red-700 dark:text-red-400">
              <span className="mt-0.5 font-bold">!</span>
              <div>
                <p className="font-semibold">Email delivery failed — please share credentials manually.</p>
                {emailErrMsg && <p className="text-xs mt-0.5 opacity-75">{emailErrMsg}</p>}
                <p className="text-xs mt-1 opacity-75">The password is saved and visible in the staff profile → Account tab anytime.</p>
              </div>
            </div>
          )}
          <div className="flex justify-end pt-4">
            <Button variant="primary" onClick={() => setShowTempPasswordModal(false)}>Done</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!staffToDelete}
        onClose={() => setStaffToDelete(null)}
        onConfirm={() => {
          if (staffToDelete) {
            deleteMutation.mutate(staffToDelete.id, {
              onSuccess: () => setStaffToDelete(null),
            });
          }
        }}
        title={`Delete ${staffToDelete?.firstName} ${staffToDelete?.lastName}?`}
        message="This will permanently delete the staff member and their login account. This cannot be undone."
        confirmText="Delete"
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
