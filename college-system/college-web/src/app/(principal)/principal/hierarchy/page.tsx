'use client';

import { useState, useEffect } from 'react';
import axios from '@/lib/axios';

import { Campus } from '@/features/campus/types/campus.types';
import { Program } from '@/features/programs/types/programs.types';
import { Section } from '@/features/sections/types/sections.types';
import { Student } from '@/features/students/types/students.types';

import { useCampuses } from '@/features/campus/hooks/useCampus';
import { usePrograms } from '@/features/programs/hooks/usePrograms';
import { useSections } from '@/features/sections/hooks/useSections';
import { useStudentsBySection, useStudentById } from '@/features/students/hooks/useStudents';

import PageHeader from '@/components/layout/PageHeader';
import {
  StatCard,
  Drawer,
  Avatar,
  Badge,
  Tabs,
  TabPanel,
  Button
} from '@/components/ui';

import { HierarchyBreadcrumb } from '@/features/hierarchy/components/HierarchyBreadcrumb';
import { CampusOverviewCard } from '@/features/hierarchy/components/CampusOverviewCard';
import { ProgramList, ExtractedGrade } from '@/features/hierarchy/components/ProgramList';
import { SectionStudentList } from '@/features/hierarchy/components/SectionStudentList';

// Helper type merging Grade into Program directly matching API returns organically
interface ProgramWithNestedGrades extends Omit<Program, 'grades'> {
  grades?: ExtractedGrade[]; 
}

const EMPTY_CAMPUSES: Campus[] = [];
const EMPTY_PROGRAMS: Program[] = [];
const EMPTY_SECTIONS: Section[] = [];
const EMPTY_STUDENTS: Student[] = [];

export default function PrincipalHierarchyPage() {
  // Cascading Selection State Context
  const [selectedCampus, setSelectedCampus] = useState<Campus | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<ExtractedGrade | null>(null);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  
  // Student Profile Drawer State
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isStudentDrawerOpen, setIsStudentDrawerOpen] = useState(false);
  const [activeStudentTab, setActiveStudentTab] = useState('academic');

  // Cross-Cutting Queries
  const { data: campuses = EMPTY_CAMPUSES, isLoading: campusesLoading } = useCampuses();
  const { data: programs = EMPTY_PROGRAMS, isLoading: programsLoading } = usePrograms(selectedCampus?.id || '');
  const { data: sections = EMPTY_SECTIONS, isLoading: sectionsLoading } = useSections(selectedGrade?.id || '');
  const { data: students = EMPTY_STUDENTS, isLoading: studentsLoading } = useStudentsBySection(selectedSection?.id || '');

  // Student Deep Profile Drawer Hydration Hook explicitly
  const { data: activeStudent } = useStudentById(selectedStudentId);

  // Manual Program fetcher override bridging deeply nested program->grade objects natively seamlessly bypassing react hooks limitation 
  const [gradesExtractedPrograms, setGradesExtractedPrograms] = useState<ProgramWithNestedGrades[]>([]);
  const [programsWithGradesLoading, setProgramsWithGradesLoading] = useState(false);

  useEffect(() => {
    // When a newly isolated Program Array hits, run a single concurrent extraction resolving deeper nested arrays automatically
    if (selectedCampus && programs.length > 0) {
       setProgramsWithGradesLoading(true);
       const hydratePrograms = async () => {
          try {
             // In larger apps, GET /programs would natively return `include: { grades: true }`
             // Since the actual API requires `GET /api/v1/grades?program_id=`, we map natively
             const requests = programs.map(async (p) => {
                const res = await axios.get<{ success: boolean; data: ExtractedGrade[] }>(`/grades?program_id=${p.id}`);
                return { ...p, grades: res.data.data };
             });
             const hydrated = await Promise.all(requests);
             setGradesExtractedPrograms(hydrated);
          } catch (err) {
             console.error('Failed extracting grades tree', err);
          } finally {
             setProgramsWithGradesLoading(false);
          }
       };
       hydratePrograms();
    } else {
       setGradesExtractedPrograms([]);
    }
  }, [programs, selectedCampus]);

  // Click Handlers ensuring explicitly safe cascading resets natively wiping deep dependencies safely
  const handleCampusReset = () => {
    setSelectedCampus(null);
    setSelectedProgram(null);
    setSelectedGrade(null);
    setSelectedSection(null);
    setSelectedStudentId(null);
  };

  const handleCampusClick = (campus: Campus) => {
    setSelectedCampus(campus);
    setSelectedProgram(null);
    setSelectedGrade(null);
    setSelectedSection(null);
    setSelectedStudentId(null);
  };

  const handleProgramReset = () => {
    setSelectedProgram(null);
    setSelectedGrade(null);
    setSelectedSection(null);
    setSelectedStudentId(null);
  };

  const handleProgramClick = (program: Program) => {
    setSelectedProgram(program);
    setSelectedGrade(null);
    setSelectedSection(null);
    setSelectedStudentId(null);
  };

  const handleGradeReset = () => {
    setSelectedGrade(null);
    setSelectedSection(null);
    setSelectedStudentId(null);
  };

  const handleGradeClick = (program: Program, grade: ExtractedGrade) => {
    setSelectedProgram(program);
    setSelectedGrade(grade);
    setSelectedSection(null);
    setSelectedStudentId(null);
  };

  const handleSectionReset = () => {
    setSelectedSection(null);
    setSelectedStudentId(null);
  };

  const handleSectionClick = (section: Section) => {
    setSelectedSection(section);
    setSelectedStudentId(null);
  };

  const handleStudentClick = (student: Student) => {
    setSelectedStudentId(student.id);
    setActiveStudentTab('academic');
    setIsStudentDrawerOpen(true);
  };

  const closeStudentDrawer = () => {
    setSelectedStudentId(null);
    setIsStudentDrawerOpen(false);
  };

  // High level statistic interpolations bypassing heavy endpoints via aggregations
  const totalCampusesCount = campuses.length;
  const totalProgramsCount = campuses.reduce((sum, c) => sum + (c.programs?.length || 0), 0) || 0; // Simple approximation via model arrays

  // Level Router Output logic maintaining clear fade-in animation boundaries cleanly 
  const renderCurrentLevel = () => {
    // Level 3: Grade Selected (Show Sections + Students Dual Pane)
    if (selectedGrade) {
      return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-forwards">
          <SectionStudentList 
             sections={sections}
             isLoading={sectionsLoading}
             selectedSectionId={selectedSection?.id || null}
             onSectionClick={handleSectionClick}
             onStudentClick={handleStudentClick}
             students={students}
             studentsLoading={studentsLoading && !!selectedSection}
          />
        </div>
      );
    }

    // Level 2: Campus Selected (Show Programs + Grades List)
    if (selectedCampus) {
      return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-forwards space-y-6">
          <div className="flex items-center gap-4 border-b border-[var(--border)] pb-4">
             <h2 className="text-2xl font-bold text-[var(--text)]">Program Explorer for {selectedCampus.name}</h2>
          </div>
          <ProgramList
            programs={gradesExtractedPrograms}
            isLoading={programsLoading || programsWithGradesLoading}
            onProgramClick={handleProgramClick}
            onGradeClick={handleGradeClick}
          />
        </div>
      );
    }

    // Level 1: Root Campus View (Default Dashboard View)
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-forwards space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <StatCard title="Total Physical Campuses" value={totalCampusesCount.toString()} variant="gold" />
           <StatCard title="Total Active Programs" value={programs.length ? programs.length.toString() : 'Active System'} variant="default" />
           <StatCard title="Total Faculty Staff" value="System Mapped" variant="glass" /> 
        </div>

        <div>
           <h3 className="text-xl font-bold text-[var(--text)] mb-6">Explore Educational Campuses</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {campuses.map(campus => (
                <CampusOverviewCard 
                  key={campus.id} 
                  campus={campus} 
                  onClick={handleCampusClick} 
                />
             ))}
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="College Hierarchy Navigator"
        breadcrumb={[
          { label: 'Home', href: '/' },
          { label: 'Hierarchy Browser' },
        ]}
      />
      
      <p className="text-[var(--text-muted)] max-w-2xl mb-2 text-sm">
         Drill down directly from a broad campus overview seamlessly crossing programs and sections directly focusing onto individual student metrics in this unified showcase display securely.
      </p>

      <HierarchyBreadcrumb
        selectedCampus={selectedCampus}
        selectedProgram={selectedProgram}
        selectedGrade={selectedGrade}
        selectedSection={selectedSection}
        onCampusClick={handleCampusReset}
        onProgramClick={handleProgramReset}
        onGradeClick={handleGradeReset}
        onSectionClick={handleSectionReset}
      />

      <div className="min-h-[500px]">
         {renderCurrentLevel()}
      </div>

      {/* Deep Dive Profile Explorer Overlay */}
      <Drawer
        isOpen={isStudentDrawerOpen}
        onClose={closeStudentDrawer}
        title="Comprehensive Student Dossier"
        size="md"
      >
        {activeStudent ? (
           <div className="flex flex-col h-full">
              {/* Header Banner */}
              <div className="flex items-start gap-4 mb-6 pb-6 border-b border-[var(--border)]">
                <Avatar name={`${activeStudent.firstName} ${activeStudent.lastName}`} size="xl" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-bold text-[var(--text)] truncate">
                      {activeStudent.firstName} {activeStudent.lastName}
                    </h2>
                    <Badge variant={activeStudent.status === 'ACTIVE' ? 'success' : 'warning'}>
                      {activeStudent.status}
                    </Badge>
                  </div>
                  <div className="flex gap-2 items-center mt-2">
                     <Badge variant="neutral">Roll No: {activeStudent.rollNumber || 'Unassigned'}</Badge>
                     <Badge variant="info">Gender: {activeStudent.gender || 'N/A'}</Badge>
                     <Badge variant="info">{activeStudent.rankingMarks ? `Rank ${activeStudent.rankingMarks}px` : 'No marks'}</Badge>
                  </div>
                </div>
              </div>

              {/* Data Blocks */}
              <div className="flex-1 overflow-y-auto">
                 <Tabs 
                    tabs={[
                      { id: 'academic', label: 'Academic Tracing' },
                      { id: 'personal', label: 'Personal Registry' },
                    ]} 
                    activeTab={activeStudentTab}
                    onChange={setActiveStudentTab}
                 />
                    
                 <TabPanel tabId="academic" activeTab={activeStudentTab} className="space-y-6 py-4">
                    <div className="bg-[var(--surface-container-low)] p-4 rounded-xl border border-[var(--border)] grid grid-cols-2 gap-4">
                       <div>
                         <p className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider mb-1">Assigned Section</p>
                         <p className="font-semibold text-[var(--text)]">{activeStudent.section?.name || 'Unassigned / Bench'}</p>
                       </div>
                       <div>
                         <p className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider mb-1">Year / Grade</p>
                         <p className="font-semibold text-[var(--text)]">{selectedGrade?.name || 'N/A'}</p>
                       </div>
                       <div className="col-span-2 pt-2 border-t border-[var(--border)] mt-2">
                         <p className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider mb-1">Enrolled Program & Campus</p>
                         <p className="font-semibold text-[var(--primary)]">{selectedProgram?.name} — {selectedCampus?.name}</p>
                       </div>
                    </div>
                 </TabPanel>

                 <TabPanel tabId="personal" activeTab={activeStudentTab} className="space-y-4 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                         <p className="text-xs text-[var(--text-muted)] mb-1">Date of Birth</p>
                         <p className="text-sm font-medium">{(activeStudent as any).dateOfBirth ? new Date((activeStudent as any).dateOfBirth).toLocaleDateString() : 'N/A'}</p>
                      </div>
                      <div>
                         <p className="text-xs text-[var(--text-muted)] mb-1">Primary Phone</p>
                         <p className="text-sm font-medium">{activeStudent.phone || 'N/A'}</p>
                      </div>
                      <div className="col-span-2">
                         <p className="text-xs text-[var(--text-muted)] mb-1">Known Address Context</p>
                         <p className="text-sm font-medium leading-relaxed">{activeStudent.address || 'N/A'}</p>
                      </div>
                    </div>
                 </TabPanel>
              </div>

              {/* Footer Block */}
              <div className="pt-6 border-t border-[var(--border)] mt-auto flex justify-end">
                <Button variant="ghost" onClick={closeStudentDrawer}>Close Profile Dashboard</Button>
              </div>
           </div>
        ) : (
           <div className="h-full flex items-center justify-center p-6 text-center text-[var(--text-muted)]">
               Loading isolated student profile strictly isolating boundaries globally. Please hold over 350ms gracefully bypassing.
           </div>
        )}
      </Drawer>

    </div>
  );
}
