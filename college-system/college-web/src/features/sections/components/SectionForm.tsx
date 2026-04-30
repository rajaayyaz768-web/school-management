'use client';

import { useState, useMemo } from 'react';
import { Section } from '../types/sections.types';
import { useCreateSection, useUpdateSection, useProgramGrades, useSections } from '../hooks/useSections';
import { useCampuses } from '@/features/campus/hooks/useCampus';
import { useCampusStore } from '@/store/campusStore';
import { useRole } from '@/store/authStore';
import { usePrograms } from '@/features/programs/hooks/usePrograms';
import { Button, Input, Select } from '@/components/ui';

export interface SectionFormProps {
  section?: Section;
  onSuccess: () => void;
  onCancel: () => void;
}

export function SectionForm({ section, onSuccess, onCancel }: SectionFormProps) {
  const isEdit = !!section;

  const role = useRole();
  const { activeCampusId } = useCampusStore();
  const { data: campuses = [], isLoading: loadingCampuses } = useCampuses();

  const defaultCampusId = section?.grade?.program?.campus?.id
    || (role === 'SUPER_ADMIN' ? (activeCampusId ?? '') : '');

  const [campusId, setCampusId] = useState(defaultCampusId);
  const [programId, setProgramId] = useState(section?.grade?.program?.id || '');
  const [gradeId, setGradeId] = useState(section?.gradeId || '');
  const [name, setName] = useState(section?.name || '');
  const [roomNumber, setRoomNumber] = useState(section?.roomNumber || '');
  const [capacity, setCapacity] = useState(section?.capacity?.toString() || '40');

  const { data: programs = [], isLoading: loadingPrograms } = usePrograms(campusId || undefined);
  const { data: grades = [], isLoading: loadingGrades } = useProgramGrades(programId || undefined);

  // Fetch all sections for this campus to check room conflicts
  const { data: campusSections = [] } = useSections(undefined, campusId || undefined);

  const roomConflict = useMemo(() => {
    const trimmed = roomNumber.trim();
    if (!trimmed) return null;
    return campusSections.find(
      s => s.roomNumber === trimmed && s.id !== section?.id
    ) ?? null;
  }, [roomNumber, campusSections, section?.id]);

  const isSchool = campuses.find(c => c.id === campusId)?.campus_type === 'SCHOOL';

  // Cascading reset logic
  const handleCampusChange = (val: string) => {
    setCampusId(val);
    setProgramId('');
    setGradeId('');
  };

  const handleProgramChange = (val: string) => {
    setProgramId(val);
    setGradeId('');
  };

  const createMutation = useCreateSection();
  const updateMutation = useUpdateSection();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      gradeId,
      name,
      roomNumber: roomNumber.trim() || undefined,
      capacity: parseInt(capacity, 10),
    };

    if (isEdit && section) {
      updateMutation.mutate(
        { id: section.id, data: payload },
        { onSuccess }
      );
    } else {
      createMutation.mutate(payload, { onSuccess });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        label="Campus"
        value={campusId}
        onChange={(e) => handleCampusChange(e.target.value)}
        options={campuses.map((c) => ({ label: c.name, value: c.id }))}
        required
        disabled={loadingCampuses || isPending}
        placeholder={loadingCampuses ? 'Loading campuses...' : 'Select a campus'}
      />

      <Select
        label={isSchool ? 'Class Group' : 'Program'}
        value={programId}
        onChange={(e) => handleProgramChange(e.target.value)}
        options={programs.map((p) => ({ label: p.name, value: p.id }))}
        required
        disabled={!campusId || loadingPrograms || isPending}
        placeholder={!campusId ? 'Select campus first' : loadingPrograms ? 'Loading...' : isSchool ? 'Select a class group' : 'Select a program'}
      />

      <Select
        label={isSchool ? 'Class' : 'Grade'}
        value={gradeId}
        onChange={(e) => setGradeId(e.target.value)}
        options={grades.map((g) => ({ label: g.name, value: g.id }))}
        required
        disabled={!programId || loadingGrades || isPending}
        placeholder={!programId ? (isSchool ? 'Select class group first' : 'Select program first') : loadingGrades ? 'Loading...' : isSchool ? 'Select a class' : 'Select a grade'}
      />

      <Input
        label="Section Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        hint="Single letter e.g. A, B, C, D"
        placeholder="e.g. A"
        maxLength={10}
        disabled={isPending}
      />

      <div className="space-y-1">
        <Input
          label="Room Number"
          value={roomNumber}
          onChange={(e) => setRoomNumber(e.target.value)}
          placeholder="e.g. 101"
          disabled={isPending}
        />
        {roomConflict && (
          <div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700 px-3 py-2 text-xs">
            <span className="mt-0.5 text-amber-500">⚠</span>
            <span className="text-amber-700 dark:text-amber-400">
              Room <strong>{roomNumber.trim()}</strong> is already reserved by{' '}
              <strong>
                Section {roomConflict.name}
                {roomConflict.grade?.program?.name ? ` · ${roomConflict.grade.program.name}` : ''}
                {roomConflict.grade?.name ? ` · ${roomConflict.grade.name}` : ''}
              </strong>
            </span>
          </div>
        )}
      </div>

      <Input
        label="Capacity"
        type="number"
        min={1}
        max={200}
        value={capacity}
        onChange={(e) => setCapacity(e.target.value)}
        required
        placeholder="40"
        disabled={isPending}
      />

      <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)] mt-6">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={isPending}>
          {isEdit ? 'Save Changes' : 'Create Section'}
        </Button>
      </div>
    </form>
  );
}
