'use client';

import { useState } from 'react';
import { Student } from '@/features/students/types/students.types';
import { useStudents } from '@/features/students/hooks/useStudents';
import { StudentTable } from '@/features/students/components/StudentTable';
import { StudentProfileDrawer } from '@/features/students/components/StudentProfileDrawer';
import { StudentForm } from '@/features/students/components/StudentForm';

import PageHeader from '@/components/layout/PageHeader';
import {
  Button,
  Select,
  SearchInput,
  Pagination,
  Modal,
} from '@/components/ui';
import { useToast } from '@/hooks/useToast';

interface StudentsPageProps {
  campusId?: string
  sectionId?: string
  navigation?: React.ReactNode
}

export function StudentsPage({ campusId, sectionId, navigation }: StudentsPageProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 25;

  // Modaling State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [viewingStudentId, setViewingStudentId] = useState<string | null>(null);

  // Form State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  
  // Password sharing state
  const [showTempPasswordModal, setShowTempPasswordModal] = useState(false);
  const [tempPassword, setTempPassword] = useState('');
  const { success } = useToast();

  // Queries
  const { data: paginatedData, isLoading } = useStudents({
    campusId: campusId || undefined,
    sectionId: sectionId || undefined,
    status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
    page: currentPage,
    limit,
  });

  const studentsList = paginatedData?.data || [];
  const totalPages = paginatedData?.totalPages || 1;

  // Filter client-side explicitly on Name OR Roll Number
  const filteredClientList = studentsList.filter((s) => {
    if (!searchQuery) return true;
    const lowerQuery = searchQuery.toLowerCase();
    const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
    const roll = s.rollNumber?.toLowerCase() || '';
    return fullName.includes(lowerQuery) || roll.includes(lowerQuery);
  });

  const handleAddStudentClick = () => {
    setCurrentPage(1);
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

  const statusOptions = [
    { label: 'All Statuses', value: 'ALL' },
    { label: 'Unassigned', value: 'UNASSIGNED' },
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Suspended', value: 'SUSPENDED' },
    { label: 'Graduated', value: 'GRADUATED' },
    { label: 'Withdrawn', value: 'WITHDRAWN' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Students Management"
        breadcrumb={[
          { label: 'Home', href: '/' },
          { label: 'Students' },
        ]}
        actions={
          <Button variant="primary" onClick={handleAddStudentClick}>
            Add Student
          </Button>
        }
      />

      {navigation}

      {/* Filter Bar */}
      <div className="bg-[var(--surface)] p-4 rounded-xl border border-[var(--border)] shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Select
            options={statusOptions}
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-48"
          />
        </div>
        <div className="w-full sm:w-72">
          <SearchInput
            placeholder="Search by name or roll no..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>
      </div>

      <StudentTable
        students={filteredClientList}
        isLoading={isLoading}
        onView={handleViewStudentClick}
        onEdit={handleEditStudentClick}
      />

      {!isLoading && totalPages > 1 && (
        <div className="flex justify-between items-center pt-4">
          <p className="text-sm text-[var(--text-muted)]">
            Showing page {currentPage} of {totalPages}
          </p>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      <StudentProfileDrawer
        studentId={viewingStudentId}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onEdit={(student) => {
           setIsDrawerOpen(false);
           handleEditStudentClick(student);
        }}
      />

      {/* Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingStudent ? 'Edit Student Profile' : 'Enroll New Student'}
        size="lg"
      >
        <StudentForm
          student={editingStudent || undefined}
          onSuccess={handleFormSuccess}
          onCancel={() => setIsFormModalOpen(false)}
        />
      </Modal>

      {/* New Account Password Modal */}
      <Modal
        isOpen={showTempPasswordModal}
        onClose={() => setShowTempPasswordModal(false)}
        title="Student Enrolled Successfully"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--text)]">
            A login account for student <strong>{editingStudent?.firstName} {editingStudent?.lastName}</strong> has been generated securely.
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
            Save this password — it cannot be recovered later.
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
