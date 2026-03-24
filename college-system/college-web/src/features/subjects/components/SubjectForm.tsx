'use client';

import { useState } from 'react';
import { Subject, SubjectType } from '../types/subjects.types';
import { useCreateSubject, useUpdateSubject } from '../hooks/useSubjects';
import { Button, Input, Select } from '@/components/ui';

export interface SubjectFormProps {
  subject?: Subject;
  onSuccess: () => void;
  onCancel: () => void;
}

export function SubjectForm({ subject, onSuccess, onCancel }: SubjectFormProps) {
  const isEdit = !!subject;

  const [name, setName] = useState(subject?.name || '');
  const [code, setCode] = useState(subject?.code || '');
  const [type, setType] = useState<string>(subject?.type || 'THEORY');
  const [creditHours, setCreditHours] = useState(subject?.creditHours?.toString() || '3');

  const createMutation = useCreateSubject();
  const updateMutation = useUpdateSubject();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name,
      code,
      type: type as SubjectType,
      creditHours: parseInt(creditHours, 10),
    };

    if (isEdit && subject) {
      updateMutation.mutate(
        { id: subject.id, data: payload },
        { onSuccess }
      );
    } else {
      createMutation.mutate(payload, { onSuccess });
    }
  };

  const typeOptions = [
    { label: 'Theory', value: 'THEORY' },
    { label: 'Practical', value: 'PRACTICAL' },
    { label: 'Both', value: 'BOTH' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Subject Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        placeholder="e.g. Physics"
        disabled={isPending}
      />

      <Input
        label="Subject Code"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        required
        hint="Short uppercase code e.g. PHY, MATH, ENG"
        placeholder="e.g. PHY"
        maxLength={10}
        disabled={isPending}
      />

      <Select
        label="Type"
        value={type}
        onChange={(e) => setType(e.target.value)}
        options={typeOptions}
        required
        disabled={isPending}
      />

      <Input
        label="Credit Hours / Periods per Week"
        type="number"
        min={1}
        max={10}
        value={creditHours}
        onChange={(e) => setCreditHours(e.target.value)}
        required
        placeholder="3"
        disabled={isPending}
      />

      <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)] mt-6">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={isPending}>
          {isEdit ? 'Save Changes' : 'Create Subject'}
        </Button>
      </div>
    </form>
  );
}
