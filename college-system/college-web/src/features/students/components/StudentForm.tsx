'use client';

import { useState } from 'react';
import { Student, CreateStudentInput, UpdateStudentInput, Gender } from '../types/students.types';
import { useCreateStudent, useUpdateStudent, useSectionsByGrade } from '../hooks/useStudents';
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

  const [campusId, setCampusId] = useState(student?.campus.id || '');
  const [programId, setProgramId] = useState('');
  const [gradeId, setGradeId] = useState('');

  const [email, setEmail] = useState(student?.user?.email || '');
  const [phone, setPhone] = useState(student?.phone || '');
  const [guardianPhone, setGuardianPhone] = useState(student?.guardianPhone || '');
  const [fatherName, setFatherName] = useState(student?.fatherName || '');
  const [fatherCnic, setFatherCnic] = useState(student?.fatherCnic || '');
  const [rankingMarks, setRankingMarks] = useState(student?.rankingMarks?.toString() || '');
  const [address, setAddress] = useState(student?.address || '');
  const [photoUrl, setPhotoUrl] = useState(student?.photoUrl || '');

  // Direct-assign (legacy import) state
  const [isDirectAssign, setIsDirectAssign] = useState(false);
  const [directSectionId, setDirectSectionId] = useState('');

  const { data: campuses = [], isLoading: loadingCampuses } = useCampuses();
  const { data: programs = [], isLoading: loadingPrograms } = usePrograms(campusId || undefined);
  const { data: grades = [], isLoading: loadingGrades } = useProgramGrades(programId || undefined);
  const { data: gradeSections = [], isLoading: loadingSections } = useSectionsByGrade(
    !isEdit && isDirectAssign ? gradeId : undefined
  );

  const handleCampusChange = (val: string) => {
    setCampusId(val);
    setProgramId('');
    setGradeId('');
    setDirectSectionId('');
  };

  const handleProgramChange = (val: string) => {
    setProgramId(val);
    setGradeId('');
    setDirectSectionId('');
  };

  const handleGradeChange = (val: string) => {
    setGradeId(val);
    setDirectSectionId('');
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
        fatherName: fatherName || undefined,
        fatherCnic: fatherCnic || undefined,
        address: address || undefined,
        photoUrl: photoUrl || undefined,
        rankingMarks: rankingMarks ? parseFloat(rankingMarks) : undefined,
      };
      updateMutation.mutate({ id: student.id, data: payload }, { onSuccess: () => onSuccess() });
    } else {
      const payload: CreateStudentInput = {
        firstName,
        lastName,
        gender,
        email,
        campusId,
        gradeId,
        sectionId: isDirectAssign && directSectionId ? directSectionId : undefined,
        dob: dob ? new Date(dob).toISOString() : undefined,
        phone: phone || undefined,
        guardianPhone: guardianPhone || undefined,
        fatherName: fatherName || undefined,
        fatherCnic: fatherCnic || undefined,
        address: address || undefined,
        photoUrl: photoUrl || undefined,
        rankingMarks: rankingMarks ? parseFloat(rankingMarks) : undefined,
      };
      createMutation.mutate(payload, { onSuccess: (data) => onSuccess(data.temporaryPassword) });
    }
  };

  const genderOptions = [
    { label: 'Male', value: 'MALE' },
    { label: 'Female', value: 'FEMALE' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Row 1 — Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required disabled={isPending} />
        <Input label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required disabled={isPending} />
      </div>

      {/* Row 2 — Gender + DOB */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select label="Gender" options={genderOptions} value={gender} onChange={(e) => setGender(e.target.value as Gender)} required disabled={isPending} />
        <DatePicker label="Date of Birth" value={dob || undefined} onChange={(val: string) => setDob(val)} disabled={isPending} />
      </div>

      {/* Row 3 — Campus → Program → Grade cascade */}
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
          required={!isEdit}
          disabled={!campusId || isPending || loadingPrograms}
          placeholder={!campusId ? 'Select campus first' : loadingPrograms ? 'Loading...' : 'Select program'}
        />
        <Select
          label="Grade / Class"
          value={gradeId}
          onChange={(e) => handleGradeChange(e.target.value)}
          options={grades.map(g => ({ label: g.name, value: g.id }))}
          required={!isEdit}
          disabled={!programId || isPending || loadingGrades || isEdit}
          placeholder={!programId ? 'Select program' : loadingGrades ? 'Loading...' : 'Select grade'}
        />
      </div>

      {/* Direct-assign toggle — only in create mode after a grade is selected */}
      {!isEdit && gradeId && (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="direct-assign"
              checked={isDirectAssign}
              onChange={(e) => { setIsDirectAssign(e.target.checked); setDirectSectionId(''); }}
              className="h-4 w-4 accent-[var(--primary)]"
              disabled={isPending}
            />
            <label htmlFor="direct-assign" className="text-sm font-medium text-[var(--text)] cursor-pointer">
              Assign to section immediately
              <span className="ml-1 text-xs text-[var(--text-muted)] font-normal">(for existing students being imported)</span>
            </label>
          </div>
          {isDirectAssign && (
            <Select
              label="Section"
              value={directSectionId}
              onChange={(e) => setDirectSectionId(e.target.value)}
              options={gradeSections.map(s => ({ label: s.name, value: s.id }))}
              required
              disabled={isPending || loadingSections}
              placeholder={loadingSections ? 'Loading sections...' : 'Select section'}
            />
          )}
        </div>
      )}

      {/* Row 4 — Email + Phone */}
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
        <PhoneInput label="Phone" value={phone} onChange={(val: string) => setPhone(val)} disabled={isPending} />
      </div>

      {/* Row 5 — Guardian + Ranking */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PhoneInput label="Guardian / Parent Phone" value={guardianPhone} onChange={(val: string) => setGuardianPhone(val)} disabled={isPending} />
        <Input
          type="number"
          label="Ranking Marks"
          value={rankingMarks}
          onChange={(e) => setRankingMarks(e.target.value)}
          min={0}
          max={1100}
          step="0.01"
          hint="Matric / admission test marks — used to determine section placement"
          disabled={isPending}
        />
      </div>

      {/* Row 6 — Father info (for parent auto-linking) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Father Name"
          value={fatherName}
          onChange={(e) => setFatherName(e.target.value)}
          disabled={isPending}
          hint="Used for parent account auto-linking"
        />
        <Input
          label="Father CNIC"
          value={fatherCnic}
          onChange={(e) => setFatherCnic(e.target.value)}
          placeholder="13 digits without dashes"
          hint="Auto-links siblings when parent registers with same CNIC"
          disabled={isPending}
        />
      </div>

      {/* Row 7 — Address */}
      <div>
        <Textarea label="Address" value={address} onChange={(e) => setAddress(e.target.value)} disabled={isPending} className="w-full" />
      </div>

      {/* Row 8 — Photo */}
      <div>
        <Input label="Photo URL" value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} hint="Cloudinary URL of student photo" disabled={isPending} className="w-full" />
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 pt-6 border-t border-[var(--border)] mt-6">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isPending}>Cancel</Button>
        <Button type="submit" variant="primary" loading={isPending}>
          {isEdit ? 'Save Changes' : isDirectAssign ? 'Enroll & Assign Student' : 'Enroll Student'}
        </Button>
      </div>
    </form>
  );
}
