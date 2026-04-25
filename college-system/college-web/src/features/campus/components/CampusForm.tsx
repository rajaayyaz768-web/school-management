'use client';

import { useState } from 'react';
import { Campus, CampusType } from '../types/campus.types';
import { useCreateCampus, useUpdateCampus } from '../hooks/useCampus';
import { Button, Input, Textarea, PhoneInput } from '@/components/ui';

export interface CampusFormProps {
  campus?: Campus;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CampusForm({ campus, onSuccess, onCancel }: CampusFormProps) {
  const isEdit = !!campus;
  
  const [name, setName] = useState(campus?.name || '');
  const [campusCode, setCampusCode] = useState(campus?.campus_code || '');
  const [campusType, setCampusType] = useState<CampusType>(campus?.campus_type || 'COLLEGE');
  const [address, setAddress] = useState(campus?.address || '');
  const [contactNumber, setContactNumber] = useState(campus?.contact_number || '');

  const createMutation = useCreateCampus();
  const updateMutation = useUpdateCampus();

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEdit) {
      updateMutation.mutate(
        {
          id: campus.id,
          data: { name, campus_code: campusCode, campus_type: campusType, address, contact_number: contactNumber },
        },
        {
          onSuccess: () => onSuccess(),
        }
      );
    } else {
      createMutation.mutate(
        { name, campus_code: campusCode, campus_type: campusType, address, contact_number: contactNumber },
        {
          onSuccess: () => onSuccess(),
        }
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Campus Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        placeholder="Enter campus name"
      />

      <Input
        label="Campus Code"
        value={campusCode}
        onChange={(e) => setCampusCode(e.target.value.toUpperCase())}
        required
        hint="Short uppercase code e.g. BOY or GIRL"
        placeholder="e.g. ABC"
      />

      <div>
        <label className="block font-body text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Campus Type</label>
        <div className="flex gap-3">
          {(['COLLEGE', 'SCHOOL'] as CampusType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setCampusType(type)}
              className={`flex-1 py-2.5 rounded-[var(--radius-sm)] border text-sm font-body font-medium transition-colors ${
                campusType === type
                  ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]'
                  : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-strong)]'
              }`}
            >
              {type === 'COLLEGE' ? '🎓 College' : '🏫 School (Class 1–10)'}
            </button>
          ))}
        </div>
        {campusType === 'SCHOOL' && (
          <p className="mt-1.5 text-xs text-[var(--text-muted)]">School campuses support Class 1–10, teaching modes per grade, and the Promotion tool.</p>
        )}
      </div>

      <Textarea
        label="Address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Enter campus address"
      />

      <PhoneInput
        label="Contact Number"
        value={contactNumber}
        onChange={(val) => setContactNumber(val)}
        placeholder="03XXXXXXXXX"
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={isPending}>
          {isEdit ? 'Save Changes' : 'Create Campus'}
        </Button>
      </div>
    </form>
  );
}
