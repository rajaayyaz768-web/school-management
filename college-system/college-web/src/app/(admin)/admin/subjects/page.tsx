'use client';

import { useState } from 'react';
import { useRole } from '@/store/authStore';
import {
  useSubjects,
  useToggleSubjectStatus,
  useAssignmentsBySection,
  useDeleteAssignment
} from '@/features/subjects/hooks/useSubjects';
import { useCampuses } from '@/features/campus/hooks/useCampus';
import { Subject, SectionSubjectTeacher } from '@/features/subjects/types/subjects.types';
import { SubjectForm } from '@/features/subjects/components/SubjectForm';
import { AssignmentForm } from '@/features/subjects/components/AssignmentForm';
import { SectionSelectorCards } from '@/components/shared/selection/SectionSelectorCards';
import type { SectionCardData } from '@/components/shared/selection/types';

import PageHeader from '@/components/layout/PageHeader';
import {
  Button,
  Modal,
  ConfirmDialog,
  Skeleton,
  ErrorState,
  EmptyState,
  SearchInput,
  Tabs,
  TabPanel,
  Badge,
  Table,
  Tooltip
} from '@/components/ui';

export default function SubjectsPage() {
  const role = useRole();
  const isAdminOrSuper = role === 'SUPER_ADMIN' || role === 'ADMIN';

  // ─── TABS STATE ─────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('subjects');
  const handleTabChange = (id: string) => setActiveTab(id);

  // ─── TAB 1: SUBJECTS ─────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const { data: subjects = [], isLoading: loadingSubjects, isError: errorSubjects, refetch: refetchSubjects } = useSubjects();
  const toggleSubjectMutation = useToggleSubjectStatus();

  const [isAddSubjectModalOpen, setIsAddSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subjectToToggle, setSubjectToToggle] = useState<Subject | null>(null);

  const filteredSubjects = subjects.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubjectToggleConfirm = () => {
    if (subjectToToggle) {
      toggleSubjectMutation.mutate(subjectToToggle.id, {
        onSuccess: () => setSubjectToToggle(null),
      });
    }
  };

  const getSubjectTypeBadgeVariant = (type: string) => {
    if (type === 'THEORY') return 'info';
    if (type === 'PRACTICAL') return 'warning';
    return 'success';
  };

  const subjectColumns = [
    { key: 'name', header: 'Subject Name', render: (row: Subject) => (<span className="font-semibold text-[var(--text)]">{row.name}</span>) },
    { key: 'code', header: 'Code', render: (row: Subject) => (<span className="font-mono text-sm text-[var(--text-muted)]">{row.code}</span>) },
    { key: 'type', header: 'Type', render: (row: Subject) => (<Badge variant={getSubjectTypeBadgeVariant(row.type)}>{row.type}</Badge>) },
    { key: 'creditHours', header: 'Credit Hours', render: (row: Subject) => (<span className="text-[var(--text)]">{row.creditHours}</span>) },
    { key: 'status', header: 'Status', render: (row: Subject) => (<Badge variant={row.isActive ? 'success' : 'danger'}>{row.isActive ? 'Active' : 'Inactive'}</Badge>) },
    { key: 'actions', header: 'Actions', className: 'text-right', render: (row: Subject) => (
      <div className="flex justify-end space-x-2">
        <Tooltip content="Edit subject">
          <Button variant="secondary" size="sm" onClick={() => setEditingSubject(row)}>Edit</Button>
        </Tooltip>
        <Tooltip content={row.isActive ? 'Deactivate subject' : 'Activate subject'}>
          <Button variant={row.isActive ? 'danger' : 'gold'} size="sm" onClick={() => setSubjectToToggle(row)}>
             {row.isActive ? 'Deactivate' : 'Activate'}
          </Button>
        </Tooltip>
      </div>
    ) }
  ];

  // ─── TAB 2: ASSIGNMENTS ──────────────────────────────────────────────────────
  const [selectedSection, setSelectedSection] = useState<SectionCardData | null>(null);

  const { data: campuses = [] } = useCampuses();
  const campusId = campuses[0]?.id ?? '';

  // Assignments Query
  const { data: assignments = [], isLoading: loadingAssignments } = useAssignmentsBySection(selectedSection?.id ?? '');
  const deleteAssignmentMutation = useDeleteAssignment();

  const [isAddAssignmentModalOpen, setIsAddAssignmentModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<SectionSubjectTeacher | null>(null);
  const [assignmentToDelete, setAssignmentToDelete] = useState<string | null>(null);

  const assignmentToDeleteRef = assignmentToDelete;
  const handleDeleteAssignmentConfirm = () => {
    if (assignmentToDelete) {
      deleteAssignmentMutation.mutate(assignmentToDelete, {
        onSuccess: () => setAssignmentToDelete(null),
      });
    }
  };

  const currentAcademicYear = '2026-2027'; // In a real app derived globally

  const assignmentColumns = [
    { key: 'subjectName', header: 'Subject Name', render: (row: SectionSubjectTeacher) => (<span className="font-semibold text-[var(--text)]">{row.subject?.name}</span>) },
    { key: 'subjectCode', header: 'Code', render: (row: SectionSubjectTeacher) => (<span className="font-mono text-sm text-[var(--text-muted)]">{row.subject?.code}</span>) },
    { key: 'staffName', header: 'Staff Name', render: (row: SectionSubjectTeacher) => (<span className="text-[var(--text)] text-sm">{row.staff?.firstName} {row.staff?.lastName}</span>) },
    { key: 'academicYear', header: 'Academic Year', render: (row: SectionSubjectTeacher) => (<span className="text-[var(--text-muted)] text-sm">{row.academicYear}</span>) },
    { key: 'actions', header: 'Actions', className: 'text-right', render: (row: SectionSubjectTeacher) => (
      <div className="flex justify-end space-x-2">
        <Tooltip content="Edit assignment">
          <Button variant="secondary" size="sm" onClick={() => setEditingAssignment(row)}>Edit</Button>
        </Tooltip>
        <Tooltip content="Remove assignment safely">
          <Button variant="danger" size="sm" onClick={() => setAssignmentToDelete(row.id)}>Delete</Button>
        </Tooltip>
      </div>
    ) }
  ];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <PageHeader
        title="Subjects Management"
        breadcrumb={[
          { label: 'Home', href: '/' },
          { label: 'Subjects' }
        ]}
        actions={
          <div className="flex items-center gap-4">
            {isAdminOrSuper && activeTab === 'subjects' && (
              <Button variant="gold" onClick={() => setIsAddSubjectModalOpen(true)}>
                Add Subject
              </Button>
            )}
            {isAdminOrSuper && activeTab === 'assignments' && (
              <Button
                variant="gold"
                onClick={() => setIsAddAssignmentModalOpen(true)}
                disabled={!selectedSection}
              >
                Assign Subject
              </Button>
            )}
          </div>
        }
      />

      <Tabs 
        tabs={[{ id: 'subjects', label: 'Subjects List' }, { id: 'assignments', label: 'Assignments' }]} 
        activeTab={activeTab} 
        onChange={handleTabChange} 
      />

      <div className="mt-6">
        <TabPanel tabId="subjects" activeTab={activeTab}>
          <div className="mb-6 max-w-md">
            <SearchInput 
              placeholder="Search subjects by name or code..." 
              value={searchQuery}
              onChange={(val: string) => setSearchQuery(val)}
            />
          </div>

          {loadingSubjects ? (
            <div className="space-y-4">
              <Skeleton variant="text" />
              <Skeleton variant="text" />
              <Skeleton variant="text" />
            </div>
          ) : errorSubjects ? (
            <ErrorState action={{ label: 'Retry', onClick: () => refetchSubjects() }} />
          ) : filteredSubjects.length === 0 ? (
            <EmptyState
              title={searchQuery ? "No subjects match your search" : "No subjects added yet"}
              description="Subjects will appear here once they are registered."
            />
          ) : (
            <div className="bg-[var(--surface-container-lowest)] rounded-lg border border-[var(--border)] overflow-hidden">
              <Table columns={subjectColumns} data={filteredSubjects} />
            </div>
          )}
        </TabPanel>

        <TabPanel tabId="assignments" activeTab={activeTab}>
          {!selectedSection ? (
            <SectionSelectorCards
              campusId={campusId}
              onSelect={(section) => setSelectedSection(section)}
            />
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <Button variant="ghost" size="sm" onClick={() => setSelectedSection(null)}>← Change Section</Button>
                <Badge variant="info">{selectedSection.name}</Badge>
                {selectedSection.programCode && <span className="text-sm text-[var(--text-muted)]">{selectedSection.programCode}</span>}
                {selectedSection.gradeName && <span className="text-sm text-[var(--text-muted)]">· {selectedSection.gradeName}</span>}
              </div>
            </>
          )}

          {selectedSection && loadingAssignments && (
            <div className="space-y-4">
              <Skeleton variant="text" />
              <Skeleton variant="text" />
            </div>
          )}
          {selectedSection && !loadingAssignments && assignments.length === 0 && (
            <EmptyState
              title="No subjects assigned yet"
              description="Click Assign Subject to add a teacher to a subject for this section."
            />
          )}
          {selectedSection && !loadingAssignments && assignments.length > 0 && (
            <div className="bg-[var(--surface-container-lowest)] rounded-lg border border-[var(--border)] overflow-hidden">
              <Table columns={assignmentColumns} data={assignments} />
            </div>
          )}
        </TabPanel>
      </div>

      {/* ─── MODALS ───────────────────────────────────────────────────────────── */}
      
      {/* Subject Form Modals */}
      <Modal
        isOpen={isAddSubjectModalOpen}
        onClose={() => setIsAddSubjectModalOpen(false)}
        title="Add Subject"
        size="md"
      >
        <SubjectForm
          onSuccess={() => setIsAddSubjectModalOpen(false)}
          onCancel={() => setIsAddSubjectModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={!!editingSubject}
        onClose={() => setEditingSubject(null)}
        title="Edit Subject"
        size="md"
      >
        <SubjectForm
          subject={editingSubject || undefined}
          onSuccess={() => setEditingSubject(null)}
          onCancel={() => setEditingSubject(null)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!subjectToToggle}
        onClose={() => setSubjectToToggle(null)}
        onConfirm={handleSubjectToggleConfirm}
        title={subjectToToggle?.isActive ? 'Deactivate Subject' : 'Activate Subject'}
        message={`Are you sure you want to ${
          subjectToToggle?.isActive ? 'deactivate' : 'activate'
        } subject ${subjectToToggle?.name}?`}
        confirmText={subjectToToggle?.isActive ? 'Deactivate' : 'Activate'}
        variant={subjectToToggle?.isActive ? 'danger' : 'warning'}
        loading={toggleSubjectMutation.isPending}
      />

      {/* Assignment Form Modals */}
      <Modal
        isOpen={isAddAssignmentModalOpen}
        onClose={() => setIsAddAssignmentModalOpen(false)}
        title="Assign Subject"
        size="md"
      >
        <AssignmentForm
          sectionId={selectedSection?.id ?? ''}
          academicYear={currentAcademicYear}
          onSuccess={() => setIsAddAssignmentModalOpen(false)}
          onCancel={() => setIsAddAssignmentModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={!!editingAssignment}
        onClose={() => setEditingAssignment(null)}
        title="Edit Assignment"
        size="md"
      >
        <AssignmentForm
          sectionId={selectedSection?.id ?? ''}
          academicYear={currentAcademicYear}
          assignment={editingAssignment || undefined}
          onSuccess={() => setEditingAssignment(null)}
          onCancel={() => setEditingAssignment(null)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!assignmentToDelete}
        onClose={() => setAssignmentToDelete(null)}
        onConfirm={handleDeleteAssignmentConfirm}
        title="Remove Assignment"
        message="Are you sure you want to remove this subject assignment? This cannot be undone."
        confirmText="Remove"
        variant="danger"
        loading={deleteAssignmentMutation.isPending}
      />

    </div>
  );
}
