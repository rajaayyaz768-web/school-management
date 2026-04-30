'use client';

import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import { SectionSubjectTeacher, Subject } from '../types/subjects.types';
import { useCreateAssignment, useUpdateAssignment } from '../hooks/useSubjects';
import { useSubjectsByGrade } from '@/features/programs/hooks/usePrograms';
import { Button, Input, Select } from '@/components/ui';

export interface AssignmentFormProps {
  sectionId: string;
  gradeId: string;
  academicYear: string;
  existingAssignments?: SectionSubjectTeacher[];
  assignment?: SectionSubjectTeacher; // set for edit mode
  onSuccess: () => void;
  onCancel: () => void;
}

interface SubjectRow {
  subject: Subject;
  staffId: string;
  included: boolean;
}

export function AssignmentForm({
  sectionId,
  gradeId,
  academicYear,
  existingAssignments = [],
  assignment,
  onSuccess,
  onCancel,
}: AssignmentFormProps) {
  const isEdit = !!assignment;

  const [staffOptions, setStaffOptions] = useState<{ label: string; value: string }[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [rows, setRows] = useState<SubjectRow[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Edit mode state
  const [editStaffId, setEditStaffId] = useState(assignment?.staffId || '');

  const { data: gradeSubjects = [], isLoading: loadingSubjects } = useSubjectsByGrade(gradeId);
  const createMutation = useCreateAssignment();
  const updateMutation = useUpdateAssignment();

  // Load staff
  useEffect(() => {
    let mounted = true;
    setLoadingStaff(true);
    axios.get('/staff', { params: { limit: 200 } })
      .then((res) => {
        if (!mounted) return;
        const data: { id: string; firstName?: string; lastName?: string; staffCode?: string }[] =
          Array.isArray(res.data.data) ? res.data.data : res.data.data?.data || [];
        setStaffOptions(data.map((s) => ({
          label: s.firstName ? `${s.firstName} ${s.lastName || ''}`.trim() : s.staffCode || s.id,
          value: s.id,
        })));
      })
      .finally(() => { if (mounted) setLoadingStaff(false); });
    return () => { mounted = false; };
  }, []);

  // Build rows: only subjects not yet assigned for this section
  useEffect(() => {
    if (isEdit || loadingSubjects) return;
    const assignedSubjectIds = new Set(existingAssignments.map(a => a.subjectId));
    setRows(
      gradeSubjects
        .filter(s => !assignedSubjectIds.has(s.id))
        .map(s => ({ subject: s, staffId: '', included: false }))
    );
  }, [gradeSubjects, existingAssignments, isEdit, loadingSubjects]);

  const updateRow = (idx: number, patch: Partial<SubjectRow>) => {
    setRows(prev => prev.map((r, i) => i === idx ? { ...r, ...patch } : r));
  };

  // ─── EDIT MODE ───────────────────────────────────────────────────────────────
  if (isEdit && assignment) {
    const subjectName = assignment.subject
      ? `${assignment.subject.name} (${assignment.subject.code})`
      : assignment.subjectId;

    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          updateMutation.mutate(
            { id: assignment.id, data: { staffId: editStaffId } },
            { onSuccess }
          );
        }}
        className="space-y-4"
      >
        <Input label="Subject" value={subjectName} readOnly disabled />
        <Select
          label="Teacher"
          value={editStaffId}
          onChange={(e) => setEditStaffId(e.target.value)}
          options={staffOptions}
          required
          disabled={loadingStaff || updateMutation.isPending}
          placeholder={loadingStaff ? 'Loading...' : 'Select a teacher'}
        />
        <Input label="Academic Year" value={academicYear} readOnly disabled />
        <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={updateMutation.isPending}>Cancel</Button>
          <Button type="submit" variant="primary" loading={updateMutation.isPending}>Save Changes</Button>
        </div>
      </form>
    );
  }

  // ─── CREATE MODE (bulk) ───────────────────────────────────────────────────────
  const selectedRows = rows.filter(r => r.included);

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const toAssign = rows.filter(r => r.included);
    if (toAssign.length === 0) return;

    const missing = toAssign.filter(r => !r.staffId);
    if (missing.length > 0) {
      setErrors(missing.map(r => `Select a teacher for ${r.subject.name}`));
      return;
    }
    setErrors([]);
    setSubmitting(true);

    try {
      await Promise.all(
        toAssign.map(r =>
          createMutation.mutateAsync({
            sectionId,
            subjectId: r.subject.id,
            staffId: r.staffId,
            academicYear,
          })
        )
      );
      onSuccess();
    } catch {
      // individual errors shown by mutation's onError toast
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingSubjects) {
    return <p className="text-sm text-[var(--text-muted)] py-6 text-center">Loading curriculum subjects…</p>;
  }

  // No curriculum set up for this grade yet
  if (!loadingSubjects && gradeSubjects.length === 0) {
    return (
      <div className="py-6 text-center space-y-2">
        <p className="text-sm font-medium text-[var(--text)]">No curriculum defined for this grade</p>
        <p className="text-xs text-[var(--text-muted)]">
          Go to <strong>Subjects → Grade Curriculum</strong> tab and add subjects to this grade first.
        </p>
        <div className="flex justify-end mt-4">
          <Button variant="secondary" onClick={onCancel}>Close</Button>
        </div>
      </div>
    );
  }

  // Curriculum exists but all subjects already assigned
  if (rows.length === 0) {
    return (
      <div className="py-6 text-center space-y-2">
        <p className="text-sm font-medium text-[var(--text)]">All subjects assigned</p>
        <p className="text-xs text-[var(--text-muted)]">Every curriculum subject for this grade already has a teacher in this section.</p>
        <div className="flex justify-end mt-4">
          <Button variant="secondary" onClick={onCancel}>Close</Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleBulkSubmit} className="space-y-4">
      <p className="text-xs text-[var(--text-muted)]">
        Tick the subjects you want to assign, then pick a teacher for each.
      </p>

      <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
        {rows.map((row, idx) => (
          <div
            key={row.subject.id}
            className={`flex items-center gap-3 rounded-lg border px-3 py-2 transition-colors ${
              row.included ? 'border-[var(--primary)] bg-[var(--surface-hover)]' : 'border-[var(--border)] bg-[var(--surface)]'
            }`}
          >
            <input
              type="checkbox"
              id={`sub-${row.subject.id}`}
              checked={row.included}
              onChange={e => updateRow(idx, { included: e.target.checked })}
              className="h-4 w-4 accent-[var(--primary)] shrink-0"
            />
            <label
              htmlFor={`sub-${row.subject.id}`}
              className="flex-1 min-w-0 cursor-pointer"
            >
              <span className="font-medium text-sm text-[var(--text)]">{row.subject.name}</span>
              <span className="ml-2 text-xs text-[var(--text-muted)] font-mono">{row.subject.code}</span>
            </label>
            <div className="w-48 shrink-0">
              <select
                value={row.staffId}
                onChange={e => updateRow(idx, { staffId: e.target.value, included: true })}
                disabled={loadingStaff || submitting}
                className="w-full text-sm border border-[var(--border)] rounded-md px-2 py-1.5 bg-[var(--surface)] text-[var(--text)] disabled:opacity-50"
              >
                <option value="">— Teacher —</option>
                {staffOptions.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>

      {errors.length > 0 && (
        <ul className="text-xs text-red-500 space-y-0.5 list-disc list-inside">
          {errors.map((e, i) => <li key={i}>{e}</li>)}
        </ul>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
        <span className="text-xs text-[var(--text-muted)]">
          {selectedRows.length} of {rows.length} selected
        </span>
        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>Cancel</Button>
          <Button
            type="submit"
            variant="primary"
            loading={submitting}
            disabled={selectedRows.length === 0}
          >
            Assign {selectedRows.length > 0 ? `${selectedRows.length} Subject${selectedRows.length > 1 ? 's' : ''}` : 'Subjects'}
          </Button>
        </div>
      </div>
    </form>
  );
}
