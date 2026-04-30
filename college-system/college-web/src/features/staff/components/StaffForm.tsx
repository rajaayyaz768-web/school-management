'use client';

import { useState } from 'react';
import { Staff, CreateStaffInput, UpdateStaffInput, Gender, EmploymentType } from '../types/staff.types';
import { useCreateStaff, useUpdateStaff } from '../hooks/useStaff';
import { useCampuses } from '@/features/campus/hooks/useCampus';
import { Button, Input, Select, DatePicker, PhoneInput } from '@/components/ui';
import { extractApiError } from '@/lib/apiError';

export interface StaffFormProps {
  staff?: Staff;
  onSuccess: (temporaryPassword?: string, emailSent?: boolean, emailError?: string | null) => void;
  onCancel: () => void;
}

export function StaffForm({ staff, onSuccess, onCancel }: StaffFormProps) {
  const isEdit = !!staff;

  const [firstName, setFirstName] = useState(staff?.firstName || '');
  const [lastName, setLastName] = useState(staff?.lastName || '');
  const [staffCode, setStaffCode] = useState(staff?.staffCode || '');
  const [designation, setDesignation] = useState(staff?.designation || '');
  const [photoUrlInput, setPhotoUrlInput] = useState(staff?.photoUrl || '');
  const [gender, setGender] = useState<Gender>(staff?.gender || 'MALE');
  const [employmentType, setEmploymentType] = useState<EmploymentType>(staff?.employmentType || 'PERMANENT');
  const [primaryCampusId, setPrimaryCampusId] = useState(staff?.campus?.id || '');
  const [joiningDate, setJoiningDate] = useState(staff?.joiningDate ? staff.joiningDate.split('T')[0] : '');
  const [email, setEmail] = useState(staff?.user?.email || staff?.email || '');
  const [phone, setPhone] = useState(staff?.phone || '');

  const { data: campuses = [], isLoading: loadingCampuses } = useCampuses();
  const createMutation = useCreateStaff();
  const updateMutation = useUpdateStaff();
  const isPending = createMutation.isPending || updateMutation.isPending;

  // Inline field errors
  const [emailError, setEmailError] = useState('');
  const [generalError, setGeneralError] = useState('');

  // Validate email format immediately while typing
  const handleEmailChange = (val: string) => {
    setEmail(val);
    setEmailError('');
    setGeneralError('');
    if (val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      setEmailError('Invalid email address format');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setGeneralError('');

    // Block submit if email format is wrong
    if (!isEdit && emailError) return;

    const cleanPhotoUrl = photoUrlInput.trim() || undefined;

    if (isEdit && staff) {
      const payload: UpdateStaffInput = {
        firstName,
        lastName: lastName || undefined,
        staffCode: staffCode || undefined,
        designation: designation || undefined,
        gender,
        employmentType,
        primaryCampusId,
        joiningDate: joiningDate ? new Date(joiningDate).toISOString() : undefined,
        phone: phone || undefined,
        photoUrl: cleanPhotoUrl,
      };
      updateMutation.mutate(
        { id: staff.id, data: payload },
        {
          onSuccess: () => onSuccess(),
          onError: (err) => setGeneralError(extractApiError(err, 'Failed to update staff')),
        }
      );
    } else {
      const payload: CreateStaffInput = {
        firstName,
        lastName: lastName || undefined,
        ...(staffCode.trim() ? { staffCode: staffCode.trim() } : {}),
        designation: designation || undefined,
        gender,
        employmentType,
        primaryCampusId,
        joiningDate: joiningDate ? new Date(joiningDate).toISOString() : undefined,
        email,
        phone: phone || undefined,
        photoUrl: cleanPhotoUrl,
      };
      createMutation.mutate(payload, {
        onSuccess: (data) => onSuccess(data.temporaryPassword, data.emailSent, data.emailError),
        onError: (err: unknown) => {
          const msg = extractApiError(err, 'Failed to create staff');
          if (msg.toLowerCase().includes('already registered')) {
            setEmailError('This email is already registered in the system');
          } else if (msg.toLowerCase().includes('could not deliver') || msg.toLowerCase().includes('welcome email')) {
            setEmailError(msg);
          } else if (msg.toLowerCase().includes('email')) {
            setEmailError(msg);
          } else {
            setGeneralError(msg);
          }
        },
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
          disabled={isPending}
        />
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isEdit ? (
          <Input
            label="Staff Code"
            value={staffCode}
            onChange={(e) => setStaffCode(e.target.value)}
            hint="Unique employee code"
            disabled={isPending}
          />
        ) : (
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[var(--text-muted)]">Staff Code</label>
            <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--surface-hover)] text-sm text-[var(--text-muted)]">
              Auto-generated (e.g. EMP-001)
            </div>
          </div>
        )}
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
        <div className="space-y-1">
          <Input
            type="email"
            label="Email"
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            required
            hint={!emailError ? "Used for login account" : undefined}
            disabled={isPending || isEdit}
            className={emailError ? 'border-red-400 focus:ring-red-400' : ''}
          />
          {emailError && (
            <p className="text-xs text-red-500 flex items-center gap-1 font-medium">
              <span>⚠</span> {emailError}
            </p>
          )}
        </div>
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
          value={photoUrlInput}
          onChange={(e) => setPhotoUrlInput(e.target.value)}
          hint="Optional — paste a URL to the photo (leave empty to skip)"
          placeholder="https://..."
          disabled={isPending}
          className="w-full"
        />
      </div>

      {/* General error banner */}
      {generalError && (
        <div className="flex items-start gap-2 rounded-md border border-red-300 bg-red-50 dark:bg-red-950/30 dark:border-red-700 px-3 py-2 text-sm text-red-700 dark:text-red-400">
          <span className="font-bold mt-0.5">!</span>
          <span>{generalError}</span>
        </div>
      )}

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
