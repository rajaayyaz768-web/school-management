'use client';

import { useState } from 'react';
import { Program } from '../types/programs.types';
import { useCreateProgram, useUpdateProgram } from '../hooks/usePrograms';
import { useCampuses } from '@/features/campus/hooks/useCampus';
import { Button, Input, Select } from '@/components/ui';

export interface ProgramFormProps {
  program?: Program;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProgramForm({ program, onSuccess, onCancel }: ProgramFormProps) {
  const isEdit = !!program;

  const [campusId, setCampusId] = useState(program?.campus_id || '');
  const [name, setName] = useState(program?.name || '');
  const [code, setCode] = useState(program?.code || '');
  const [durationYears, setDurationYears] = useState(program?.durationYears?.toString() || '2');

  const { data: campuses = [], isLoading: isLoadingCampuses } = useCampuses();

  const selectedCampus = campuses.find(c => c.id === campusId);
  const isSchool = selectedCampus?.campus_type === 'SCHOOL';
  
  const createMutation = useCreateProgram();
  const updateMutation = useUpdateProgram();

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEdit) {
      updateMutation.mutate(
        {
          id: program.id,
          data: { 
            campus_id: campusId, 
            name, 
            code, 
            durationYears: parseInt(durationYears, 10) 
          },
        },
        {
          onSuccess: () => onSuccess(),
        }
      );
    } else {
      createMutation.mutate(
        { 
          campus_id: campusId, 
          name, 
          code, 
          durationYears: parseInt(durationYears, 10) 
        },
        {
          onSuccess: () => onSuccess(),
        }
      );
    }
  };

  const campusOptions = campuses.map((c) => ({
    label: c.name,
    value: c.id,
  }));

  const durationOptions = [
    { label: '1 Year', value: '1' },
    { label: '2 Years', value: '2' },
    { label: '3 Years', value: '3' },
    { label: '4 Years', value: '4' },
    { label: '5 Years', value: '5' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        label="Campus"
        value={campusId}
        onChange={(e) => setCampusId(e.target.value)}
        options={campusOptions}
        required
        disabled={isLoadingCampuses || isPending}
        placeholder={isLoadingCampuses ? 'Loading campuses...' : 'Select a campus'}
      />

      <Input
        label={isSchool ? 'Group Name' : 'Program Name'}
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        placeholder={isSchool ? 'e.g. Primary, Middle, Matric' : 'e.g. FSc Pre-Medical'}
        disabled={isPending}
      />

      <Input
        label={isSchool ? 'Group Code' : 'Program Code'}
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        required
        hint={isSchool ? 'Short uppercase code e.g. PRIMARY, MIDDLE' : 'Short uppercase code e.g. FSPM, ICS, FA'}
        placeholder={isSchool ? 'e.g. PRIMARY' : 'e.g. FSPM'}
        disabled={isPending}
      />

      {!isSchool && (
        <Select
          label="Duration (Years)"
          value={durationYears}
          onChange={(e) => setDurationYears(e.target.value)}
          options={durationOptions}
          required
          disabled={isPending}
        />
      )}

      <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)] mt-6">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={isPending}>
          {isEdit ? 'Save Changes' : isSchool ? 'Create Class Group' : 'Create Program'}
        </Button>
      </div>
    </form>
  );
}
