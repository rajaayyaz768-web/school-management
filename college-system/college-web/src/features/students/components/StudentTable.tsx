'use client';

import { Student } from '../types/students.types';
import {
  Table,
  Avatar,
  Badge,
  Button,
  Skeleton,
  EmptyState,
  Tooltip,
} from '@/components/ui';
import { Eye, Edit2 } from 'lucide-react';

interface StudentTableProps {
  students: Student[];
  isLoading: boolean;
  onView: (student: Student) => void;
  onEdit: (student: Student) => void;
}

export function StudentTable({ students, isLoading, onView, onEdit }: StudentTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!students || students.length === 0) {
    return (
      <EmptyState
        title="No students found"
        description="Try adjusting your filters or search query."
      />
    );
  }

  const getStatusVariant = (status: Student['status']) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'UNASSIGNED': return 'warning';
      case 'SUSPENDED': return 'danger';
      default: return 'neutral';
    }
  };

  const columns = [
    { key: 'student', header: 'Student', render: (student: Student) => (
      <div className="flex items-center gap-3">
        <Avatar
          src={student.photoUrl || undefined}
          name={`${student.firstName} ${student.lastName}`}
          size="md"
        />
        <div>
          <div className="text-sm font-semibold text-[var(--text)]">
            {student.firstName} {student.lastName}
          </div>
        </div>
      </div>
    ) },
    { key: 'roll_number', header: 'Roll Number', render: (student: Student) => (
      student.rollNumber ? (
        <span className="text-sm text-[var(--text)]">{student.rollNumber}</span>
      ) : (
        <Badge variant="warning">Unassigned</Badge>
      )
    ) },
    { key: 'section', header: 'Section', render: (student: Student) => (
      <span className="text-sm text-[var(--text)]">
        {student.section?.name || '—'}
      </span>
    ) },
    { key: 'campus', header: 'Campus', render: (student: Student) => (
      <span className="text-sm text-[var(--text)]">
        {student.campus.name}
      </span>
    ) },
    { key: 'gender', header: 'Gender', render: (student: Student) => (
      <Badge variant={student.gender === 'MALE' ? 'info' : 'neutral'}>
        {student.gender}
      </Badge>
    ) },
    { key: 'status', header: 'Status', render: (student: Student) => (
      <Badge variant={getStatusVariant(student.status)}>
        {student.status.charAt(0) + student.status.slice(1).toLowerCase()}
      </Badge>
    ) },
    { key: 'actions', header: '', className: 'text-right', render: (student: Student) => (
      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Tooltip content="View Details">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(student)}
            className="h-8 w-8 p-0"
          >
            <Eye className="w-4 h-4" />
          </Button>
        </Tooltip>
        
        <Tooltip content="Edit Student">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onEdit(student)}
            className="h-8 w-8 p-0"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
        </Tooltip>
      </div>
    ) },
  ];

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden shadow-sm">
      <Table columns={columns} data={students} />
    </div>
  );
}
