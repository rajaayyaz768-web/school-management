'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import axios from '@/lib/axios';
import { ArrowLeft, ChevronRight, Users, BookOpen, Layers, GraduationCap } from 'lucide-react';

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
  Button,
  Skeleton,
} from '@/components/ui';

import { HierarchyBreadcrumb } from '@/features/hierarchy/components/HierarchyBreadcrumb';
import { CampusOverviewCard } from '@/features/hierarchy/components/CampusOverviewCard';
import { ProgramList, ExtractedGrade } from '@/features/hierarchy/components/ProgramList';
import { SectionStudentList } from '@/features/hierarchy/components/SectionStudentList';
import { cn } from '@/lib/utils';

interface ProgramWithNestedGrades extends Omit<Program, 'grades'> {
  grades?: ExtractedGrade[];
}

const EMPTY_CAMPUSES: Campus[] = [];
const EMPTY_PROGRAMS: Program[] = [];
const EMPTY_SECTIONS: Section[] = [];
const EMPTY_STUDENTS: Student[] = [];
const AVATAR_COLORS = ['bg-[var(--primary)]', 'bg-[var(--gold)]', 'bg-purple-600', 'bg-blue-600', 'bg-rose-600'];

export default function PrincipalHierarchyPage() {
  const [selectedCampus, setSelectedCampus] = useState<Campus | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<ProgramWithNestedGrades | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<ExtractedGrade | null>(null);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isStudentDrawerOpen, setIsStudentDrawerOpen] = useState(false);
  const [activeStudentTab, setActiveStudentTab] = useState('academic');

  const { data: campuses = EMPTY_CAMPUSES, isLoading: campusesLoading } = useCampuses();
  const { data: programs = EMPTY_PROGRAMS, isLoading: programsLoading } = usePrograms(selectedCampus?.id || '');
  const { data: sections = EMPTY_SECTIONS, isLoading: sectionsLoading } = useSections(selectedGrade?.id || '');
  const { data: students = EMPTY_STUDENTS, isLoading: studentsLoading } = useStudentsBySection(selectedSection?.id || '');
  const { data: activeStudent } = useStudentById(selectedStudentId);

  const [gradesExtractedPrograms, setGradesExtractedPrograms] = useState<ProgramWithNestedGrades[]>([]);
  const [programsWithGradesLoading, setProgramsWithGradesLoading] = useState(false);

  useEffect(() => {
    if (selectedCampus && programs.length > 0) {
      setProgramsWithGradesLoading(true);
      const hydratePrograms = async () => {
        try {
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

  // Click handlers
  const handleCampusReset = () => { setSelectedCampus(null); setSelectedProgram(null); setSelectedGrade(null); setSelectedSection(null); setSelectedStudentId(null); };
  const handleCampusClick = (campus: Campus) => { setSelectedCampus(campus); setSelectedProgram(null); setSelectedGrade(null); setSelectedSection(null); setSelectedStudentId(null); };
  const handleProgramReset = () => { setSelectedProgram(null); setSelectedGrade(null); setSelectedSection(null); setSelectedStudentId(null); };
  const handleProgramClick = (program: ProgramWithNestedGrades) => { setSelectedProgram(program); setSelectedGrade(null); setSelectedSection(null); setSelectedStudentId(null); };
  const handleGradeReset = () => { setSelectedGrade(null); setSelectedSection(null); setSelectedStudentId(null); };
  const handleGradeClick = (program: ProgramWithNestedGrades, grade: ExtractedGrade) => { setSelectedProgram(program); setSelectedGrade(grade); setSelectedSection(null); setSelectedStudentId(null); };
  const handleSectionReset = () => { setSelectedSection(null); setSelectedStudentId(null); };
  const handleSectionClick = (section: Section) => { setSelectedSection(section); setSelectedStudentId(null); };
  const handleStudentClick = (student: Student) => { setSelectedStudentId(student.id); setActiveStudentTab('academic'); setIsStudentDrawerOpen(true); };
  const closeStudentDrawer = () => { setSelectedStudentId(null); setIsStudentDrawerOpen(false); };

  const totalCampusesCount = campuses.length;

  // Breadcrumb title for mobile header
  const getHeaderTitle = () => {
    if (selectedGrade) return selectedGrade.name;
    if (selectedProgram) return selectedProgram.name;
    if (selectedCampus) return selectedCampus.name;
    return 'Hierarchy';
  };

  const getBackAction = () => {
    if (selectedGrade) return handleGradeReset;
    if (selectedProgram) return handleProgramReset;
    if (selectedCampus) return handleCampusReset;
    return undefined;
  };

  // ── Render current level ──────────────────────────────────────────
  const renderCurrentLevel = () => {
    // Level 3: Grade → Show Sections + Students
    if (selectedGrade) {
      return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <SectionStudentList
            sections={sections}
            isLoading={sectionsLoading}
            selectedSectionId={selectedSection?.id || null}
            onSectionClick={handleSectionClick}
            onStudentClick={handleStudentClick}
            students={students}
            studentsLoading={studentsLoading && !!selectedSection}
          />
        </motion.div>
      );
    }

    // Level 2: Campus → Show Programs
    if (selectedCampus) {
      return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-5">
          <div className="flex items-center gap-3 border-b border-[var(--border)] pb-4 md:border-0 md:pb-0">
            <h2 className="text-lg md:text-2xl font-bold text-[var(--text)]" style={{ fontFamily: 'var(--font-display)' }}>Programs in {selectedCampus.name}</h2>
          </div>
          <ProgramList
            programs={gradesExtractedPrograms}
            isLoading={programsLoading || programsWithGradesLoading}
            onProgramClick={handleProgramClick}
            onGradeClick={handleGradeClick}
          />
        </motion.div>
      );
    }

    // Level 1: Root Campus View
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-6">
        {/* KPI row — scroll on mobile */}
        <div className="flex overflow-x-auto gap-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-3">
          {[
            { title: 'Campuses', value: totalCampusesCount, icon: <Layers className="w-4 h-4" />, accent: 'text-[var(--gold)]', bg: 'bg-[var(--gold)]/15' },
            { title: 'Programs', value: programs.length || '—', icon: <BookOpen className="w-4 h-4" />, accent: 'text-[var(--primary)]', bg: 'bg-[var(--primary)]/15' },
            { title: 'Faculty', value: 'Mapped', icon: <Users className="w-4 h-4" />, accent: 'text-[var(--text-muted)]', bg: 'bg-[var(--border)]' },
          ].map((kpi, i) => (
            <motion.div key={kpi.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, duration: 0.3 }}
              className="shrink-0 min-w-[140px] sm:min-w-0 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">{kpi.title}</span>
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', kpi.bg, kpi.accent)}>{kpi.icon}</div>
              </div>
              <span className={cn('text-2xl font-bold', kpi.accent)}>{kpi.value}</span>
            </motion.div>
          ))}
        </div>

        {/* Campus cards */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-3 px-1">Explore Campuses</p>
          {campusesLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
            </div>
          ) : (
            <div className="space-y-3 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 md:space-y-0">
              {campuses.map((campus, i) => (
                <motion.button
                  key={campus.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.06, duration: 0.3 }}
                  onClick={() => handleCampusClick(campus)}
                  className="w-full text-left bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 hover:border-[var(--primary)]/30 transition-all active:scale-[0.98] flex items-center gap-4"
                >
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0', AVATAR_COLORS[i % AVATAR_COLORS.length])}>
                    {campus.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[var(--text)] truncate">{campus.name}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate">{campus.address || 'No address'}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[var(--text-muted)] shrink-0" />
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* ── Mobile header ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[var(--bg)]/95 backdrop-blur-md border-b border-[var(--border)] px-4 h-14 flex items-center gap-3 md:hidden">
        {getBackAction() && (
          <button onClick={getBackAction()} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/5 transition-colors shrink-0 active:scale-95">
            <ArrowLeft className="w-5 h-5 text-[var(--text)]" />
          </button>
        )}
        <h1 className="font-bold text-lg text-[var(--text)] truncate" style={{ fontFamily: 'var(--font-display)' }}>{getHeaderTitle()}</h1>
      </header>

      <div className="p-4 sm:p-6 space-y-5">
        {/* Desktop header */}
        <div className="hidden sm:block">
          <PageHeader
            title="College Hierarchy Navigator"
            breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Hierarchy Browser' }]}
          />
        </div>

        <p className="text-[var(--text-muted)] max-w-2xl text-sm hidden sm:block">
          Drill down from campus overview through programs and sections to individual student profiles.
        </p>

        {/* Breadcrumb — visible on both */}
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

        <div className="min-h-[400px]">
          {renderCurrentLevel()}
        </div>

        {/* Student Profile Drawer */}
        <Drawer
          isOpen={isStudentDrawerOpen}
          onClose={closeStudentDrawer}
          title="Student Profile"
          size="md"
        >
          {activeStudent ? (
            <div className="flex flex-col h-full">
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
                  <div className="flex gap-2 items-center mt-2 flex-wrap">
                    <Badge variant="neutral">Roll No: {activeStudent.rollNumber || 'Unassigned'}</Badge>
                    <Badge variant="info">Gender: {activeStudent.gender || 'N/A'}</Badge>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                <Tabs
                  tabs={[
                    { id: 'academic', label: 'Academic' },
                    { id: 'personal', label: 'Personal' },
                  ]}
                  activeTab={activeStudentTab}
                  onChange={setActiveStudentTab}
                />

                <TabPanel tabId="academic" activeTab={activeStudentTab} className="space-y-6 py-4">
                  <div className="bg-[var(--surface-container-low)] p-4 rounded-xl border border-[var(--border)] grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider mb-1">Section</p>
                      <p className="font-semibold text-[var(--text)]">{activeStudent.section?.name || 'Unassigned'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider mb-1">Grade</p>
                      <p className="font-semibold text-[var(--text)]">{selectedGrade?.name || 'N/A'}</p>
                    </div>
                    <div className="col-span-2 pt-2 border-t border-[var(--border)] mt-2">
                      <p className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider mb-1">Program & Campus</p>
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
                      <p className="text-xs text-[var(--text-muted)] mb-1">Address</p>
                      <p className="text-sm font-medium leading-relaxed">{activeStudent.address || 'N/A'}</p>
                    </div>
                  </div>
                </TabPanel>
              </div>

              <div className="pt-6 border-t border-[var(--border)] mt-auto flex justify-end">
                <Button variant="ghost" onClick={closeStudentDrawer}>Close</Button>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-6 text-center text-[var(--text-muted)]">
              Loading student profile...
            </div>
          )}
        </Drawer>
      </div>
    </div>
  );
}
