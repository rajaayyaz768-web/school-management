'use client';

import { Program } from '@/features/programs/types/programs.types';
import { Card, Badge, Skeleton, EmptyState } from '@/components/ui';
import { GraduationCap } from 'lucide-react';

export interface ExtractedGrade {
  id: string;
  name: string;
  displayOrder: number;
}

// Ensure the incoming API shapes represent the grades gracefully
interface ProgramWithNestedGrades extends Program {
  grades?: ExtractedGrade[]; 
}

interface ProgramListProps {
  programs: ProgramWithNestedGrades[];
  isLoading: boolean;
  onProgramClick: (program: Program) => void;
  onGradeClick: (program: Program, grade: ExtractedGrade) => void;
}

export function ProgramList({
  programs,
  isLoading,
  onProgramClick,
  onGradeClick,
}: ProgramListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-48 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!programs || programs.length === 0) {
    return (
      <EmptyState
        title="No programs found for this campus"
        description="Select a different campus or add programs to continue your exploration."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {programs.map((program) => (
        <Card key={program.id} className="flex flex-col h-full border-[var(--border)] hover:shadow-sm transition-shadow">
          <div 
            className="cursor-pointer mb-4"
            onClick={() => onProgramClick(program)}
          >
             <div className="flex items-start justify-between mb-3">
               <div className="p-2.5 bg-[var(--warning-tint)] rounded-lg text-[var(--warning)]">
                 <GraduationCap className="w-5 h-5" />
               </div>
               <Badge variant={program.isActive ? 'success' : 'danger'}>
                 {program.isActive ? 'Active' : 'Inactive'}
               </Badge>
             </div>
             
             <h3 className="text-lg font-bold text-[var(--text)] mb-1 hover:text-[var(--primary)] transition-colors">
               {program.name}
             </h3>
             <div className="flex gap-2">
               <Badge variant="neutral">{program.code}</Badge>
             </div>
          </div>

          {/* Grades Drilldown Options */}
          <div className="mt-auto pt-4 border-t border-[var(--border)]">
             <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">
               Explore Grades
             </div>
             <div className="flex flex-wrap gap-2">
               {program.grades && program.grades.length > 0 ? (
                 program.grades.map((grade) => (
                   <button
                     key={grade.id}
                     onClick={(e) => {
                       e.stopPropagation();
                       onGradeClick(program, grade);
                     }}
                     className="px-3 py-1.5 bg-[var(--surface-container-high)] hover:bg-[var(--primary)] hover:text-white border border-[var(--border)] rounded-full text-sm font-medium transition-colors"
                   >
                     {grade.name}
                   </button>
                 ))
               ) : (
                 <span className="text-sm text-[var(--text-muted)] italic">No grades configured</span>
               )}
             </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
