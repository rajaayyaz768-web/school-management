'use client';

import { Staff } from '../types/staff.types';
import { Table, Avatar, Badge, Button, Skeleton, EmptyState, Tooltip } from '@/components/ui';
import { KeyRound } from 'lucide-react';

export interface StaffTableProps {
  staffList: Staff[];
  isLoading: boolean;
  onView: (staff: Staff) => void;
  onEdit: (staff: Staff) => void;
  onToggle: (id: string) => void;
  onDelete: (staff: Staff) => void;
}

export function StaffTable({ staffList, isLoading, onView, onEdit, onToggle, onDelete }: StaffTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton variant="text" />
        <Skeleton variant="text" />
        <Skeleton variant="text" />
      </div>
    );
  }

  if (staffList.length === 0) {
    return <EmptyState title="No staff members found." description="Try adjusting your filters or search query." />;
  }

  const getEmploymentBadge = (type: string) => {
    switch (type) {
      case 'PERMANENT': return 'info';
      case 'CONTRACT': return 'warning';
      default: return 'neutral';
    }
  };

  const columns = [
    {
      key: 'staff', header: 'Staff Member', render: (staff: Staff) => {
        const fullName = `${staff.firstName} ${staff.lastName}`;
        return (
          <div className="flex items-center gap-3">
            <Avatar src={staff.photoUrl || undefined} name={fullName} size="sm" />
            <div>
              <span className="font-semibold text-[var(--text)]">{fullName}</span>
              {staff.temporaryPassword && (
                <Tooltip content="Temporary password set — visible in Account tab">
                  <KeyRound className="inline ml-1.5 w-3 h-3 text-amber-500" />
                </Tooltip>
              )}
            </div>
          </div>
        );
      }
    },
    { key: 'code', header: 'Staff Code', render: (staff: Staff) => <span className="font-mono text-sm text-[var(--text-muted)]">{staff.staffCode}</span> },
    { key: 'designation', header: 'Designation', render: (staff: Staff) => <span className="text-[var(--text)] text-sm">{staff.designation || '—'}</span> },
    { key: 'employment', header: 'Employment', render: (staff: Staff) => <Badge variant={getEmploymentBadge(staff.employmentType) as any}>{staff.employmentType}</Badge> },
    {
      key: 'campus', header: 'Campus', render: (staff: Staff) => (
        <span className="text-[var(--text)] text-sm">{staff.campus?.name ?? 'Unassigned'}</span>
      )
    },
    {
      key: 'status', header: 'Status', render: (staff: Staff) => {
        const isActive = staff.user?.isActive ?? false;
        return <Badge variant={isActive ? 'success' : 'danger'}>{isActive ? 'Active' : 'Inactive'}</Badge>;
      }
    },
    {
      key: 'actions', header: 'Actions', className: 'text-right', render: (staff: Staff) => {
        const isActive = staff.user?.isActive ?? false;
        return (
          <div className="flex justify-end gap-1.5">
            <Tooltip content="View full profile & password">
              <Button variant="ghost" size="sm" onClick={() => onView(staff)}>View</Button>
            </Tooltip>
            <Tooltip content="Edit staff details">
              <Button variant="secondary" size="sm" onClick={() => onEdit(staff)}>Edit</Button>
            </Tooltip>
            <Tooltip content={isActive ? 'Deactivate' : 'Activate'}>
              <Button variant={isActive ? 'gold' : 'secondary'} size="sm" onClick={() => onToggle(staff.id)}>
                {isActive ? 'Deactivate' : 'Activate'}
              </Button>
            </Tooltip>
            <Tooltip content="Permanently delete this staff member">
              <Button variant="danger" size="sm" onClick={() => onDelete(staff)}>Delete</Button>
            </Tooltip>
          </div>
        );
      }
    }
  ];

  return (
    <div className="bg-[var(--surface-container-lowest)] rounded-lg border border-[var(--border)] overflow-hidden">
      <Table columns={columns} data={staffList} />
    </div>
  );
}
