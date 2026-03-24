'use client';

import { Parent } from '../types/parents.types';
import { Table, Avatar, Badge, Button, Skeleton, EmptyState, Tooltip } from '@/components/ui';
import { Eye, Edit2 } from 'lucide-react';

interface ParentTableProps {
  parents: Parent[];
  isLoading: boolean;
  onView: (parent: Parent) => void;
  onEdit: (parent: Parent) => void;
}

export function ParentTable({ parents, isLoading, onView, onEdit }: ParentTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!parents || parents.length === 0) {
    return (
      <EmptyState
        title="No parents registered yet"
        description="Try adjusting your search or add a new parent."
      />
    );
  }

  const columns = [
    { key: 'parent', header: 'Parent', render: (parent: Parent) => (
      <div className="flex items-center gap-3">
        <Avatar
          name={`${parent.firstName} ${parent.lastName}`}
          size="md"
        />
        <div>
          <div className="text-sm font-semibold text-[var(--text)]">
            {parent.firstName} {parent.lastName}
          </div>
        </div>
      </div>
    )},
    { key: 'phone', header: 'Phone', render: (parent: Parent) => <span className="text-sm text-[var(--text)]">{parent.phone || '—'}</span> },
    { key: 'students', header: 'Linked Students', render: (parent: Parent) => <Badge variant="info">{parent.studentLinks?.length || 0} student{(parent.studentLinks?.length !== 1) ? 's' : ''}</Badge> },
    { key: 'status', header: 'Account Status', render: (parent: Parent) => <Badge variant={parent.user?.isActive ? 'success' : 'danger'}>{parent.user?.isActive ? 'Active' : 'Disabled'}</Badge> },
    { key: 'actions', header: '', className: 'text-right', render: (parent: Parent) => (
      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Tooltip content="View Profiles">
          <Button variant="ghost" size="sm" onClick={() => onView(parent)} className="h-8 w-8 p-0">
            <Eye className="w-4 h-4" />
          </Button>
        </Tooltip>
        
        <Tooltip content="Edit Details">
          <Button variant="secondary" size="sm" onClick={() => onEdit(parent)} className="h-8 w-8 p-0">
            <Edit2 className="w-4 h-4" />
          </Button>
        </Tooltip>
      </div>
    )}
  ];

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden shadow-sm">
      <Table columns={columns} data={parents} />
    </div>
  );
}
