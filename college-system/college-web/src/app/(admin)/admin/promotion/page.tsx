'use client';

import { useState } from 'react';
import { ArrowUpCircle, Calendar, CheckCircle, Clock, XCircle, AlertTriangle, ChevronRight } from 'lucide-react';
import { usePromotionStatus, useAcademicYears, useCreateAcademicYear, useRunTransitional, useRunAnnual } from '@/features/promotion/hooks/usePromotion';
import { GradePromotionStatus, PromotionStudentStatus } from '@/features/promotion/types/promotion.types';
import { useStudents } from '@/features/students/hooks/useStudents';
import { useSections } from '@/features/sections/hooks/useSections';
import { Modal } from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils';

type WizardMode = 'transitional' | 'annual';
type WizardStep = 1 | 2 | 3 | 4;

interface StudentRow {
  studentId: string;
  name: string;
  rollNumber: string | null;
  currentSectionId: string | null;
  currentSectionName: string | null;
  gradeId: string;
  status: PromotionStudentStatus;
  toSectionId: string | null;
}

export default function PromotionPage() {
  const { data: statusList = [], isLoading: statusLoading } = usePromotionStatus();
  const { data: years = [] } = useAcademicYears();
  const createYear = useCreateAcademicYear();
  const runTransitional = useRunTransitional();
  const runAnnual = useRunAnnual();

  const [yearModalOpen, setYearModalOpen] = useState(false);
  const [yearInput, setYearInput] = useState('');

  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardMode, setWizardMode] = useState<WizardMode>('transitional');
  const [wizardStep, setWizardStep] = useState<WizardStep>(1);
  const [rows, setRows] = useState<StudentRow[]>([]);

  const activeYear = years.find(y => y.isActive);

  // For transitional: source = grade just before the transitional grade
  const transitionalGrade = statusList.find(g => g.isTransitional);
  const sourceForTransitional = transitionalGrade
    ? statusList.find(g => g.destinationGradeId === transitionalGrade.gradeId)
    : null;

  // For annual: all grades except the one feeding into transitional
  const annualSourceGrades = statusList.filter(g => !g.isTransitional && g.activeStudentCount > 0);

  // Grade IDs we need to load students for
  const gradeIdsNeeded = !wizardOpen
    ? []
    : wizardMode === 'transitional'
    ? (sourceForTransitional ? [sourceForTransitional.gradeId] : [])
    : annualSourceGrades.map(g => g.gradeId);

  // Load students for ALL needed grades (we query per grade)
  const firstGradeId = gradeIdsNeeded[0] ?? '';
  const { data: firstGradeStudents } = useStudents(
    wizardOpen && firstGradeId ? { gradeId: firstGradeId, status: 'ACTIVE', limit: 500 } : undefined
  );

  // Destination grade sections — for step 2
  const destGradeId = wizardMode === 'transitional' ? (transitionalGrade?.gradeId ?? '') : '';

  const { data: destSections = [] } = useSections(destGradeId || undefined);

  const destSectionOptions = destSections.map((s: { id: string; name: string; capacity: number }) => ({
    value: s.id,
    label: `${s.name} (capacity ${s.capacity})`,
  }));

  // ── Open wizard ────────────────────────────────────────────────────────────
  const openWizard = (mode: WizardMode) => {
    setWizardMode(mode);
    setWizardStep(1);
    setRows([]);
    setWizardOpen(true);
  };

  // Populate rows when students load (step 1)
  const populateRows = () => {
    if (!firstGradeStudents) return;
    const students = firstGradeStudents.data ?? [];
    setRows(
      students.map(s => ({
        studentId: s.id,
        name: `${s.firstName} ${s.lastName}`,
        rollNumber: s.rollNumber,
        currentSectionId: s.sectionId,
        currentSectionName: s.section?.name ?? null,
        gradeId: firstGradeId,
        status: 'PROMOTED' as PromotionStudentStatus,
        toSectionId: null,
      }))
    );
  };

  const handleStepNext = () => {
    if (wizardStep === 1 && rows.length === 0) { populateRows(); }
    setWizardStep(prev => (prev < 4 ? (prev + 1) as WizardStep : prev));
  };

  const updateRow = (studentId: string, field: 'status' | 'toSectionId', value: string | null) => {
    setRows(prev => prev.map(r => r.studentId === studentId ? { ...r, [field]: value } : r));
  };

  const handleConfirm = () => {
    if (!activeYear) return;
    if (wizardMode === 'transitional') {
      runTransitional.mutate(
        { academicYearId: activeYear.id, assignments: rows.map(r => ({ studentId: r.studentId, toSectionId: r.toSectionId, status: r.status })) },
        { onSuccess: () => setWizardOpen(false) }
      );
    } else {
      const gradeMap = new Map<string, typeof rows>();
      rows.forEach(r => { if (!gradeMap.has(r.gradeId)) gradeMap.set(r.gradeId, []); gradeMap.get(r.gradeId)!.push(r); });
      runAnnual.mutate(
        { academicYearId: activeYear.id, gradeAssignments: Array.from(gradeMap.entries()).map(([gradeId, rs]) => ({ gradeId, studentAssignments: rs.map(r => ({ studentId: r.studentId, toSectionId: r.toSectionId, status: r.status })) })) },
        { onSuccess: () => setWizardOpen(false) }
      );
    }
  };

  const promotedRows = rows.filter(r => r.status === 'PROMOTED');
  const detainedRows = rows.filter(r => r.status === 'DETAINED');
  const withdrawnRows = rows.filter(r => r.status === 'WITHDRAWN');

  const canTransitional = transitionalGrade?.canPromote === false && sourceForTransitional?.canPromote === true;
  const canAnnual = transitionalGrade && transitionalGrade.activeStudentCount > 0;

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--gold)]/15">
            <ArrowUpCircle className="h-5 w-5 text-[var(--gold)]" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-[var(--text)]">Promotion Tool</h1>
            <p className="font-body text-sm text-[var(--text-muted)]">Manage academic year promotions for this campus</p>
          </div>
        </div>
        <Button variant="ghost" onClick={() => setYearModalOpen(true)} className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4" />
          {activeYear ? activeYear.name : 'Set Academic Year'}
        </Button>
      </div>

      {/* Promotion Chain */}
      {statusLoading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 rounded-[var(--radius-lg)]" />)}</div>
      ) : statusList.length === 0 ? (
        <EmptyState title="No grades found" description="Create grades for this campus first." />
      ) : (
        <div className="space-y-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
            Grade Chain — top to bottom &nbsp;·&nbsp; To fix order: go to Programs → click a grade pill → set Order number
          </p>
          {(() => {
            const byProgram = new Map<string, { programName: string; grades: typeof statusList }>();
            for (const g of statusList) {
              const pid = g.programId ?? 'unknown';
              if (!byProgram.has(pid)) byProgram.set(pid, { programName: g.programName ?? 'Unknown Program', grades: [] });
              byProgram.get(pid)!.grades.push(g);
            }
            return Array.from(byProgram.values()).map(({ programName, grades }) => (
              <div key={programName} className="space-y-1.5">
                <p className="text-xs font-semibold text-[var(--text)] border-b border-[var(--border)] pb-1 mb-2">
                  {programName}
                </p>
                {grades.map((grade) => (
                  <div key={grade.gradeId} className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[var(--text-muted)] w-6 text-right shrink-0">
                      {grade.displayOrder}
                    </span>
                    <div className="flex-1">
                      <GradeCard grade={grade} />
                    </div>
                  </div>
                ))}
              </div>
            ));
          })()}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button
          onClick={() => openWizard('transitional')}
          disabled={!canTransitional || !activeYear}
          className="flex items-center gap-2"
          variant="primary"
        >
          <ArrowUpCircle className="h-4 w-4" />
          Promote Class 8 → Pre-9
        </Button>
        <Button
          onClick={() => openWizard('annual')}
          disabled={!canAnnual || !activeYear}
          variant="gold"
          className="flex items-center gap-2"
        >
          <ArrowUpCircle className="h-4 w-4" />
          Run Annual Promotion
        </Button>
        {!activeYear && (
          <p className="text-xs text-amber-600 self-center">Set an academic year first</p>
        )}
      </div>

      {/* Academic Year Modal */}
      <Modal isOpen={yearModalOpen} onClose={() => setYearModalOpen(false)} title="Academic Year" subtitle="Active year applies to all promotions for this campus" size="sm"
        footer={<Button onClick={() => setYearModalOpen(false)} variant="ghost">Close</Button>}>
        <div className="space-y-4">
          <div className="space-y-2">
            {years.map(y => (
              <div key={y.id} className={cn('flex items-center justify-between px-3 py-2 rounded-[var(--radius-sm)] border', y.isActive ? 'border-[var(--primary)] bg-[var(--primary)]/5' : 'border-[var(--border)]')}>
                <span className="font-body text-sm text-[var(--text)]">{y.name}</span>
                {y.isActive && <CheckCircle className="h-4 w-4 text-[var(--primary)]" />}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input value={yearInput} onChange={e => setYearInput(e.target.value)} placeholder="2025-2026" className="flex-1" />
            <Button onClick={() => { createYear.mutate(yearInput, { onSuccess: () => setYearInput('') }); }} disabled={!yearInput.match(/^\d{4}-\d{4}$/) || createYear.isPending} loading={createYear.isPending}>
              Create
            </Button>
          </div>
        </div>
      </Modal>

      {/* Promotion Wizard */}
      <Modal isOpen={wizardOpen} onClose={() => setWizardOpen(false)} title={wizardMode === 'transitional' ? 'Promote Class 8 → Pre-9' : 'Run Annual Promotion'} size="xl"
        footer={
          <div className="flex justify-between w-full">
            <Button variant="ghost" onClick={() => wizardStep > 1 ? setWizardStep(prev => (prev - 1) as WizardStep) : setWizardOpen(false)}>
              {wizardStep === 1 ? 'Cancel' : 'Back'}
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--text-muted)]">Step {wizardStep} of 4</span>
              {wizardStep < 4 ? (
                <Button onClick={handleStepNext} className="flex items-center gap-1">Next <ChevronRight className="h-4 w-4" /></Button>
              ) : (
                <Button onClick={handleConfirm} disabled={runTransitional.isPending || runAnnual.isPending} loading={runTransitional.isPending || runAnnual.isPending} variant="primary">
                  Confirm Promotion
                </Button>
              )}
            </div>
          </div>
        }>
        <div className="min-h-[300px]">
          {/* Stepper */}
          <div className="flex items-center gap-1 mb-6">
            {(['Mark Students', 'Assign Sections', 'Review', 'Confirm'] as const).map((label, i) => (
              <div key={label} className="flex items-center gap-1 flex-1">
                <div className={cn('h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0', wizardStep > i + 1 ? 'bg-green-500 text-white' : wizardStep === i + 1 ? 'bg-[var(--primary)] text-white' : 'bg-[var(--border)] text-[var(--text-muted)]')}>
                  {wizardStep > i + 1 ? '✓' : i + 1}
                </div>
                <span className={cn('text-xs truncate', wizardStep === i + 1 ? 'text-[var(--text)] font-medium' : 'text-[var(--text-muted)]')}>{label}</span>
                {i < 3 && <div className="flex-1 h-px bg-[var(--border)]" />}
              </div>
            ))}
          </div>

          {/* Step 1 — Mark Students */}
          {wizardStep === 1 && (
            <div className="space-y-3">
              <p className="text-sm text-[var(--text-muted)]">Mark each student&apos;s outcome for this promotion. All default to Promoted.</p>
              {rows.length === 0 && firstGradeStudents && (
                <Button variant="ghost" onClick={populateRows}>Load students</Button>
              )}
              {rows.length === 0 && !firstGradeStudents && (
                <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]"><Clock className="h-4 w-4 animate-spin" /> Loading students…</div>
              )}
              {rows.length > 0 && (
                <div className="overflow-auto max-h-[350px]">
                  <table className="w-full text-sm font-body">
                    <thead><tr className="border-b border-[var(--border)]">
                      <th className="text-left py-2 px-2 text-[var(--text-muted)] font-medium">Student</th>
                      <th className="text-left py-2 px-2 text-[var(--text-muted)] font-medium">Roll No.</th>
                      <th className="text-left py-2 px-2 text-[var(--text-muted)] font-medium">Section</th>
                      <th className="text-left py-2 px-2 text-[var(--text-muted)] font-medium w-36">Status</th>
                    </tr></thead>
                    <tbody>{rows.map(r => (
                      <tr key={r.studentId} className="border-b border-[var(--border)]/50">
                        <td className="py-2 px-2 text-[var(--text)]">{r.name}</td>
                        <td className="py-2 px-2 text-[var(--text-muted)]">{r.rollNumber ?? '—'}</td>
                        <td className="py-2 px-2 text-[var(--text-muted)]">{r.currentSectionName ?? '—'}</td>
                        <td className="py-2 px-2">
                          <Select value={r.status} onChange={e => updateRow(r.studentId, 'status', e.target.value)}
                            options={[{ value: 'PROMOTED', label: 'Promoted' }, { value: 'DETAINED', label: 'Detained' }, { value: 'WITHDRAWN', label: 'Withdrawn' }]} />
                        </td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Step 2 — Assign Sections */}
          {wizardStep === 2 && (
            <div className="space-y-3">
              <p className="text-sm text-[var(--text-muted)]">Assign destination sections for promoted students. Detained and withdrawn students are skipped automatically.</p>
              {promotedRows.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)]">No students marked as Promoted.</p>
              ) : (
                <div className="overflow-auto max-h-[350px]">
                  <table className="w-full text-sm font-body">
                    <thead><tr className="border-b border-[var(--border)]">
                      <th className="text-left py-2 px-2 text-[var(--text-muted)] font-medium">Student</th>
                      <th className="text-left py-2 px-2 text-[var(--text-muted)] font-medium w-48">Destination Section</th>
                    </tr></thead>
                    <tbody>{promotedRows.map(r => (
                      <tr key={r.studentId} className="border-b border-[var(--border)]/50">
                        <td className="py-2 px-2 text-[var(--text)]">{r.name}</td>
                        <td className="py-2 px-2">
                          <Select value={r.toSectionId ?? ''} onChange={e => updateRow(r.studentId, 'toSectionId', e.target.value || null)}
                            options={destSectionOptions} placeholder="Select section" />
                        </td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              )}
              {destSectionOptions.length === 0 && (
                <p className="text-xs text-amber-600 flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" /> No sections found in the destination grade.</p>
              )}
            </div>
          )}

          {/* Step 3 — Review */}
          {wizardStep === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-[var(--text-muted)]">Review the promotion summary before confirming.</p>
              <div className="grid grid-cols-3 gap-3">
                {[['Promoted', promotedRows.length, 'text-green-600'], ['Detained', detainedRows.length, 'text-amber-600'], ['Withdrawn', withdrawnRows.length, 'text-red-500']].map(([label, count, color]) => (
                  <div key={label as string} className="rounded-[var(--radius-lg)] border border-[var(--border)] p-3 text-center">
                    <p className={cn('text-2xl font-bold font-display', color as string)}>{count as number}</p>
                    <p className="text-xs text-[var(--text-muted)]">{label as string}</p>
                  </div>
                ))}
              </div>
              {promotedRows.some(r => !r.toSectionId) && (
                <p className="text-xs text-amber-600 flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" />{promotedRows.filter(r => !r.toSectionId).length} promoted student(s) have no destination section assigned — they will be skipped.</p>
              )}
            </div>
          )}

          {/* Step 4 — Confirm */}
          {wizardStep === 4 && (
            <div className="space-y-4 text-center py-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary)]/10 mx-auto">
                <ArrowUpCircle className="h-8 w-8 text-[var(--primary)]" />
              </div>
              <p className="font-display text-lg font-semibold text-[var(--text)]">Ready to promote</p>
              <p className="text-sm text-[var(--text-muted)] max-w-sm mx-auto">
                This will move {promotedRows.length} students to their new sections, detain {detainedRows.length}, and mark {withdrawnRows.length} as withdrawn. This action cannot be undone automatically.
              </p>
              <p className="text-xs text-[var(--text-muted)]">Academic Year: <strong>{activeYear?.name}</strong></p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

function GradeCard({ grade }: { grade: GradePromotionStatus }) {
  const colour = grade.activeStudentCount === 0
    ? 'bg-green-500/15 text-green-600 border-green-200'
    : grade.canPromote
    ? 'bg-amber-500/15 text-amber-600 border-amber-200'
    : 'bg-red-500/15 text-red-600 border-red-200';

  const Icon = grade.activeStudentCount === 0 ? CheckCircle : grade.canPromote ? Clock : XCircle;

  return (
    <div className={cn('flex items-center justify-between px-4 py-3 rounded-[var(--radius-lg)] border', 'bg-[var(--surface)] border-[var(--border)]')}>
      <div className="flex items-center gap-3">
        <div className={cn('flex h-8 w-8 items-center justify-center rounded-full border', colour)}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <span className="font-body font-medium text-[var(--text)] text-sm">{grade.gradeName}</span>
          {grade.isTransitional && (
            <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-medium">Transitional</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <span className="text-[var(--text-muted)]">{grade.activeStudentCount} students</span>
        {grade.blockedReason && !grade.canPromote && grade.activeStudentCount > 0 && (
          <span className="text-xs text-red-500 max-w-[180px] truncate" title={grade.blockedReason}>{grade.blockedReason}</span>
        )}
      </div>
    </div>
  );
}
