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
import { usePrograms } from '@/features/programs/hooks/usePrograms';
import { useProgramGrades, useSections } from '@/features/sections/hooks/useSections';
import { Subject, SectionSubjectTeacher } from '@/features/subjects/types/subjects.types';
import { SubjectForm } from '@/features/subjects/components/SubjectForm';
import { AssignmentForm } from '@/features/subjects/components/AssignmentForm';

import PageHeader from '@/components/layout/PageHeader';
import {
  Button,
  Modal,
  ConfirmDialog,
  Skeleton,
  ErrorState,
  EmptyState,
  Select,
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
  const [selectedCampus, setSelectedCampus] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSection, setSelectedSection] = useState('');

  // Cascade resets
  const handleCampusFilterChange = (val: string) => {
    setSelectedCampus(val);
    setSelectedProgram('');
    setSelectedGrade('');
    setSelectedSection('');
  };
  const handleProgramFilterChange = (val: string) => {
    setSelectedProgram(val);
    setSelectedGrade('');
    setSelectedSection('');
  };
  const handleGradeFilterChange = (val: string) => {
    setSelectedGrade(val);
    setSelectedSection('');
  };

  const { data: campuses = [] } = useCampuses();
  const { data: programs = [] } = usePrograms(selectedCampus || undefined);
  const { data: grades = [] } = useProgramGrades(selectedProgram || undefined);
  const { data: sections = [] } = useSections(selectedGrade || undefined);

  // Assignments Query
  const { data: assignments = [], isLoading: loadingAssignments } = useAssignmentsBySection(selectedSection);
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 p-4 bg-[var(--surface-container-low)] rounded-lg">
            <Select
              options={[{ label: 'Select Campus...', value: '' }, ...campuses.map(c => ({ label: c.name, value: c.id }))]}
              value={selectedCampus}
              onChange={(e) => handleCampusFilterChange(e.target.value)}
              placeholder="Campus"
            />
            <Select
              options={[{ label: 'Select Program...', value: '' }, ...programs.map(p => ({ label: p.name, value: p.id }))]}
              value={selectedProgram}
              onChange={(e) => handleProgramFilterChange(e.target.value)}
              disabled={!selectedCampus}
              placeholder="Program"
            />
            <Select
              options={[{ label: 'Select Grade...', value: '' }, ...grades.map(g => ({ label: g.name, value: g.id }))]}
              value={selectedGrade}
              onChange={(e) => handleGradeFilterChange(e.target.value)}
              disabled={!selectedProgram}
              placeholder="Grade"
            />
            <Select
              options={[{ label: 'Select Section...', value: '' }, ...sections.map(s => ({ label: s.name, value: s.id }))]}
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              disabled={!selectedGrade}
              placeholder="Section"
            />
          </div>

          {!selectedSection ? (
            <div className="text-center py-12 text-[var(--text-muted)]">
              Please select a Section descending through the filters above to view assignments.
            </div>
          ) : loadingAssignments ? (
            <div className="space-y-4">
              <Skeleton variant="text" />
              <Skeleton variant="text" />
            </div>
          ) : assignments.length === 0 ? (
            <EmptyState
              title="No subjects assigned yet"
              description="Click Assign Subject to add a teacher to a subject for this section."
            />
          ) : (
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
          sectionId={selectedSection}
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
          sectionId={selectedSection}
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
