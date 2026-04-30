'use client';

import { useState } from 'react';
import { Program, Grade, TeachingMode } from '../types/programs.types';
import { useUpdateGrade, useCreateGrade, useDeleteGrade, useDeleteProgram } from '../hooks/usePrograms';
import { Card, Badge, Button, Tooltip, ConfirmDialog } from '@/components/ui';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Pencil, Plus, Trash2, X } from 'lucide-react';

export interface ProgramCardProps {
  program: Program;
  onEdit: (program: Program) => void;
  onToggle: (id: string) => void;
  onDelete?: (id: string) => void;
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
  const [displayOrder, setDisplayOrder] = useState(String(grade.displayOrder ?? 1));

  const handleSave = () => {
    updateGrade.mutate(
      {
        gradeId: grade.id,
        data: {
          teaching_mode: teachingMode ? (teachingMode as TeachingMode) : undefined,
          is_transitional: isTransitional,
          displayOrder: displayOrder ? parseInt(displayOrder, 10) : undefined,
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
          <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
            Order in Promotion Chain
          </label>
          <Input
            type="number"
            min={1}
            value={displayOrder}
            onChange={e => setDisplayOrder(e.target.value)}
            hint="Lower number = earlier in chain. Class 1 = 1, Class 2 = 2, … Class 10 = 10"
          />
        </div>

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

function AddClassModal({ programId, onClose }: { programId: string; onClose: () => void }) {
  const createGrade = useCreateGrade();
  const [classNum, setClassNum] = useState('');
  const [customName, setCustomName] = useState('');

  const derivedName = classNum ? `Class ${classNum}` : customName;

  const handleSave = () => {
    if (!derivedName.trim()) return;
    createGrade.mutate(
      { programId, name: derivedName.trim(), displayOrder: classNum ? Number(classNum) : undefined },
      { onSuccess: onClose }
    );
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Add Class"
      subtitle="Enter the class number to add it to this group"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} loading={createGrade.isPending} disabled={!derivedName.trim()}>
            Add Class
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="Class Number"
          type="number"
          min={1}
          max={12}
          value={classNum}
          onChange={e => { setClassNum(e.target.value); setCustomName(''); }}
          placeholder="e.g. 1, 2, 3 …"
          hint={classNum ? `Will be saved as "Class ${classNum}"` : ''}
        />
        <p className="text-xs text-[var(--text-muted)] text-center">— or use a custom name —</p>
        <Input
          label="Custom Name"
          value={customName}
          onChange={e => { setCustomName(e.target.value); setClassNum(''); }}
          placeholder="e.g. Nursery, KG, Pre-1"
          disabled={!!classNum}
        />
      </div>
    </Modal>
  );
}

export function ProgramCard({ program, onEdit, onToggle, onDelete }: ProgramCardProps) {
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [addingClass, setAddingClass] = useState(false);
  const [gradeToDelete, setGradeToDelete] = useState<Grade | null>(null);
  const [confirmDeleteProgram, setConfirmDeleteProgram] = useState(false);

  const deleteGradeMutation = useDeleteGrade();
  const deleteProgramMutation = useDeleteProgram();

  const isSchool = program.campus?.campus_type === 'SCHOOL';

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
              <span className="font-body text-sm font-semibold text-[var(--text-muted)] block mb-2">
                {isSchool ? 'Classes:' : 'Grades:'}
              </span>
              <div className="flex flex-wrap gap-2">
                {sortedGrades.map((grade) => (
                  <span
                    key={grade.id}
                    className="group inline-flex items-center gap-1 pl-2.5 pr-1 py-0.5 rounded-full text-xs font-medium bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20"
                  >
                    <button
                      onClick={() => setEditingGrade(grade)}
                      className="inline-flex items-center gap-1 hover:opacity-70 transition-opacity"
                      title="Edit teaching mode"
                    >
                      {grade.name}
                      {grade.isTransitional && <span className="text-purple-500">●</span>}
                      <Pencil className="h-2.5 w-2.5 opacity-0 group-hover:opacity-50 transition-opacity" />
                    </button>
                    <button
                      onClick={() => setGradeToDelete(grade)}
                      className="ml-0.5 rounded-full p-0.5 hover:bg-red-100 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      title={`Remove ${grade.name}`}
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between gap-2 mt-auto pt-4 border-t border-[var(--border)]">
          <Tooltip content="Permanently delete this program">
            <Button
              variant="danger"
              size="sm"
              onClick={() => setConfirmDeleteProgram(true)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </Tooltip>

          <div className="flex gap-2">
            {isSchool && (
              <Tooltip content="Add a new class to this group">
                <Button variant="secondary" size="sm" onClick={() => setAddingClass(true)}>
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add Class
                </Button>
              </Tooltip>
            )}
            <Tooltip content={isSchool ? 'Edit group details' : 'Edit program details'}>
              <Button variant="secondary" size="sm" onClick={() => onEdit(program)}>
                {isSchool ? 'Edit Group' : 'Edit'}
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
        </div>
      </Card>

      {editingGrade && (
        <GradeEditModal grade={editingGrade} onClose={() => setEditingGrade(null)} />
      )}
      {addingClass && (
        <AddClassModal programId={program.id} onClose={() => setAddingClass(false)} />
      )}

      <ConfirmDialog
        isOpen={!!gradeToDelete}
        onClose={() => setGradeToDelete(null)}
        onConfirm={() => {
          if (gradeToDelete) {
            deleteGradeMutation.mutate(gradeToDelete.id, {
              onSuccess: () => setGradeToDelete(null),
            });
          }
        }}
        title={`Remove "${gradeToDelete?.name}"?`}
        message="This will permanently delete the class. This cannot be undone. Make sure there are no sections under this class first."
        confirmText="Remove"
        variant="danger"
        loading={deleteGradeMutation.isPending}
      />

      <ConfirmDialog
        isOpen={confirmDeleteProgram}
        onClose={() => setConfirmDeleteProgram(false)}
        onConfirm={() => {
          deleteProgramMutation.mutate(program.id, {
            onSuccess: () => {
              setConfirmDeleteProgram(false);
              onDelete?.(program.id);
            },
          });
        }}
        title={`Delete "${program.name}"?`}
        message="This will permanently delete the program and all its classes. Make sure there are no sections under it first."
        confirmText="Delete"
        variant="danger"
        loading={deleteProgramMutation.isPending}
      />
    </>
  );
}
