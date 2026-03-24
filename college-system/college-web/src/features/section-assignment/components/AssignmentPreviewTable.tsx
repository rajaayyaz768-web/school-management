'use client';

import { AssignmentPreview } from '../types/section-assignment.types';
import { Table, Button, Badge } from '@/components/ui';
import { Trash2 } from 'lucide-react';

interface AssignmentPreviewTableProps {
  preview: AssignmentPreview[];
  onRemoveStudent: (studentId: string) => void;
}

export function AssignmentPreviewTable({ preview, onRemoveStudent }: AssignmentPreviewTableProps) {
  if (!preview || preview.length === 0) return null;

  const totalAssigned = preview.reduce((sum, section) => sum + section.students.length, 0);

  if (totalAssigned === 0) return null;

  const columns = [
    { key: 'student', header: 'Student Name', render: (row: any) => (<div className="font-medium text-[var(--text)]">{row.firstName} {row.lastName}</div>) },
    { key: 'marks', header: 'Ranking Marks', render: (row: any) => row.rankingMarks !== null ? (<span className="text-sm font-semibold">{row.rankingMarks}</span>) : (<Badge variant="warning">No marks</Badge>) },
    { key: 'section', header: 'Assigned Section', render: () => (<Badge variant="info">Assigned</Badge>) },
    { key: 'actions', header: '', className: 'text-right', render: (row: any) => (
      <div className="flex justify-end">
        <Button
          variant="danger"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onRemoveStudent(row.id)}
          aria-label="Remove assignment"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    ) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-2">
        <h3 className="text-lg font-bold text-[var(--text)]">Assignment Plan Preview</h3>
        <Badge variant="info">{totalAssigned} students ready to assign</Badge>
      </div>

      <div className="space-y-8">
        {preview.map((sectionGroup) => {
          if (sectionGroup.students.length === 0) return null;

          return (
            <div key={sectionGroup.sectionId} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden shadow-sm">
              <div className="px-6 py-3 bg-[var(--surface-container-lowest)] border-b border-[var(--border)] flex justify-between items-center">
                <span className="font-semibold text-[var(--text)]">Section {sectionGroup.sectionName}</span>
                <Badge variant="neutral">{sectionGroup.students.length} students</Badge>
              </div>
              
              <Table columns={columns} data={sectionGroup.students} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
