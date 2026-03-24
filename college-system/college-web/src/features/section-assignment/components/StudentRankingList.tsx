'use client';

import {
  UnassignedStudent,
  ManualAssignment,
  SectionInfo,
} from '../types/section-assignment.types';
import { Table, Badge, Select, Skeleton, EmptyState } from '@/components/ui';

interface StudentRankingListProps {
  students: UnassignedStudent[];
  isLoading: boolean;
  selectedAssignments: ManualAssignment[];
  onManualAssign: (studentId: string, sectionId: string) => void;
  sections: SectionInfo[];
}

export function StudentRankingList({
  students,
  isLoading,
  selectedAssignments,
  onManualAssign,
  sections,
}: StudentRankingListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!students || students.length === 0) {
    return (
      <EmptyState
        title="All students have been assigned to sections"
        description="There are no pending unassigned students for this grade."
      />
    );
  }

  const sectionOptions = [
    { label: 'Unassigned', value: '' },
    ...sections.map((s) => ({ label: s.name, value: s.id })),
  ];

  const columns = [
    { key: 'rank', header: 'Rank', width: '80px', render: (_: any, index: number) => <span className="font-semibold text-[var(--text-muted)]">#{index + 1}</span> },
    { key: 'student', header: 'Student Name', render: (student: UnassignedStudent) => <div className="font-medium text-[var(--text)]">{student.firstName} {student.lastName}</div> },
    { key: 'marks', header: 'Ranking Marks', render: (student: UnassignedStudent) => student.rankingMarks !== null ? <span className="text-sm font-semibold">{student.rankingMarks}</span> : <Badge variant="warning">No marks</Badge> },
    { key: 'assign', header: 'Assigned Section', width: '220px', render: (student: UnassignedStudent) => {
      const currentAssignment = selectedAssignments.find((a) => a.studentId === student.id);
      const selectedSectionId = currentAssignment ? currentAssignment.sectionId : '';
      return (
        <Select
          options={sectionOptions}
          value={selectedSectionId}
          onChange={(e) => onManualAssign(student.id, e.target.value)}
          className="w-full"
        />
      );
    }}
  ];

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden shadow-sm h-full flex flex-col">
      <div className="p-4 border-b border-[var(--border)] bg-[var(--surface-container-lowest)]">
        <h3 className="font-semibold text-[var(--text)]">Unassigned Students ({students.length})</h3>
        <p className="text-sm text-[var(--text-muted)] mt-1">Sorted by ranking marks descending.</p>
      </div>
      <div className="flex-1 overflow-auto">
        <Table columns={columns} data={students} />
      </div>
    </div>
  );
}
