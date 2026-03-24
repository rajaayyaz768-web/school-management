'use client';

import { useState, useEffect } from 'react';
import { Student, CreateStudentInput, UpdateStudentInput, Gender } from '../types/students.types';
import { useCreateStudent, useUpdateStudent } from '../hooks/useStudents';
import { useCampuses } from '@/features/campus/hooks/useCampus';
import { usePrograms } from '@/features/programs/hooks/usePrograms';
import { useProgramGrades } from '@/features/sections/hooks/useSections';
import { Button, Input, Select, DatePicker, PhoneInput, Textarea } from '@/components/ui';

export interface StudentFormProps {
  student?: Student;
  onSuccess: (temporaryPassword?: string) => void;
  onCancel: () => void;
}

export function StudentForm({ student, onSuccess, onCancel }: StudentFormProps) {
  const isEdit = !!student;

  const [firstName, setFirstName] = useState(student?.firstName || '');
  const [lastName, setLastName] = useState(student?.lastName || '');
  const [gender, setGender] = useState<Gender>(student?.gender || 'MALE');
  const [dob, setDob] = useState(student?.dob ? student.dob.split('T')[0] : '');

  // Cascading Selection State
  // Infer grade conceptually backwards if modifying, but normally handled dynamically
  const [campusId, setCampusId] = useState(student?.campus.id || '');
  const [programId, setProgramId] = useState('');
  const [gradeId, setGradeId] = useState(''); // Note: this is typically derived, but edit won't strictly enforce

  // Removed useEffect attempting to forcefully cast student properties



  const [email, setEmail] = useState(student?.user?.email || '');
  const [phone, setPhone] = useState(student?.phone || '');
  const [guardianPhone, setGuardianPhone] = useState(student?.guardianPhone || '');
  const [rankingMarks, setRankingMarks] = useState(student?.rankingMarks?.toString() || '');
  
  const [address, setAddress] = useState(student?.address || '');
  const [photoUrl, setPhotoUrl] = useState(student?.photoUrl || '');

  const { data: campuses = [], isLoading: loadingCampuses } = useCampuses();
  const { data: programs = [], isLoading: loadingPrograms } = usePrograms(campusId || undefined);
  const { data: grades = [], isLoading: loadingGrades } = useProgramGrades(programId || undefined);

  // Cascading reset handlers
  const handleCampusChange = (val: string) => {
    setCampusId(val);
    setProgramId('');
    setGradeId('');
  };

  const handleProgramChange = (val: string) => {
    setProgramId(val);
    setGradeId('');
  };

  const createMutation = useCreateStudent();
  const updateMutation = useUpdateStudent();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEdit && student) {
      const payload: UpdateStudentInput = {
        firstName,
        lastName,
        gender,
        campusId,
        dob: dob ? new Date(dob).toISOString() : undefined,
        phone: phone || undefined,
        guardianPhone: guardianPhone || undefined,
        address: address || undefined,
        photoUrl: photoUrl || undefined,
        rankingMarks: rankingMarks ? parseFloat(rankingMarks) : undefined,
      };

      updateMutation.mutate(
        { id: student.id, data: payload },
        { onSuccess: () => onSuccess() } // no password generated on update
      );
    } else {
      const payload: CreateStudentInput = {
        firstName,
        lastName,
        gender,
        email,
        campusId,
        gradeId, // Used as context resolver natively
        dob: dob ? new Date(dob).toISOString() : undefined,
        phone: phone || undefined,
        guardianPhone: guardianPhone || undefined,
        address: address || undefined,
        photoUrl: photoUrl || undefined,
        rankingMarks: rankingMarks ? parseFloat(rankingMarks) : undefined,
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
        <Select
          label="Gender"
          options={genderOptions}
          value={gender}
          onChange={(e) => setGender(e.target.value as Gender)}
          required
          disabled={isPending}
        />
        <DatePicker
          label="Date of Birth"
          value={dob || undefined}
          onChange={(val: string) => setDob(val)}
          disabled={isPending}
        />
      </div>

      {/* Row 3 - Cascading Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select
          label="Campus"
          value={campusId}
          onChange={(e) => handleCampusChange(e.target.value)}
          options={campuses.map(c => ({ label: c.name, value: c.id }))}
          required
          disabled={isPending || loadingCampuses}
          placeholder={loadingCampuses ? 'Loading...' : 'Select campus'}
        />
        <Select
          label="Program"
          value={programId}
          onChange={(e) => handleProgramChange(e.target.value)}
          options={programs.map(p => ({ label: p.name, value: p.id }))}
          required={!isEdit} // Relaxed in edit mode if structural gap exists
          disabled={!campusId || isPending || loadingPrograms || (isEdit && !programId && programs.length === 0)}
          placeholder={!campusId ? 'Select campus first' : loadingPrograms ? 'Loading...' : 'Select program'}
        />
        <Select
          label="Grade"
          value={gradeId}
          onChange={(e) => setGradeId(e.target.value)}
          options={grades.map(g => ({ label: g.name, value: g.id }))}
          required={!isEdit} // Resolving context rigidly only during Create workflow
          disabled={!programId || isPending || loadingGrades || isEdit}
          placeholder={!programId ? 'Select program' : loadingGrades ? 'Loading...' : 'Select grade'}
        />
      </div>

      {/* Row 4 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          type="email"
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required={!isEdit}
          disabled={isEdit || isPending}
          hint={!isEdit ? 'Used for student login' : 'Email cannot be modified'}
        />
        <PhoneInput
          label="Phone"
          value={phone}
          onChange={(val: string) => setPhone(val)}
          disabled={isPending}
        />
      </div>

      {/* Row 5 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PhoneInput
          label="Guardian / Parent Phone"
          value={guardianPhone}
          onChange={(val: string) => setGuardianPhone(val)}
          disabled={isPending}
        />
        <Input
          type="number"
          label="Ranking Marks"
          value={rankingMarks}
          onChange={(e) => setRankingMarks(e.target.value)}
          min={0}
          max={1100}
          step="0.01"
          hint="Matric or admission test marks (used for section assignment)"
          disabled={isPending}
        />
      </div>

      {/* Row 6 */}
      <div>
        <Textarea
          label="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          disabled={isPending}
          className="w-full"
        />
      </div>

      {/* Row 7 */}
      <div>
        <Input
          label="Photo URL"
          value={photoUrl}
          onChange={(e) => setPhotoUrl(e.target.value)}
          hint="Cloudinary URL of student photo"
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
          {isEdit ? 'Save Changes' : 'Enroll Student'}
        </Button>
      </div>
    </form>
  );
}
