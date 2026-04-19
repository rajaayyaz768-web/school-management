'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  Button,
  Select,
  Input,
  Tabs,
  TabPanel,
  Card,
  Modal,
  ConfirmDialog,
  SearchInput,
  StatCard,
} from '@/components/ui';
import { useCampuses } from '@/features/campus/hooks/useCampus';
import {
  useFeeStructures,
  useFeeRecords,
  useFeeDefaulters,
  useGenerateFeeRecords
} from '@/features/fees/hooks/useFees';
import { FeeStructureTable } from '@/features/fees/components/FeeStructureTable';
import { FeeRecordTable } from '@/features/fees/components/FeeRecordTable';
import { DefaultersList } from '@/features/fees/components/DefaultersList';
import { FeeStructureForm } from '@/features/fees/components/FeeStructureForm';
import { MarkAsPaidModal } from '@/features/fees/components/MarkAsPaidModal';
import { FeeRecordResponse, FeeStructureResponse } from '@/features/fees/types/fees.types';
import { Plus, Calculator, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';
import axios from '@/lib/axios';
import { useQuery } from '@tanstack/react-query';

const TABS = [
  { id: 'structures', label: 'Fee Structures', icon: <Calculator className="w-4 h-4" /> },
  { id: 'records', label: 'Fee Records' },
  { id: 'defaulters', label: 'Defaulters', countVariant: 'alert' as const },
];

export default function FeesPage() {
  const [activeTab, setActiveTab] = useState('structures');

  const [academicYear, setAcademicYear] = useState('2025-2026');
  const [recordStatus, setRecordStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [selectedStructureForGen, setSelectedStructureForGen] = useState<FeeStructureResponse | null>(null);
  const [generateSectionId, setGenerateSectionId] = useState('');

  const [isStructureModalOpen, setIsStructureModalOpen] = useState(false);
  const [editingStructure, setEditingStructure] = useState<FeeStructureResponse | undefined>();
  const [isMarkOpen, setIsMarkOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<FeeRecordResponse | null>(null);

  const { data: campuses } = useCampuses();
  const campusId = campuses?.[0]?.id ?? '';
  const campusName = campuses?.[0]?.name ?? '';

  const { data: structures, isLoading: loadingStructures } = useFeeStructures(campusId, academicYear);
  const { data: records, isLoading: loadingRecords } = useFeeRecords({
    campusId,
    status: recordStatus !== 'ALL' ? recordStatus : undefined,
    academicYear
  });
  const { data: defaulters, isLoading: loadingDefaulters } = useFeeDefaulters(campusId, academicYear);

  const generateMutation = useGenerateFeeRecords();

  // ── Stat card computations ──────────────────────────────────────────────────
  const today = new Date().toDateString()
  const allRecords = records ?? []
  const todayCollected = allRecords
    .filter(r => r.paidAt && new Date(r.paidAt).toDateString() === today)
    .reduce((sum, r) => sum + r.amountPaid, 0)
  const pendingCount = allRecords.filter(r => r.status === 'PENDING').length
  const overdueCount = allRecords.filter(r => r.status === 'OVERDUE').length

  // ── Defaulters summary ─────────────────────────────────────────────────────
  const allDefaulters = defaulters ?? []
  const totalDefaultersBalance = allDefaulters.reduce((sum, d) => sum + d.balance, 0)

  const handleEditStructure = (structure: FeeStructureResponse) => {
    setEditingStructure(structure);
    setIsStructureModalOpen(true);
  };

  const handleGenerateClick = (structure: FeeStructureResponse) => {
    setSelectedStructureForGen(structure);
    setGenerateSectionId('');
    setGenerateModalOpen(true);
  };

  const confirmGenerateRecords = () => {
    if (selectedStructureForGen && generateSectionId) {
      generateMutation.mutate({
        feeStructureId: selectedStructureForGen.id,
        sectionId: generateSectionId
      }, {
        onSuccess: () => setGenerateModalOpen(false)
      });
    }
  };

  const { data: sections } = useQuery<{ id: string; name: string }[]>({
    queryKey: ['sections', selectedStructureForGen?.gradeId],
    queryFn: async () => {
      if (!selectedStructureForGen?.gradeId) return [];
      const res = await axios.get(`/sections?grade_id=${selectedStructureForGen.gradeId}`);
      return res.data.data;
    },
    enabled: !!selectedStructureForGen?.gradeId,
  });

  const filteredRecords = allRecords.filter(r => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const name = `${r.student?.firstName} ${r.student?.lastName}`.toLowerCase();
    const roll = (r.student?.rollNumber || '').toLowerCase();
    return name.includes(q) || roll.includes(q);
  });

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-8">
      <PageHeader
        title="Fee Management"
        subtitle="Configure fee structures, manage collections, and track defaulters"
        actions={
          activeTab === 'structures' ? (
            <Button
              onClick={() => { setEditingStructure(undefined); setIsStructureModalOpen(true); }}
              icon={<Plus className="w-4 h-4" />}
            >
              Add Structure
            </Button>
          ) : undefined
        }
      />

      <Card className="flex-1 overflow-hidden mt-6 flex flex-col bg-[var(--surface)] border-[var(--border)]">
        <Tabs
          tabs={TABS.map(t => t.id === 'defaulters' ? { ...t, count: allDefaulters.length || 0 } : t)}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        <div className="flex-1 overflow-auto p-6 bg-[var(--background)]">
          {/* ── Fee Structures ── */}
          <TabPanel tabId="structures" activeTab={activeTab}>
            <div className="flex gap-4 mb-6">
              <Input
                label="Academic Year"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
              />
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
            {/* Stat cards row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <StatCard
                title="Today Collected"
                value={`PKR ${todayCollected.toLocaleString()}`}
                subtitle={campusName}
                icon={<CheckCircle2 className="w-5 h-5" />}
              />
              <StatCard
                title="Pending"
                value={pendingCount}
                subtitle="Awaiting payment"
                icon={<Clock className="w-5 h-5" />}
              />
              <StatCard
                title="Overdue"
                value={overdueCount}
                subtitle="Past due date"
                icon={<AlertTriangle className="w-5 h-5" />}
              />
            </div>

            <div className="flex flex-wrap gap-4 mb-6">
              <Select
                label="Status"
                value={recordStatus}
                onChange={(e) => setRecordStatus(e.target.value)}
                options={[
                  { label: 'All Statuses', value: 'ALL' },
                  { label: 'Pending', value: 'PENDING' },
                  { label: 'Partial', value: 'PARTIAL' },
                  { label: 'Paid', value: 'PAID' },
                  { label: 'Overdue', value: 'OVERDUE' },
                  { label: 'Waived', value: 'WAIVED' },
                ]}
              />
              <Input
                label="Academic Year"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
              />
              <div className="flex-1 min-w-[200px]">
                <SearchInput
                  placeholder="Search student or roll no..."
                  value={searchQuery}
                  onChange={setSearchQuery}
                />
              </div>
            </div>

            <FeeRecordTable
              records={filteredRecords}
              isLoading={loadingRecords}
              onMarkPaid={(r) => { setSelectedRecord(r); setIsMarkOpen(true); }}
            />
          </TabPanel>

          {/* ── Defaulters ── */}
          <TabPanel tabId="defaulters" activeTab={activeTab}>
            {/* Red summary card */}
            {allDefaulters.length > 0 && (
              <div className="bg-[var(--danger)]/10 border border-[var(--danger)]/30 rounded-[var(--radius-lg)] p-4 mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-[var(--danger)]" />
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

            <div className="flex gap-4 mb-6">
              <Input
                label="Academic Year"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
              />
            </div>

            <DefaultersList
              defaulters={allDefaulters}
              isLoading={loadingDefaulters}
            />
          </TabPanel>
        </div>
      </Card>

      <Modal
        isOpen={isStructureModalOpen}
        onClose={() => setIsStructureModalOpen(false)}
        title={editingStructure ? "Edit Fee Structure" : "Create Fee Structure"}
        size="lg"
      >
        <FeeStructureForm
          structure={editingStructure}
          onSuccess={() => setIsStructureModalOpen(false)}
          onCancel={() => setIsStructureModalOpen(false)}
        />
      </Modal>

      <MarkAsPaidModal
        record={selectedRecord}
        isOpen={isMarkOpen}
        onClose={() => setIsMarkOpen(false)}
      />

      <ConfirmDialog
        isOpen={generateModalOpen}
        title="Generate Fee Records"
        message="Please select the section for which you want to generate fee records based on this structure."
        confirmText="Generate Records"
        variant="warning"
        onConfirm={confirmGenerateRecords}
        onClose={() => setGenerateModalOpen(false)}
        loading={generateMutation.isPending}
      >
        <div className="mt-4">
          <Select
            label="Section"
            value={generateSectionId}
            onChange={(e) => setGenerateSectionId(e.target.value)}
            options={(sections || []).map(s => ({ label: s.name, value: s.id }))}
          />
        </div>
      </ConfirmDialog>
    </div>
  );
}
