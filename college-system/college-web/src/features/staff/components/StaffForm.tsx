'use client';

import { useState } from 'react';
import { Staff, CreateStaffInput, UpdateStaffInput, Gender, EmploymentType } from '../types/staff.types';
import { useCreateStaff, useUpdateStaff } from '../hooks/useStaff';
import { useCampuses } from '@/features/campus/hooks/useCampus';
import { Button, Input, Select, DatePicker, PhoneInput } from '@/components/ui';

export interface StaffFormProps {
  staff?: Staff;
  onSuccess: (temporaryPassword?: string) => void;
  onCancel: () => void;
}

export function StaffForm({ staff, onSuccess, onCancel }: StaffFormProps) {
  const isEdit = !!staff;

  const [firstName, setFirstName] = useState(staff?.firstName || '');
  const [lastName, setLastName] = useState(staff?.lastName || '');
  const [staffCode, setStaffCode] = useState(staff?.staffCode || '');
  const [designation, setDesignation] = useState(staff?.designation || '');
  const [gender, setGender] = useState<Gender>(staff?.gender || 'MALE');
  const [employmentType, setEmploymentType] = useState<EmploymentType>(staff?.employmentType || 'PERMANENT');
  const [primaryCampusId, setPrimaryCampusId] = useState(staff?.campus?.id || '');
  const [joiningDate, setJoiningDate] = useState(staff?.joiningDate ? staff.joiningDate.split('T')[0] : '');
  const [email, setEmail] = useState(staff?.user?.email || staff?.email || '');
  const [phone, setPhone] = useState(staff?.phone || '');
  const [photoUrl, setPhotoUrl] = useState(staff?.photoUrl || '');

  const { data: campuses = [], isLoading: loadingCampuses } = useCampuses();
  const createMutation = useCreateStaff();
  const updateMutation = useUpdateStaff();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEdit && staff) {
      const payload: UpdateStaffInput = {
        firstName,
        lastName,
        staffCode,
        designation,
        gender,
        employmentType,
        primaryCampusId,
        joiningDate: joiningDate ? new Date(joiningDate).toISOString() : undefined,
        phone,
        photoUrl,
        email // Optional in update usually, but can be provided
      };

      updateMutation.mutate(
        { id: staff.id, data: payload },
        { onSuccess: () => onSuccess() } // no temp password on edit
      );
    } else {
      const payload: CreateStaffInput = {
        firstName,
        lastName,
        staffCode,
        designation,
        gender,
        employmentType,
        primaryCampusId,
        joiningDate: joiningDate ? new Date(joiningDate).toISOString() : undefined,
        email,
        phone,
        photoUrl
      };

      createMutation.mutate(payload, {
        onSuccess: (data) => onSuccess(data.temporaryPassword)
      });
    }
  };

  const genderOptions = [
    { label: 'Male', value: 'MALE' },
    { label: 'Female', value: 'FEMALE' },
  ];

  const employmentOptions = [
    { label: 'Permanent', value: 'PERMANENT' },
    { label: 'Contract', value: 'CONTRACT' },
    { label: 'Visiting', value: 'VISITING' },
  ];

  const campusOptions = campuses.map(c => ({
    label: c.name,
    value: c.id,
  }));

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
          label="Staff Code"
          value={staffCode}
          onChange={(e) => setStaffCode(e.target.value)}
          required
          hint="Unique employee code e.g. EMP-001"
          disabled={isPending}
        />
        <Input
          label="Designation"
          value={designation}
          onChange={(e) => setDesignation(e.target.value)}
          hint="e.g. Professor, Lecturer"
          disabled={isPending}
        />
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Gender"
          options={genderOptions}
          value={gender}
          onChange={(e) => setGender(e.target.value as Gender)}
          required
          disabled={isPending}
        />
        <Select
          label="Employment Type"
          options={employmentOptions}
          value={employmentType}
          onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
          required
          disabled={isPending}
        />
      </div>

      {/* Row 4 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Campus"
          options={campusOptions}
          value={primaryCampusId}
          onChange={(e) => setPrimaryCampusId(e.target.value)}
          required
          disabled={isPending || loadingCampuses}
          placeholder={loadingCampuses ? 'Loading campuses...' : 'Select a campus'}
        />
        <DatePicker
          label="Date of Joining"
          value={joiningDate || undefined}
          onChange={(val: string) => setJoiningDate(val)}
          disabled={isPending}
        />
      </div>

      {/* Row 5 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          type="email"
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          hint="Used for login account"
          disabled={isPending || isEdit}
        />
        <PhoneInput
          label="Phone"
          value={phone}
          onChange={(val: string) => setPhone(val)}
          disabled={isPending}
        />
      </div>

      {/* Row 6 */}
      <div>
        <Input
          label="Profile Photo URL"
          value={photoUrl}
          onChange={(e) => setPhotoUrl(e.target.value)}
          hint="Cloudinary URL of uploaded photo"
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
          {isEdit ? 'Save Changes' : 'Create Staff'}
        </Button>
      </div>
    </form>
  );
}
