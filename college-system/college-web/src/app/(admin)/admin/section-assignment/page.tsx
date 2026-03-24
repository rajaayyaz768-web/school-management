'use client';

import { useState, useEffect, useMemo } from 'react';
import axios from '@/lib/axios';

import { useCampuses } from '@/features/campus/hooks/useCampus';
import { usePrograms } from '@/features/programs/hooks/usePrograms';
import { useAssignmentData, useAutoAssign, useConfirmAssignment } from '@/features/section-assignment/hooks/useSectionAssignment';

import {
  ManualAssignment,
  AssignmentPreview,
  AssignmentResult,
} from '@/features/section-assignment/types/section-assignment.types';

import { StudentRankingList } from '@/features/section-assignment/components/StudentRankingList';
import { SectionCapacityPanel } from '@/features/section-assignment/components/SectionCapacityPanel';
import { AssignmentPreviewTable } from '@/features/section-assignment/components/AssignmentPreviewTable';

import PageHeader from '@/components/layout/PageHeader';
import {
  Button,
  Select,
  StatCard,
  ConfirmDialog,
  Modal,
  Table,
  Badge,
} from '@/components/ui';

export default function SectionAssignmentPage() {
  // Cascading Selection State
  const [selectedCampusId, setSelectedCampusId] = useState('');
  const [selectedProgramId, setSelectedProgramId] = useState('');
  const [selectedGradeId, setSelectedGradeId] = useState('');

  // Dropdown Data
  const { data: campuses = [] } = useCampuses();
  const { data: programs = [] } = usePrograms(selectedCampusId);
  
  const [grades, setGrades] = useState<{ id: string; name: string }[]>([]);
  const [isFetchingGrades, setIsFetchingGrades] = useState(false);

  // Assignment Stateful Contexts
  const [sectionCapacities, setSectionCapacities] = useState<{ sectionId: string; capacity: number }[]>([]);
  const [manualAssignments, setManualAssignments] = useState<ManualAssignment[]>([]);
  const [previewData, setPreviewData] = useState<AssignmentPreview[]>([]);
  
  // Results State
  const [assignmentResult, setAssignmentResult] = useState<AssignmentResult | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);

  // Assignment Control Queries and Mutations
  const { data: assignmentData, isLoading: isDataLoading, isFetching: isDataFetching } = useAssignmentData(selectedGradeId);
  const autoAssignMutation = useAutoAssign();
  const confirmMutation = useConfirmAssignment();

  // Load Grades when Program changes natively extracting nested API contexts bypassing hooks smoothly
  useEffect(() => {
    setGrades([]);
    setSelectedGradeId('');
    if (selectedProgramId) {
      setIsFetchingGrades(true);
      axios.get<{ success: boolean; data: { id: string; name: string }[] }>(`/grades?program_id=${selectedProgramId}`)
        .then((res) => setGrades(res.data.data))
        .catch((err) => console.error("Could not load grades", err))
        .finally(() => setIsFetchingGrades(false));
    }
  }, [selectedProgramId]);

  // Sync initial capacities cleanly when Grade data loads natively
  useEffect(() => {
    if (assignmentData?.sections) {
      setSectionCapacities(
        assignmentData.sections.map((s: any) => ({ sectionId: s.id, capacity: s.capacity }))
      );
      setManualAssignments([]);
      setPreviewData([]);
    }
  }, [assignmentData]);

  // Map Handlers explicitly enforcing clean overrides mapping Native React updates efficiently
  const handleCapacityChange = (sectionId: string, capacity: number) => {
    setSectionCapacities((prev) =>
      prev.map((c) => (c.sectionId === sectionId ? { ...c, capacity } : c))
    );
  };

  const handleManualAssign = (studentId: string, sectionId: string) => {
    setManualAssignments((prev) => {
      // Erase if setting to Unassigned natively
      if (!sectionId) return prev.filter((a) => a.studentId !== studentId);
      
      const filtered = prev.filter((a) => a.studentId !== studentId);
      return [...filtered, { studentId, sectionId }];
    });
  };

  const handleRemoveFromPreview = (studentId: string) => {
    setManualAssignments((prev) => prev.filter((a) => a.studentId !== studentId));
  };

  const handleClearAssignments = () => {
    setManualAssignments([]);
    setPreviewData([]);
  };

  const handleAutoAssign = () => {
    if (!selectedGradeId) return;
    autoAssignMutation.mutate(
      { gradeId: selectedGradeId, sectionCapacities },
      { onSuccess: (data: any) => setPreviewData(data) }
    );
  };

  // Hydrate preview cleanly isolating auto and manual heuristics organically overriding appropriately
  // Important: manual assignments take priority overriding simulated bounds organically!
  const combinedPreview = useMemo(() => {
    if (!assignmentData) return [];
    
    // Create base from Auto Assign Preview seamlessly
    const structuredRecord: Record<string, AssignmentPreview> = {};
    assignmentData.sections.forEach((s: any) => {
      structuredRecord[s.id] = { sectionId: s.id, sectionName: s.name, students: [] };
    });

    if (previewData.length > 0) {
      previewData.forEach((sectionGroup) => {
        sectionGroup.students.forEach((st) => {
          // Add only if not manually overridden natively tracking overlaps correctly
          if (!manualAssignments.find((ma) => ma.studentId === st.id)) {
             if (structuredRecord[sectionGroup.sectionId]) {
                structuredRecord[sectionGroup.sectionId].students.push(st);
             }
          }
        });
      });
    }

    // Attach explicit overrides explicitly
    manualAssignments.forEach((ma) => {
      const student = assignmentData.unassignedStudents.find((s: any) => s.id === ma.studentId);
      if (student && structuredRecord[ma.sectionId]) {
        structuredRecord[ma.sectionId].students.push(student);
      }
    });

    return Object.values(structuredRecord).filter((group) => group.students.length > 0);
  }, [assignmentData, previewData, manualAssignments]);

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const handleConfirmExecute = () => {
    if (!selectedGradeId) return;

    // Flatten combined previews explicitly into transactional tuples
    const assignments: ManualAssignment[] = [];
    combinedPreview.forEach((group) => {
       group.students.forEach((student) => {
          assignments.push({ studentId: student.id, sectionId: group.sectionId });
       });
    });

    if (assignments.length === 0) return;

    confirmMutation.mutate(
      { gradeId: selectedGradeId, assignments },
      {
        onSuccess: (result: any) => {
           setAssignmentResult(result);
           setShowResultModal(true);
           setIsConfirmDialogOpen(false);
           handleClearAssignments(); // Clear working state organically after successful push
        }
      }
    );
  };

  // Top level KPI statistics calculated locally safely
  const totalUnassigned = assignmentData?.unassignedStudents.length || 0;
  const totalAvailableSections = assignmentData?.sections.length || 0;
  const totalRawCapacity = sectionCapacities.reduce((sum, item) => sum + item.capacity, 0);

  const previewAssignedCount = combinedPreview.reduce((sum, g) => sum + g.students.length, 0);

  const resultColumns = [
    { key: 'studentName', header: 'Student', render: (row: any) => (<span className="font-medium text-sm text-[var(--text)]">{row.studentName}</span>) },
    { key: 'sectionName', header: 'Section', render: (row: any) => (<Badge variant="info">{row.sectionName}</Badge>) },
    { key: 'rollNumber', header: 'Official Roll No', render: (row: any) => (<span className="font-mono text-sm">{row.rollNumber}</span>) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Section Assignment Tool"
        breadcrumb={[
          { label: 'Home', href: '/' },
          { label: 'Configurations' },
          { label: 'Section Assignments' },
        ]}
      />

      {/* Step 1: Grade Selection Cascades */}
      <div className="bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)] shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-[var(--text)]">Step 1 — Select Target Grade</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Select
            label="Campus"
            value={selectedCampusId}
            onChange={(e) => {
              setSelectedCampusId(e.target.value);
              setSelectedProgramId('');
              setSelectedGradeId('');
            }}
            options={[
              { label: 'Select Campus...', value: '' },
              ...campuses.map(c => ({ label: c.name, value: c.id }))
            ]}
          />
          <Select
            label="Program"
            value={selectedProgramId}
            onChange={(e) => {
              setSelectedProgramId(e.target.value);
              setSelectedGradeId('');
            }}
            options={[
                { label: 'Select Program...', value: '' },
                ...programs.map(p => ({ label: p.name, value: p.id }))
            ]}
            disabled={!selectedCampusId}
          />
          <Select
            label="Grade / Year"
            value={selectedGradeId}
            onChange={(e) => setSelectedGradeId(e.target.value)}
            options={[
              { label: 'Select Grade...', value: '' },
              ...grades.map(g => ({ label: g.name, value: g.id }))
            ]}
            disabled={!selectedProgramId || isFetchingGrades}
          />
        </div>
      </div>

      {assignmentData && !isDataFetching && (
        <>
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard title="Total Unassigned Students" value={totalUnassigned.toString()} variant="default" />
            <StatCard title="Total Sections" value={totalAvailableSections.toString()} variant="default" />
            <StatCard title="Total Capacity Configuration" value={totalRawCapacity.toString()} variant="default" />
          </div>

          {/* Action Row */}
          <div className="flex justify-between items-center py-4">
             <h3 className="text-xl font-bold text-[var(--text)]">Step 2 — Configure and Assign</h3>
             <div className="flex gap-3">
               <Button
                  variant="secondary"
                  onClick={handleClearAssignments}
                  disabled={manualAssignments.length === 0 && previewData.length === 0}
               >
                 Clear
               </Button>
               <Button
                  variant="primary"
                  onClick={handleAutoAssign}
                  loading={autoAssignMutation.isPending}
                  disabled={totalUnassigned === 0}
               >
                 Auto Assign Preview
               </Button>
             </div>
          </div>

          {/* Configuration Canvas Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-6 border-b border-[var(--border)]">
             <div className="lg:col-span-8 h-[600px]">
               <StudentRankingList
                  students={assignmentData.unassignedStudents}
                  isLoading={isDataLoading}
                  sections={assignmentData.sections}
                  selectedAssignments={manualAssignments}
                  onManualAssign={handleManualAssign}
               />
             </div>
             <div className="lg:col-span-4 max-h-[600px] overflow-y-auto pr-2">
               <SectionCapacityPanel
                  sections={assignmentData.sections}
                  sectionCapacities={sectionCapacities}
                  onCapacityChange={handleCapacityChange}
                  previewData={combinedPreview}
               />
             </div>
          </div>
          
          {/* Output / Confirmation Blocks */}
          {combinedPreview.length > 0 && (
            <div className="space-y-6 pt-4">
              <div className="flex justify-between items-center">
                 <h3 className="text-xl font-bold text-[var(--text)]">Step 3 — Review and Execute</h3>
                 <Button
                    variant="primary"
                    onClick={() => setIsConfirmDialogOpen(true)}
                    className="bg-amber-600 hover:bg-amber-700 text-white! border-amber-600"
                    size="lg"
                 >
                    Confirm {previewAssignedCount} Assignments
                 </Button>
              </div>

              <AssignmentPreviewTable
                  preview={combinedPreview}
                  onRemoveStudent={handleRemoveFromPreview}
              />
            </div>
          )}
        </>
      )}

      {/* Database Commit Warning Dialog */}
      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        title="Confirm Section Assignment"
        message={`This will assign ${previewAssignedCount} students to their respective sections and generate their official Roll Numbers. This action affects live transactional sequences uniquely and cannot be undone softly. Continue?`}
        confirmText="Confirm Assignments"
        onConfirm={handleConfirmExecute}
        onClose={() => setIsConfirmDialogOpen(false)}
        variant="warning"
      />

      {/* Execution Results Summary Modal */}
      <Modal
        isOpen={showResultModal}
        title="Assignment Execution Complete"
        onClose={() => setShowResultModal(false)}
        size="lg"
      >
        <div className="space-y-6">
           <div className="text-center bg-[var(--surface-container-low)] p-6 rounded-xl border border-[var(--border)]">
              <p className="text-sm font-semibold uppercase text-[var(--success)] tracking-wider">Total Assignments Executed</p>
              <p className="text-5xl font-black text-[var(--text)] mt-2">{assignmentResult?.totalAssigned || 0}</p>
           </div>
           
           {assignmentResult?.skipped && assignmentResult.skipped.length > 0 && (
             <div className="bg-[var(--danger-tint)] border border-[var(--danger)] text-[var(--danger)] p-4 rounded-lg text-sm">
                <strong>Attention:</strong> {assignmentResult.skipped.length} records were skipped (already ACTIVE or missing). Check exact console trace logs if this persists unexpectedly.
             </div>
           )}

           <div>
              <h4 className="font-semibold text-sm text-[var(--text-muted)] mb-3">Allocated Roll Numbers Overview</h4>
              <div className="max-h-80 overflow-y-auto rounded-lg border border-[var(--border)]">
                <Table
                  columns={resultColumns}
                  data={assignmentResult?.assignments || []}
                />
              </div>
           </div>

           <div className="flex justify-end pt-4 border-t border-[var(--border)]">
             <Button variant="primary" onClick={() => setShowResultModal(false)}>
               Acknowledge
             </Button>
           </div>
        </div>
      </Modal>

    </div>
  );
}
