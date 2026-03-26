'use client';

import { Section } from '@/features/sections/types/sections.types';
import { Student } from '@/features/students/types/students.types';
import { Card, Badge, Skeleton, EmptyState, Table, Avatar } from '@/components/ui';

interface SectionStudentListProps {
  sections: Section[];
  isLoading: boolean;
  selectedSectionId: string | null;
  onSectionClick: (section: Section) => void;
  onStudentClick: (student: Student) => void;
  students: Student[];
  studentsLoading: boolean;
}

export function SectionStudentList({
  sections,
  isLoading,
  selectedSectionId,
  onSectionClick,
  onStudentClick,
  students,
  studentsLoading,
}: SectionStudentListProps) {

  // Left Section List rendering block natively
  const renderSections = () => {
    if (isLoading) {
      return (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      );
    }

    if (!sections || sections.length === 0) {
      return (
        <EmptyState
           title="No sections mapped"
           description="This grade has no connected sections currently."
           className="h-full"
        />
      );
    }

    return (
      <div className="space-y-3 pr-2 overflow-y-auto max-h-[600px] border-r border-[var(--border)]">
        {sections.map(section => {
           const isActive = section.id === selectedSectionId;
           return (
             <div 
               key={section.id} 
               onClick={() => onSectionClick(section)}
               className={`cursor-pointer transition-all duration-200 border rounded-xl overflow-hidden
                 ${isActive ? 'border-[var(--primary)] shadow-md bg-[var(--surface-hover)]' : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)]'}
               `}
             >
                <Card className={`border-0 rounded-none bg-transparent ${isActive ? 'shadow-none' : ''}`}>
                   <div className="flex justify-between items-start">
                     <div>
                       <h4 className={`text-lg font-bold ${isActive ? 'text-[var(--primary)]' : 'text-[var(--text)]'}`}>{section.name}</h4>
                       <div className="text-sm text-[var(--text-muted)] mt-1 flex gap-2">
                          <span>Room: {section.roomNumber || 'TBD'}</span>
                          <span>•</span>
                          <span>Cap: {section.capacity}</span>
                       </div>
                     </div>
                     <Badge variant={isActive ? 'success' : 'neutral'}>
                       {section.capacity} capacity
                     </Badge>
                   </div>
                </Card>
             </div>
           )
        })}
      </div>
    );
  };

  // Right Student List rendering block mapping natively
  const renderStudents = () => {
    if (!selectedSectionId) {
      return (
        <div className="h-full flex items-center justify-center">
            <EmptyState
              title="Select a section to view students"
              description="Choose a section from the left panel to map the enrolled students here."
            />
        </div>
      );
    }

    if (studentsLoading) {
      return (
        <div className="space-y-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      );
    }

    if (!students || students.length === 0) {
      return (
        <div className="h-full flex items-center justify-center">
            <EmptyState
              title="Section is empty"
              description="No active students are permanently assigned to this section structurally yet."
            />
        </div>
      );
    }

    const columns = [
      { key: 'student', header: 'Student Explorer', render: (student: Student) => (
        <div className="flex items-center gap-3 group-hover:text-[var(--primary)] text-[var(--text)] transition-colors">
           <Avatar name={`${student.firstName} ${student.lastName}`} size="md" />
           <div className="font-medium">
             {student.firstName} {student.lastName}
           </div>
        </div>
      )},
      { key: 'rollNumber', header: 'Roll Number', render: (student: Student) => <span className="font-mono text-sm text-[var(--text)]">{student.rollNumber || 'Unassigned'}</span> },
      { key: 'gender', header: 'Gender', render: (student: Student) => <Badge variant="neutral">{student.gender || 'Not specified'}</Badge> },
      { key: 'status', header: 'Status', render: (student: Student) => <Badge variant={student.status === 'ACTIVE' ? 'success' : 'warning'}>{student.status}</Badge> }
    ];

    return (
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden shadow-sm h-full flex flex-col">
        <div className="px-6 py-4 bg-[var(--surface-container-lowest)] border-b border-[var(--border)]">
          <h3 className="font-semibold text-[var(--text)]">Section Rosters ({students.length})</h3>
        </div>
        <div className="overflow-auto flex-1">
            <Table columns={columns} data={students} onRowClick={onStudentClick} className="group" />
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[650px]">
      <div className="lg:col-span-4 h-full">
         {renderSections()}
      </div>
      <div className="lg:col-span-8 h-full bg-[var(--surface-container-lowest)] rounded-xl border border-[var(--border)] p-4 md:p-6 overflow-hidden">
         {renderStudents()}
      </div>
    </div>
  );
}
