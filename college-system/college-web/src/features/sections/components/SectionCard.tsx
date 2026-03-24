'use client';

import { Section } from '../types/sections.types';
import { Card, Badge, Button, Tooltip } from '@/components/ui';

export interface SectionCardProps {
  section: Section;
  onEdit: (section: Section) => void;
  onToggle: (id: string) => void;
}

export function SectionCard({ section, onEdit, onToggle }: SectionCardProps) {
  const badgeVariant = section.isActive ? 'success' : 'danger';
  const toggleVariant = section.isActive ? 'danger' : 'gold';

  return (
    <Card hoverable className="flex flex-col h-full bg-[var(--surface-container-lowest)] p-5">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-display text-2xl font-bold text-[var(--text)] mb-3">
            Section {section.name}
          </h3>
          <div className="flex flex-wrap gap-2 items-center">
            <Badge variant="info">{section.grade?.name || 'Unknown Grade'}</Badge>
            <Badge variant="neutral">{section.grade?.program?.name || 'Unknown Program'}</Badge>
            <Badge variant="neutral">{section.grade?.program?.campus?.name || 'Unknown Campus'}</Badge>
            <Badge variant={badgeVariant}>{section.isActive ? 'Active' : 'Inactive'}</Badge>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-3 my-3">
        {section.roomNumber && (
          <div className="flex items-center gap-2">
            <span className="font-body text-sm font-semibold text-[var(--text-muted)]">Room:</span>
            <span className="font-body text-sm text-[var(--text)]">{section.roomNumber}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="font-body text-sm font-semibold text-[var(--text-muted)]">Capacity:</span>
          <span className="font-body text-sm text-[var(--text)]">{section.capacity}</span>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-auto pt-4 border-t border-[var(--border)]">
        <Tooltip content="Edit section details">
          <Button variant="secondary" size="sm" onClick={() => onEdit(section)}>
            Edit
          </Button>
        </Tooltip>

        <Tooltip content={section.isActive ? 'Deactivate this section' : 'Activate this section'}>
          <Button variant={toggleVariant} size="sm" onClick={() => onToggle(section.id)}>
            {section.isActive ? 'Deactivate' : 'Activate'}
          </Button>
        </Tooltip>
      </div>
    </Card>
  );
}
