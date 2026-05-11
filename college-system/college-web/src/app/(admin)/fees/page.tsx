'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  Button, Select, Input, Tabs, TabPanel, Modal,
  ConfirmDialog, SearchInput, StatCard,
} from '@/components/ui';
import { useCampusStore } from '@/store/campusStore';
import { useRole } from '@/store/authStore';
import {
  useFeeStructures, useFeeRecords, useFeeDefaulters, useGenerateFeeRecords,
} from '@/features/fees/hooks/useFees';
import { FeeStructureTable } from '@/features/fees/components/FeeStructureTable';
import { FeeRecordTable } from '@/features/fees/components/FeeRecordTable';
import { DefaultersList } from '@/features/fees/components/DefaultersList';
import { FeeStructureForm } from '@/features/fees/components/FeeStructureForm';
import { MarkAsPaidModal } from '@/features/fees/components/MarkAsPaidModal';
import { ChalanModal } from '@/features/fees/components/ChalanModal';
import { BulkChalanPrintModal } from '@/features/fees/components/BulkChalanPrintModal';
import { FeeRecordResponse, FeeStructureResponse } from '@/features/fees/types/fees.types';
import { Plus, Calculator, AlertTriangle, Clock, CheckCircle2, ChevronRight, X, Printer } from 'lucide-react';
import axios from '@/lib/axios';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

// ── Types ─────────────────────────────────────────────────────────────────────
interface SectionData {
  id: string;
  name: string;
  grade: { id: string; name: string; program: { id: string; name: string } } | null;
}

// ── Chip helpers ──────────────────────────────────────────────────────────────
const chip = (active: boolean) =>
  cn(
    'shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all',
    active
      ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
      : 'bg-[var(--surface)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--primary)]/50 active:scale-95',
  );

const TABS = [
  { id: 'structures', label: 'Fee Structures', icon: <Calculator className="w-4 h-4" /> },
  { id: 'records', label: 'Fee Records' },
  { id: 'defaulters', label: 'Defaulters' },
];

const STATUS_OPTIONS = [
  { label: 'All Statuses', value: 'ALL' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Partial', value: 'PARTIAL' },
  { label: 'Paid', value: 'PAID' },
  { label: 'Overdue', value: 'OVERDUE' },
  { label: 'Waived', value: 'WAIVED' },
];

export default function FeesPage() {
  const role = useRole();
  const { activeCampusId } = useCampusStore();

  const [activeTab, setActiveTab] = useState('structures');
  const [academicYear, setAcademicYear] = useState('2025-2026');
  const [recordStatus, setRecordStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Hierarchical filter state
  const [filterProgramId, setFilterProgramId] = useState<string | null>(null);
  const [filterGradeId, setFilterGradeId] = useState<string | null>(null);
  const [filterSectionId, setFilterSectionId] = useState<string | null>(null);

  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [selectedStructureForGen, setSelectedStructureForGen] = useState<FeeStructureResponse | null>(null);
  const [generateSectionId, setGenerateSectionId] = useState<string | null>(null);
  const [isStructureModalOpen, setIsStructureModalOpen] = useState(false);
  const [editingStructure, setEditingStructure] = useState<FeeStructureResponse | undefined>();
  const [isMarkOpen, setIsMarkOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<FeeRecordResponse | null>(null);
  const [chalanRecordId, setChalanRecordId] = useState<string | null>(null);
  const [bulkPrintOpen, setBulkPrintOpen] = useState(false);

  const campusIdForQuery = role === 'SUPER_ADMIN' ? (activeCampusId ?? undefined) : undefined;

  const { data: structures, isLoading: loadingStructures } = useFeeStructures(campusIdForQuery, academicYear);
  const { data: records, isLoading: loadingRecords } = useFeeRecords({
    campusId: campusIdForQuery,
    sectionId: filterSectionId ?? undefined,
    status: recordStatus !== 'ALL' ? recordStatus : undefined,
    academicYear,
  });
  const { data: defaulters, isLoading: loadingDefaulters } = useFeeDefaulters(campusIdForQuery ?? '', academicYear);
  const generateMutation = useGenerateFeeRecords();

  // All sections for the campus (includes grade + program for hierarchical filter)
  const { data: allSections } = useQuery<SectionData[]>({
    queryKey: ['sections-with-grade', campusIdForQuery],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (campusIdForQuery) params.campus_id = campusIdForQuery;
      const res = await axios.get('/sections', { params });
      return res.data.data;
    },
    enabled: true,
  });

  // Sections for the generate-modal (filtered by the structure's grade)
  const { data: generateSections } = useQuery<{ id: string; name: string }[]>({
    queryKey: ['sections', selectedStructureForGen?.gradeId],
    queryFn: async () => {
      if (!selectedStructureForGen?.gradeId) return [];
      const res = await axios.get(`/sections?grade_id=${selectedStructureForGen.gradeId}`);
      return res.data.data;
    },
    enabled: !!selectedStructureForGen?.gradeId,
  });

  // ── Derive programs / grades / sections from allSections ──────────────────
  const programs = useMemo(() => {
    const seen = new Map<string, string>();
    for (const s of allSections ?? []) {
      const p = s.grade?.program;
      if (p && !seen.has(p.id)) seen.set(p.id, p.name);
    }
    return Array.from(seen.entries()).map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [allSections]);

  const gradesForProgram = useMemo(() => {
    if (!filterProgramId) return [];
    const seen = new Map<string, string>();
    for (const s of allSections ?? []) {
      const g = s.grade;
      if (g && g.program.id === filterProgramId && !seen.has(g.id)) seen.set(g.id, g.name);
    }
    return Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
  }, [allSections, filterProgramId]);

  const sectionsForGrade = useMemo(() => {
    if (!filterGradeId) return [];
    return (allSections ?? []).filter(s => s.grade?.id === filterGradeId);
  }, [allSections, filterGradeId]);

  // Label lookups for the context banner
  const selectedProgramName = programs.find(p => p.id === filterProgramId)?.name ?? null;
  const selectedGradeName = gradesForProgram.find(g => g.id === filterGradeId)?.name ?? null;
  const selectedSectionName = sectionsForGrade.find(s => s.id === filterSectionId)?.name ?? null;

  // ── Stat card computations ─────────────────────────────────────────────────
  const today = new Date().toDateString();
  const allRecords = records ?? [];
  const todayCollected = allRecords
    .filter(r => r.paidAt && new Date(r.paidAt).toDateString() === today)
    .reduce((sum, r) => sum + r.amountPaid, 0);
  const pendingCount = allRecords.filter(r => r.status === 'PENDING').length;
  const overdueCount = allRecords.filter(r => r.status === 'OVERDUE').length;

  const allDefaulters = defaulters ?? [];
  const totalDefaultersBalance = allDefaulters.reduce((sum, d) => sum + d.balance, 0);

  const filteredRecords = allRecords.filter(r => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const name = `${r.student?.firstName} ${r.student?.lastName}`.toLowerCase();
    const roll = (r.student?.rollNumber || '').toLowerCase();
    return name.includes(q) || roll.includes(q);
  });

  // ── Handlers ──────────────────────────────────────────────────────────────
  const selectProgram = (id: string) => {
    if (filterProgramId === id) {
      setFilterProgramId(null); setFilterGradeId(null); setFilterSectionId(null);
    } else {
      setFilterProgramId(id); setFilterGradeId(null); setFilterSectionId(null);
    }
  };

  const selectGrade = (id: string) => {
    if (filterGradeId === id) {
      setFilterGradeId(null); setFilterSectionId(null);
    } else {
      setFilterGradeId(id); setFilterSectionId(null);
    }
  };

  const selectSection = (id: string) => {
    setFilterSectionId(prev => prev === id ? null : id);
  };

  const clearAllFilters = () => {
    setFilterProgramId(null); setFilterGradeId(null); setFilterSectionId(null);
  };

  const handleEditStructure = (s: FeeStructureResponse) => { setEditingStructure(s); setIsStructureModalOpen(true); };
  const handleGenerateClick = (s: FeeStructureResponse) => { setSelectedStructureForGen(s); setGenerateSectionId(null); setGenerateModalOpen(true); };
  const confirmGenerateRecords = () => {
    if (selectedStructureForGen && generateSectionId) {
      generateMutation.mutate({ feeStructureId: selectedStructureForGen.id, sectionId: generateSectionId }, {
        onSuccess: () => setGenerateModalOpen(false),
      });
    }
  };

  const hasActiveFilter = !!(filterProgramId || filterGradeId || filterSectionId);

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* ── Mobile header ──────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[var(--bg)]/95 backdrop-blur-md border-b border-[var(--border)] px-[var(--space-4)] h-14 flex items-center justify-between md:hidden">
        <h1 className="font-bold text-lg text-[var(--text)]" style={{ fontFamily: 'var(--font-display)' }}>
          Fee Management
        </h1>
        {activeTab === 'structures' && (
          <button
            onClick={() => { setEditingStructure(undefined); setIsStructureModalOpen(true); }}
            className="p-2 rounded-full bg-[var(--primary)] text-white active:opacity-80"
          >
            <Plus className="w-5 h-5" />
          </button>
        )}
      </header>

      {/* ── Desktop header ─────────────────────────────────────────────────── */}
      <div className="hidden md:block max-w-7xl mx-auto py-8 px-[var(--space-4)] sm:px-6 lg:px-8">
        <PageHeader
          title="Fee Management"
          subtitle="Configure fee structures, manage collections, and track defaulters"
          actions={
            activeTab === 'structures' ? (
              <Button onClick={() => { setEditingStructure(undefined); setIsStructureModalOpen(true); }} icon={<Plus className="w-4 h-4" />}>
                Add Structure
              </Button>
            ) : undefined
          }
        />
      </div>

      <div className="px-4 md:max-w-7xl md:mx-auto md:px-6 lg:px-8 md:pb-8 pb-24">
        {/* Tabs */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-card)] overflow-hidden">
          <div className="border-b border-[var(--border)] px-2 sm:px-4">
            <Tabs
              tabs={TABS.map(t => t.id === 'defaulters' ? { ...t, count: allDefaulters.length || 0 } : t)}
              activeTab={activeTab}
              onChange={setActiveTab}
            />
          </div>

          <div className="p-4 sm:p-6">
            {/* ── Fee Structures ── */}
            <TabPanel tabId="structures" activeTab={activeTab}>
              <div className="mb-6 max-w-xs">
                <Input label="Academic Year" value={academicYear} onChange={e => setAcademicYear(e.target.value)} />
              </div>
              <FeeStructureTable
                structures={structures || []}
                isLoading={loadingStructures}
                onEdit={handleEditStructure}
                onGenerateRecords={handleGenerateClick}
              />
            </TabPanel>

            {/* ── Fee Records ── */}
            <TabPanel tabId="records" activeTab={activeTab}>
              {/* Stat cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-[var(--space-3)] mb-6">
                <StatCard title="Today Collected" value={`PKR ${todayCollected.toLocaleString()}`} icon={<CheckCircle2 className="w-5 h-5" />} />
                <StatCard title="Pending" value={pendingCount} subtitle="Awaiting payment" icon={<Clock className="w-5 h-5" />} />
                <StatCard title="Overdue" value={overdueCount} subtitle="Past due date" icon={<AlertTriangle className="w-5 h-5" />} />
              </div>

              {/* ── Hierarchical filter ── */}
              {programs.length > 0 && (
                <div className="mb-4 space-y-3 bg-[var(--surface-container-low)] rounded-[var(--radius-card-sm)] p-[var(--space-3)] sm:p-4 border border-[var(--border)]">
                  {/* Program row */}
                  <div>
                    <p className="text-[var(--font-size-xs)] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Program</p>
                    <div className="flex flex-wrap gap-2">
                      {programs.map(p => (
                        <button key={p.id} onClick={() => selectProgram(p.id)} className={chip(filterProgramId === p.id)}>
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Grade row — only when program selected */}
                  <AnimatePresence>
                    {filterProgramId && gradesForProgram.length > 0 && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }}>
                        <div className="flex items-center gap-2 mb-2">
                          <ChevronRight className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
                          <p className="text-[var(--font-size-xs)] font-bold uppercase tracking-widest text-[var(--text-muted)]">Grade</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {gradesForProgram.map(g => (
                            <button key={g.id} onClick={() => selectGrade(g.id)} className={chip(filterGradeId === g.id)}>
                              {g.name}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Section row — only when grade selected */}
                  <AnimatePresence>
                    {filterGradeId && sectionsForGrade.length > 0 && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }}>
                        <div className="flex items-center gap-2 mb-2">
                          <ChevronRight className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
                          <ChevronRight className="w-3 h-3 text-[var(--text-muted)] shrink-0 -ml-2" />
                          <p className="text-[var(--font-size-xs)] font-bold uppercase tracking-widest text-[var(--text-muted)]">Section</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {sectionsForGrade.map(s => (
                            <button key={s.id} onClick={() => selectSection(s.id)} className={chip(filterSectionId === s.id)}>
                              Section {s.name}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* ── Active filter context banner ── */}
              <AnimatePresence>
                {hasActiveFilter && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-between gap-[var(--space-3)] mb-4 bg-[var(--primary)]/8 border border-[var(--primary)]/20 rounded-[var(--radius-card-sm)] px-3 py-2.5"
                  >
                    <div className="flex items-center gap-1.5 flex-wrap text-xs font-medium text-[var(--primary)]">
                      <span className="font-bold">Viewing:</span>
                      {selectedProgramName && <span>{selectedProgramName}</span>}
                      {selectedGradeName && <><ChevronRight className="w-3 h-3 opacity-60" /><span>{selectedGradeName}</span></>}
                      {selectedSectionName && <><ChevronRight className="w-3 h-3 opacity-60" /><span>Section {selectedSectionName}</span></>}
                      <span className="ml-1 text-[var(--text-muted)] font-normal">· {filteredRecords.length} record{filteredRecords.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {filterSectionId && allRecords.length > 0 && (
                        <motion.button
                          onClick={() => setBulkPrintOpen(true)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--primary)] text-white text-xs font-semibold"
                        >
                          <Printer className="w-3 h-3" />
                          Print Challans ({allRecords.length})
                        </motion.button>
                      )}
                      <button onClick={clearAllFilters} className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Secondary filters */}
              <div className="flex flex-col sm:flex-row gap-[var(--space-3)] mb-5">
                <Select
                  label="Status"
                  value={recordStatus}
                  onChange={e => setRecordStatus(e.target.value)}
                  options={STATUS_OPTIONS}
                />
                <Input label="Academic Year" value={academicYear} onChange={e => setAcademicYear(e.target.value)} />
                <div className="flex-1 sm:min-w-[200px]">
                  <SearchInput placeholder="Search student or roll no…" value={searchQuery} onChange={setSearchQuery} />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto -mx-4 sm:-mx-6 px-[var(--space-4)] sm:px-6">
                <FeeRecordTable
                  records={filteredRecords}
                  isLoading={loadingRecords}
                  onMarkPaid={r => { setSelectedRecord(r); setIsMarkOpen(true); }}
                  onChallan={r => setChalanRecordId(r.id)}
                />
              </div>
            </TabPanel>

            {/* ── Defaulters ── */}
            <TabPanel tabId="defaulters" activeTab={activeTab}>
              {allDefaulters.length > 0 && (
                <div className="bg-[var(--danger)]/10 border border-[var(--danger)]/30 rounded-[var(--radius-card-sm)] p-[var(--space-4)] mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-[var(--danger)] shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-[var(--danger)]">
                        {allDefaulters.length} defaulter{allDefaulters.length !== 1 ? 's' : ''} found
                      </p>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">
                        Total outstanding: PKR {totalDefaultersBalance.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <div className="mb-6 max-w-xs">
                <Input label="Academic Year" value={academicYear} onChange={e => setAcademicYear(e.target.value)} />
              </div>
              <DefaultersList defaulters={allDefaulters} isLoading={loadingDefaulters} campusId={campusIdForQuery} />
            </TabPanel>
          </div>
        </div>
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────────── */}
      <Modal isOpen={isStructureModalOpen} onClose={() => setIsStructureModalOpen(false)} title={editingStructure ? 'Edit Fee Structure' : 'Create Fee Structure'} size="lg">
        <FeeStructureForm structure={editingStructure} onSuccess={() => setIsStructureModalOpen(false)} onCancel={() => setIsStructureModalOpen(false)} />
      </Modal>

      <MarkAsPaidModal record={selectedRecord} isOpen={isMarkOpen} onClose={() => setIsMarkOpen(false)} />

      <ChalanModal recordId={chalanRecordId} onClose={() => setChalanRecordId(null)} />

      <BulkChalanPrintModal
        open={bulkPrintOpen}
        onClose={() => setBulkPrintOpen(false)}
        sectionName={selectedSectionName ?? ''}
        records={allRecords}
        structures={structures ?? []}
      />

      <ConfirmDialog
        isOpen={generateModalOpen}
        title="Generate Fee Records"
        message="Select the section to generate fee records for this structure."
        confirmText="Generate Records"
        variant="warning"
        onConfirm={confirmGenerateRecords}
        onClose={() => setGenerateModalOpen(false)}
        loading={generateMutation.isPending}
      >
        <div className="mt-4">
          {generateSections && generateSections.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {generateSections.map(s => (
                <button
                  key={s.id}
                  onClick={() => setGenerateSectionId(s.id)}
                  className={chip(generateSectionId === s.id)}
                >
                  Section {s.name}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--text-muted)]">No sections found for this grade.</p>
          )}
        </div>
      </ConfirmDialog>
    </div>
  );
}
