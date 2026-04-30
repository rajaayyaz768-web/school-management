'use client';

import { useState } from 'react';
import { Parent, CreateParentInput, UpdateParentInput } from '../types/parents.types';
import { useCreateParent, useUpdateParent } from '../hooks/useParents';
import { Button, Input, PhoneInput, Textarea } from '@/components/ui';

export interface ParentFormProps {
  parent?: Parent;
  onSuccess: (temporaryPassword?: string) => void;
  onCancel: () => void;
}

export function ParentForm({ parent, onSuccess, onCancel }: ParentFormProps) {
  const isEdit = !!parent;

  const [firstName, setFirstName] = useState(parent?.firstName || '');
  const [lastName, setLastName] = useState(parent?.lastName || '');
  const [email, setEmail] = useState(parent?.user?.email || '');
  const [phone, setPhone] = useState(parent?.phone || '');
  const [cnic, setCnic] = useState(parent?.cnic || '');
  const [occupation, setOccupation] = useState(parent?.occupation || '');
  const [address, setAddress] = useState(parent?.address || '');

  const createMutation = useCreateParent();
  const updateMutation = useUpdateParent();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEdit && parent) {
      const payload: UpdateParentInput = {
        firstName,
        lastName,
        phone: phone || undefined,
        cnic: cnic || undefined,
        occupation: occupation || undefined,
        address: address || undefined,
      };

      updateMutation.mutate(
        { id: parent.id, data: payload },
        { onSuccess: () => onSuccess() } // no password generated on update
      );
    } else {
      const payload: CreateParentInput = {
        firstName,
        lastName,
        email,
        phone: phone || undefined,
        cnic: cnic || undefined,
        occupation: occupation || undefined,
        address: address || undefined,
      };

      createMutation.mutate(payload, {
        onSuccess: (data) => onSuccess(data.temporaryPassword)
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
          disabled={isPending}
        />
        <Input
          label="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
          disabled={isPending}
        />
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          type="email"
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required={!isEdit}
          disabled={isEdit || isPending}
          hint={!isEdit ? 'Used for parent login' : 'Email cannot be modified'}
        />
        <PhoneInput
          label="Phone Number"
          value={phone}
          onChange={(val: string) => setPhone(val)}
          disabled={isPending}
        />
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="CNIC"
          value={cnic}
          onChange={(e) => setCnic(e.target.value)}
          hint="13 digits without dashes — auto-links all students with matching Father CNIC"
          disabled={isPending}
        />
        <Input
          label="Occupation"
          value={occupation}
          onChange={(e) => setOccupation(e.target.value)}
          disabled={isPending}
        />
      </div>

      {/* Row 4 */}
      <div>
        <Textarea
          label="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          disabled={isPending}
          className="w-full"
        />
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 pt-6 border-t border-[var(--border)] mt-6">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={isPending}>
          {isEdit ? 'Save Changes' : 'Create Account'}
        </Button>
      </div>
    </form>
  );
}
