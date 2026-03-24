'use client';

import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import { SectionSubjectTeacher } from '../types/subjects.types';
import { useCreateAssignment, useUpdateAssignment, useSubjects } from '../hooks/useSubjects';
import { Button, Input, Select } from '@/components/ui';

export interface AssignmentFormProps {
  sectionId: string;
  academicYear: string;
  assignment?: SectionSubjectTeacher;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AssignmentForm({ sectionId, academicYear, assignment, onSuccess, onCancel }: AssignmentFormProps) {
  const isEdit = !!assignment;

  const [subjectId, setSubjectId] = useState(assignment?.subjectId || '');
  const [staffId, setStaffId] = useState(assignment?.staffId || '');
  const [staffOptions, setStaffOptions] = useState<{ label: string; value: string }[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);

  const { data: subjects = [], isLoading: loadingSubjects } = useSubjects();
  
  const createMutation = useCreateAssignment();
  const updateMutation = useUpdateAssignment();
  const isPending = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    let isMounted = true;
    setLoadingStaff(true);
    axios.get('/staff')
      .then((res) => {
        if (isMounted) {
          const staffData = res.data.data || [];
          setStaffOptions(staffData.map((s: any) => ({
            label: s.firstName ? `${s.firstName} ${s.lastName || ''}` : s.staffCode || s.id,
            value: s.id,
          })));
        }
      })
      .catch((err) => {
        console.error('Failed to load staff profiles:', err);
      })
      .finally(() => {
        if (isMounted) setLoadingStaff(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      sectionId,
      subjectId,
      staffId,
      academicYear,
    };

    if (isEdit && assignment) {
      updateMutation.mutate(
        { id: assignment.id, data: payload },
        { onSuccess }
      );
    } else {
      createMutation.mutate(payload, { onSuccess });
    }
  };

  const subjectOptions = subjects.map((s) => ({
    label: `${s.name} (${s.code})`,
    value: s.id,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        label="Subject"
        value={subjectId}
        onChange={(e) => setSubjectId(e.target.value)}
        options={subjectOptions}
        required
        disabled={loadingSubjects || isPending}
        placeholder={loadingSubjects ? 'Loading subjects...' : 'Select a subject'}
      />

      <Select
        label="Staff / Teacher"
        value={staffId}
        onChange={(e) => setStaffId(e.target.value)}
        options={staffOptions}
        required
        disabled={loadingStaff || isPending}
        placeholder={loadingStaff ? 'Loading staff...' : 'Select a teacher'}
      />

      <Input
        label="Academic Year"
        value={academicYear}
        readOnly
        disabled
        className="bg-[var(--bg-secondary)]"
      />

      <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)] mt-6">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={isPending}>
          {isEdit ? 'Save Changes' : 'Assign Subject'}
        </Button>
      </div>
    </form>
  );
}
