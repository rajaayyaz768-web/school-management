'use client';

import { Program } from '../types/programs.types';
import { Card, Badge, Button, Tooltip } from '@/components/ui';

export interface ProgramCardProps {
  program: Program;
  onEdit: (program: Program) => void;
  onToggle: (id: string) => void;
}

export function ProgramCard({ program, onEdit, onToggle }: ProgramCardProps) {
  // Sort grades by displayOrder safely
  const sortedGrades = [...(program.grades || [])].sort(
    (a, b) => a.displayOrder - b.displayOrder
  );

  return (
    <Card hoverable className="flex flex-col h-full bg-[var(--surface-container-lowest)] p-5">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-display text-xl font-semibold text-[var(--text)] mb-2">
            {program.name}
          </h3>
          <div className="flex flex-wrap gap-2 items-center">
             <Badge variant="info">{program.code}</Badge>
             <Badge variant="neutral">{program.campus?.name || 'Unknown Campus'}</Badge>
             <Badge variant={program.is_active ? 'success' : 'danger'}>
               {program.is_active ? 'Active' : 'Inactive'}
             </Badge>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-4 my-2">
        <div className="flex items-center gap-2">
           <span className="font-body text-sm font-semibold text-[var(--text-muted)]">Duration:</span>
           <span className="font-body text-sm text-[var(--text)]">{program.durationYears} Years</span>
        </div>
        
        {sortedGrades.length > 0 && (
          <div>
            <span className="font-body text-sm font-semibold text-[var(--text-muted)] block mb-2">Grades:</span>
            <div className="flex flex-wrap gap-2">
              {sortedGrades.map((grade) => (
                <span 
                  key={grade.id} 
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20"
                >
                  {grade.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 mt-auto pt-4 border-t border-[var(--border)]">
        <Tooltip content="Edit program details">
          <Button variant="secondary" size="sm" onClick={() => onEdit(program)}>
            Edit
          </Button>
        </Tooltip>

        <Tooltip content={program.is_active ? 'Deactivate this program' : 'Activate this program'}>
          <Button
            variant={program.is_active ? 'danger' : 'gold'}
            size="sm"
            onClick={() => onToggle(program.id)}
          >
            {program.is_active ? 'Deactivate' : 'Activate'}
          </Button>
        </Tooltip>
      </div>
    </Card>
  );
}
