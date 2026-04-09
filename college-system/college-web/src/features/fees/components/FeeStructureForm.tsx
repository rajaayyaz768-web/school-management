import { useState, useEffect } from 'react';
import { Button, Input, Select } from '@/components/ui';
import { FeeStructureResponse, CreateFeeStructureInput, UpdateFeeStructureInput } from '../types/fees.types';
import { useCampuses } from '@/features/campus/hooks/useCampus';
import { usePrograms } from '@/features/programs/hooks/usePrograms';
import { useCreateFeeStructure, useUpdateFeeStructure } from '../hooks/useFees';
import axios from '@/lib/axios';
import { useQuery } from '@tanstack/react-query';

interface Props {
  structure?: FeeStructureResponse;
  onSuccess: () => void;
  onCancel: () => void;
}

export function FeeStructureForm({ structure, onSuccess, onCancel }: Props) {
  const [campusId, setCampusId] = useState(structure?.campusId ?? '');
  const [programId, setProgramId] = useState(structure?.programId ?? '');
  const [gradeId, setGradeId] = useState(structure?.gradeId ?? '');
  const [academicYear, setAcademicYear] = useState(structure?.academicYear ?? '2025-2026');
  
  const [admissionFee, setAdmissionFee] = useState(structure?.admissionFee.toString() ?? '0');
  const [tuitionFee, setTuitionFee] = useState(structure?.tuitionFee.toString() ?? '0');
  const [examFee, setExamFee] = useState(structure?.examFee.toString() ?? '0');
  const [miscFee, setMiscFee] = useState(structure?.miscFee.toString() ?? '0');
  const [lateFeePerDay, setLateFeePerDay] = useState(structure?.lateFeePerDay.toString() ?? '0');

  const { data: campuses } = useCampuses();
  const { data: programs } = usePrograms(campusId);
  
  // Fetch grades based on program
  const { data: grades } = useQuery<{ id: string; name: string }[]>({
    queryKey: ['grades', programId],
    queryFn: async () => {
      if (!programId) return [];
      const res = await axios.get(`/api/v1/grades?program_id=${programId}`);
      return res.data.data;
    },
    enabled: !!programId,
  });

  const createMutation = useCreateFeeStructure();
  const updateMutation = useUpdateFeeStructure();

  const isEditing = !!structure;

  const totalFee = 
    (parseFloat(admissionFee) || 0) + 
    (parseFloat(tuitionFee) || 0) + 
    (parseFloat(examFee) || 0) + 
    (parseFloat(miscFee) || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing) {
      const data: UpdateFeeStructureInput = {
        admissionFee: parseFloat(admissionFee),
        tuitionFee: parseFloat(tuitionFee),
        examFee: parseFloat(examFee),
        miscFee: parseFloat(miscFee),
        lateFeePerDay: parseFloat(lateFeePerDay),
      };
      updateMutation.mutate({ id: structure.id, data }, {
        onSuccess,
      });
    } else {
      const data: CreateFeeStructureInput = {
        campusId,
        programId,
        gradeId,
        academicYear,
        admissionFee: parseFloat(admissionFee) || 0,
        tuitionFee: parseFloat(tuitionFee) || 0,
        examFee: parseFloat(examFee) || 0,
        miscFee: parseFloat(miscFee) || 0,
        lateFeePerDay: parseFloat(lateFeePerDay) || 0,
      };
      createMutation.mutate(data, {
        onSuccess,
      });
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Campus"
          value={campusId ?? ''}
          onChange={(e) => {
            setCampusId(e.target.value);
            setProgramId('');
            setGradeId('');
          }}
          options={(campuses || []).map(c => ({ value: c.id, label: c.name }))}
          disabled={isEditing}
          required
        />
        <Select
          label="Program"
          value={programId ?? ''}
          onChange={(e) => {
            setProgramId(e.target.value);
            setGradeId('');
          }}
          options={(programs || []).map(p => ({ value: p.id, label: p.name }))}
          disabled={isEditing || !campusId}
          required
        />
        <Select
          label="Grade"
          value={gradeId ?? ''}
          onChange={(e) => setGradeId(e.target.value)}
          options={(grades || []).map(g => ({ value: g.id, label: g.name }))}
          disabled={isEditing || !programId}
          required
        />
        <Input
          label="Academic Year"
          value={academicYear ?? ''}
          onChange={(e) => setAcademicYear(e.target.value)}
          placeholder="e.g. 2025-2026"
          disabled={isEditing}
          required
        />
      </div>

      <div className="border-t border-[var(--border)] my-6" />
      <h3 className="text-sm font-semibold mb-4 text-[var(--text)]">Fee Breakdown (PKR)</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <Input
          label="Admission Fee"
          type="number"
          min="0"
          value={admissionFee ?? ''}
          onChange={(e) => setAdmissionFee(e.target.value)}
          required
        />
        <Input
          label="Tuition Fee"
          type="number"
          min="0"
          value={tuitionFee ?? ''}
          onChange={(e) => setTuitionFee(e.target.value)}
          required
        />
        <Input
          label="Exam Fee"
          type="number"
          min="0"
          value={examFee ?? ''}
          onChange={(e) => setExamFee(e.target.value)}
          required
        />
        <Input
          label="Miscellaneous Fee"
          type="number"
          min="0"
          value={miscFee ?? ''}
          onChange={(e) => setMiscFee(e.target.value)}
          required
        />
        <Input
          label="Late Fee Per Day"
          type="number"
          min="0"
          value={lateFeePerDay ?? ''}
          onChange={(e) => setLateFeePerDay(e.target.value)}
          required
        />
      </div>

      <div className="bg-[var(--primary)]/5 p-4 rounded-lg flex justify-between items-center mt-4">
        <span className="font-semibold text-[var(--text)]">Calculated Total Fee:</span>
        <span className="font-bold text-lg text-[var(--primary)]">
          PKR {totalFee.toLocaleString()}
        </span>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={isLoading}>
          {isEditing ? 'Update Structure' : 'Create Structure'}
        </Button>
      </div>
    </form>
  );
}
