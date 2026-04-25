'use client';

import { useState } from 'react';
import { Program, Grade, TeachingMode } from '../types/programs.types';
import { useUpdateGrade } from '../hooks/usePrograms';
import { Card, Badge, Button, Tooltip } from '@/components/ui';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Pencil } from 'lucide-react';

export interface ProgramCardProps {
  program: Program;
  onEdit: (program: Program) => void;
  onToggle: (id: string) => void;
}

const TEACHING_MODE_OPTIONS = [
  { value: '', label: 'Not set' },
  { value: 'SUBJECT_WISE', label: 'Subject-wise (each subject has own teacher)' },
  { value: 'CLASS_TEACHER', label: 'Class Teacher (one teacher, all subjects)' },
  { value: 'DUAL_TEACHER', label: 'Two Teachers (subjects split between two)' },
];

function GradeEditModal({ grade, onClose }: { grade: Grade; onClose: () => void }) {
  const updateGrade = useUpdateGrade();
  const [teachingMode, setTeachingMode] = useState<string>(grade.teachingMode ?? '');
  const [isTransitional, setIsTransitional] = useState(grade.isTransitional);

  const handleSave = () => {
    updateGrade.mutate(
      {
        gradeId: grade.id,
        data: {
          teaching_mode: teachingMode ? (teachingMode as TeachingMode) : undefined,
          is_transitional: isTransitional,
        },
      },
      { onSuccess: onClose }
    );
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`Edit Grade — ${grade.name}`}
      subtitle="Configure teaching mode and transitional status"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} loading={updateGrade.isPending}>Save</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Teaching Mode</label>
          <Select
            value={teachingMode}
            onChange={e => setTeachingMode(e.target.value)}
            options={TEACHING_MODE_OPTIONS}
          />
          <p className="mt-1 text-xs text-[var(--text-muted)]">Only relevant for school campuses.</p>
        </div>

        <div className="flex items-center gap-3">
          <input
            id="transitional"
            type="checkbox"
            checked={isTransitional}
            onChange={e => setIsTransitional(e.target.checked)}
            className="h-4 w-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
          />
          <label htmlFor="transitional" className="text-sm text-[var(--text)]">
            Transitional grade (Pre-9)
          </label>
        </div>
        {isTransitional && (
          <p className="text-xs text-purple-600 bg-purple-50 px-3 py-2 rounded-[var(--radius-sm)]">
            Transitional grades are used in the short Class 8 → Pre-9 promotion cycle.
          </p>
        )}
      </div>
    </Modal>
  );
}

export function ProgramCard({ program, onEdit, onToggle }: ProgramCardProps) {
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);

  const sortedGrades = [...(program.grades || [])].sort(
    (a, b) => a.displayOrder - b.displayOrder
  );

  return (
    <>
      <Card hoverable className="flex flex-col h-full bg-[var(--surface-container-lowest)] p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-display text-xl font-semibold text-[var(--text)] mb-2">
              {program.name}
            </h3>
            <div className="flex flex-wrap gap-2 items-center">
              <Badge variant="info">{program.code}</Badge>
              <Badge variant="neutral">{program.campus?.name || 'Unknown Campus'}</Badge>
              <Badge variant={program.is_active ? 'success' : 'danger'}>
                {program.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-4 my-2">
          <div className="flex items-center gap-2">
            <span className="font-body text-sm font-semibold text-[var(--text-muted)]">Duration:</span>
            <span className="font-body text-sm text-[var(--text)]">{program.durationYears} Years</span>
          </div>

          {sortedGrades.length > 0 && (
            <div>
              <span className="font-body text-sm font-semibold text-[var(--text-muted)] block mb-2">Grades:</span>
              <div className="flex flex-wrap gap-2">
                {sortedGrades.map((grade) => (
                  <Tooltip key={grade.id} content="Click to edit teaching mode">
                    <button
                      onClick={() => setEditingGrade(grade)}
                      className="group inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 hover:bg-[var(--primary)]/20 transition-colors"
                    >
                      {grade.name}
                      {grade.isTransitional && <span className="text-purple-500 ml-0.5">●</span>}
                      <Pencil className="h-2.5 w-2.5 opacity-0 group-hover:opacity-60 transition-opacity" />
                    </button>
                  </Tooltip>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-auto pt-4 border-t border-[var(--border)]">
          <Tooltip content="Edit program details">
            <Button variant="secondary" size="sm" onClick={() => onEdit(program)}>
              Edit
            </Button>
          </Tooltip>
          <Tooltip content={program.is_active ? 'Deactivate this program' : 'Activate this program'}>
            <Button
              variant={program.is_active ? 'danger' : 'gold'}
              size="sm"
              onClick={() => onToggle(program.id)}
            >
              {program.is_active ? 'Deactivate' : 'Activate'}
            </Button>
          </Tooltip>
        </div>
      </Card>

      {editingGrade && (
        <GradeEditModal grade={editingGrade} onClose={() => setEditingGrade(null)} />
      )}
    </>
  );
}
