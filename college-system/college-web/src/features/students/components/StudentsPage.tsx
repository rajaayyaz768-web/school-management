'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Search, ChevronRight } from 'lucide-react';
import { Student } from '@/features/students/types/students.types';
import { useInfiniteStudents } from '@/features/students/hooks/useStudents';
import { StudentTable } from '@/features/students/components/StudentTable';
import { StudentProfileDrawer } from '@/features/students/components/StudentProfileDrawer';
import { StudentForm } from '@/features/students/components/StudentForm';
import { cn } from '@/lib/utils';

import PageHeader from '@/components/layout/PageHeader';
import {
  Button,
  Select,
  SearchInput,
  Modal,
  Skeleton,
} from '@/components/ui';
import { InfiniteScrollSentinel } from '@/components/ui/InfiniteScrollSentinel';
import { useToast } from '@/hooks/useToast';

const AVATAR_COLORS = [
  'bg-[var(--primary)]', 'bg-[var(--gold)]', 'bg-purple-600', 'bg-blue-600', 'bg-rose-600'
];

const STATUS_CHIPS = [
  { label: 'All', value: 'ALL' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Unassigned', value: 'UNASSIGNED' },
  { label: 'Suspended', value: 'SUSPENDED' },
  { label: 'Graduated', value: 'GRADUATED' },
  { label: 'Withdrawn', value: 'WITHDRAWN' },
];

interface StudentsPageProps {
  campusId?: string
  sectionId?: string
  navigation?: React.ReactNode
}

export function StudentsPage({ campusId, sectionId, navigation }: StudentsPageProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [viewingStudentId, setViewingStudentId] = useState<string | null>(null);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [showTempPasswordModal, setShowTempPasswordModal] = useState(false);
  const [tempPassword, setTempPassword] = useState('');
  const { success } = useToast();

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteStudents({
    campusId: campusId || undefined,
    sectionId: sectionId || undefined,
    status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
  });

  const studentsList = data?.pages.flatMap((p) => p.data) ?? [];

  const filteredClientList = studentsList.filter((s) => {
    if (!searchQuery) return true;
    const lowerQuery = searchQuery.toLowerCase();
    const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
    const roll = s.rollNumber?.toLowerCase() || '';
    return fullName.includes(lowerQuery) || roll.includes(lowerQuery);
  });

  const handleAddStudentClick = () => {
    setEditingStudent(null);
    setIsFormModalOpen(true);
  };

  const handleEditStudentClick = (student: Student) => {
    setEditingStudent(student);
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

  const handleViewStudentClick = (student: Student) => {
    setViewingStudentId(student.id);
    setIsDrawerOpen(true);
  };

  const statusOptions = STATUS_CHIPS;

  // ── Mobile card list ──────────────────────────────────────────────
  const MobileStudentList = () => {
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
          <p className="text-sm text-[var(--text-muted)]">No students found</p>
        </div>
      );
    }

    return (
      <div className="space-y-2 md:hidden">
        {filteredClientList.map((student, idx) => {
          const statusCls = student.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' :
            student.status === 'SUSPENDED' ? 'bg-red-500/10 text-red-400' :
              student.status === 'GRADUATED' ? 'bg-blue-500/10 text-blue-400' :
                'bg-[var(--border)] text-[var(--text-muted)]';
          return (
            <motion.button
              key={student.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.02, duration: 0.25 }}
              onClick={() => handleViewStudentClick(student)}
              className="w-full flex items-center gap-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3.5 active:bg-white/[0.02] transition-all text-left"
            >
              <div className={cn('w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0', AVATAR_COLORS[idx % AVATAR_COLORS.length])}>
                {student.firstName[0]}{student.lastName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-[var(--text)] truncate">{student.firstName} {student.lastName}</p>
                <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">
                  Roll: {student.rollNumber || 'N/A'} · {student.section?.name || 'Unassigned'}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', statusCls)}>
                  {student.status}
                </span>
                <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
              </div>
            </motion.button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* ── Mobile header ────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[var(--bg)]/95 backdrop-blur-md border-b border-[var(--border)] px-4 h-14 flex items-center justify-between md:hidden">
        <h1 className="font-bold text-lg text-[var(--text)]" style={{ fontFamily: 'var(--font-display)' }}>Students</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowSearch(!showSearch)} className="p-2 rounded-full active:bg-white/5 transition-colors">
            <Search className="w-5 h-5 text-[var(--text-muted)]" />
          </button>
          <button onClick={handleAddStudentClick} className="p-2 rounded-full bg-[var(--primary)] text-white active:opacity-80 transition-opacity">
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ── Desktop header ───────────────────────────────────────────────── */}
      <div className="hidden md:block">
        <PageHeader
          title="Students Management"
          breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Students' }]}
          actions={<Button variant="primary" onClick={handleAddStudentClick}>Add Student</Button>}
        />
      </div>

      <div className="p-4 md:px-6 lg:px-8 md:py-0 space-y-4">
        {navigation}

        {/* Mobile search */}
        {showSearch && (
          <div className="md:hidden">
            <SearchInput placeholder="Search by name or roll no..." value={searchQuery} onChange={setSearchQuery} />
          </div>
        )}

        {/* Status filter chips */}
        <div className="flex overflow-x-auto gap-2 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:flex-wrap">
          {STATUS_CHIPS.map(chip => (
            <button
              key={chip.value}
              onClick={() => setSelectedStatus(chip.value)}
              className={cn(
                'shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all min-h-[36px]',
                selectedStatus === chip.value
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border)] active:scale-95'
              )}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Desktop: filter + table */}
        <div className="hidden md:block space-y-6">
          <div className="bg-[var(--surface)] p-4 rounded-xl border border-[var(--border)] flex flex-row gap-4 justify-between items-center">
            <Select
              options={statusOptions}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-48"
            />
            <div className="w-72">
              <SearchInput placeholder="Search by name or roll no..." value={searchQuery} onChange={setSearchQuery} />
            </div>
          </div>

          <StudentTable
            students={filteredClientList}
            isLoading={isLoading}
            onView={handleViewStudentClick}
            onEdit={handleEditStudentClick}
          />
        </div>

        {/* Mobile: card list */}
        <MobileStudentList />

        <InfiniteScrollSentinel onVisible={fetchNextPage} hasMore={!!hasNextPage} isFetching={isFetchingNextPage} />
      </div>

      {/* Shared drawers/modals */}
      <StudentProfileDrawer
        studentId={viewingStudentId}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onEdit={(student) => { setIsDrawerOpen(false); handleEditStudentClick(student); }}
      />

      <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={editingStudent ? 'Edit Student Profile' : 'Enroll New Student'} size="lg">
        <StudentForm student={editingStudent || undefined} onSuccess={handleFormSuccess} onCancel={() => setIsFormModalOpen(false)} />
      </Modal>

      <Modal isOpen={showTempPasswordModal} onClose={() => setShowTempPasswordModal(false)} title="Student Enrolled Successfully" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-[var(--text)]">
            A login account for student <strong>{editingStudent?.firstName} {editingStudent?.lastName}</strong> has been generated securely.
          </p>
          <div className="bg-[var(--surface-container-low)] p-4 rounded-lg flex items-center justify-between">
            <div>
              <p className="text-xs text-[var(--text-muted)] font-semibold uppercase mb-1">Temporary Password</p>
              <p className="font-mono text-lg font-bold text-[var(--text)]">{tempPassword}</p>
            </div>
            <Button variant="secondary" onClick={handleCopyPassword}>Copy</Button>
          </div>
          <p className="text-sm font-semibold text-[var(--danger)]">
            Save this password — it cannot be recovered later.
          </p>
          <div className="flex justify-end pt-4">
            <Button variant="primary" onClick={() => setShowTempPasswordModal(false)}>Done</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
