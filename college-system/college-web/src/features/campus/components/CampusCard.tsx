'use client';

import { Campus } from '../types/campus.types';
import { Card, Badge, Button, Tooltip } from '@/components/ui';

export interface CampusCardProps {
  campus: Campus;
  onEdit: (campus: Campus) => void;
  onToggle: (id: string) => void;
}

export function CampusCard({ campus, onEdit, onToggle }: CampusCardProps) {
  return (
    <Card hoverable className="flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-display text-xl font-semibold text-[var(--text)] mb-1">
            {campus.name}
          </h3>
          <div className="flex gap-2 items-center">
            <Badge variant="info">{campus.campus_code}</Badge>
            <Badge variant={campus.is_active ? 'success' : 'danger'}>
              {campus.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-2 mb-6">
        {campus.address && (
          <p className="font-body text-sm text-[var(--text-muted)] line-clamp-2">
            <strong>Address:</strong> {campus.address}
          </p>
        )}
        {campus.contact_number && (
          <p className="font-body text-sm text-[var(--text-muted)]">
            <strong>Contact:</strong> {campus.contact_number}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-2 mt-auto pt-4 border-t border-[var(--border)]">
        <Tooltip content="Edit campus details">
          <Button variant="secondary" size="sm" onClick={() => onEdit(campus)}>
            Edit
          </Button>
        </Tooltip>

        <Tooltip content={campus.is_active ? 'Deactivate this campus' : 'Activate this campus'}>
          <Button
            variant={campus.is_active ? 'danger' : 'gold'}
            size="sm"
            onClick={() => onToggle(campus.id)}
          >
            {campus.is_active ? 'Deactivate' : 'Activate'}
          </Button>
        </Tooltip>
      </div>
    </Card>
  );
}
