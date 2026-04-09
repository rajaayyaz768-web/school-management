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
  SearchInput
} from '@/components/ui';
import { useCampuses } from '@/features/campus/hooks/useCampus';
import { usePrograms } from '@/features/programs/hooks/usePrograms';
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
import { Plus, Calculator } from 'lucide-react';
import axios from '@/lib/axios';
import { useQuery } from '@tanstack/react-query';

const TABS = [
  { id: 'structures', label: 'Fee Structures', icon: <Calculator className="w-4 h-4" /> },
  { id: 'records', label: 'Fee Records' },
  { id: 'defaulters', label: 'Defaulters', countVariant: 'alert' as const },
];

export default function FeesPage() {
  const [activeTab, setActiveTab] = useState('structures');
  
  // Filters
  const [campusId, setCampusId] = useState('');
  const [academicYear, setAcademicYear] = useState('2025-2026');
  const [recordStatus, setRecordStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Generate Records Modal
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [selectedStructureForGen, setSelectedStructureForGen] = useState<FeeStructureResponse | null>(null);
  const [generateSectionId, setGenerateSectionId] = useState('');
  
  // Modals state
  const [isStructureModalOpen, setIsStructureModalOpen] = useState(false);
  const [editingStructure, setEditingStructure] = useState<FeeStructureResponse | undefined>();
  const [isMarkOpen, setIsMarkOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<FeeRecordResponse | null>(null);

  // Queries
  const { data: campuses } = useCampuses();
  const { data: structures, isLoading: loadingStructures } = useFeeStructures(campusId, academicYear);
  const { data: records, isLoading: loadingRecords } = useFeeRecords({ 
    campusId, 
    status: recordStatus, 
    academicYear 
  });
  const { data: defaulters, isLoading: loadingDefaulters } = useFeeDefaulters(campusId, academicYear);
  
  const generateMutation = useGenerateFeeRecords();

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
        onSuccess: () => {
          setGenerateModalOpen(false);
        }
      });
    }
  };

  // Setup sections query for generation modal
  const { data: sections } = useQuery<{ id: string; name: string }[]>({
    queryKey: ['sections', selectedStructureForGen?.gradeId],
    queryFn: async () => {
      if (!selectedStructureForGen?.gradeId) return [];
      const res = await axios.get(`/api/v1/sections?grade_id=${selectedStructureForGen.gradeId}`);
      return res.data.data;
    },
    enabled: !!selectedStructureForGen?.gradeId,
  });

  const filteredRecords = records?.filter(r => {
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
        description="Configure fee structures, manage collections, and track defaulters"
        action={
          activeTab === 'structures' ? (
            <Button
              onClick={() => {
                setEditingStructure(undefined);
                setIsStructureModalOpen(true);
              }}
              icon={<Plus className="w-4 h-4" />}
            >
              Add Structure
            </Button>
          ) : undefined
        }
      />

      <Card className="flex-1 overflow-hidden mt-6 flex flex-col bg-[var(--surface)] border-[var(--border)]">
        <Tabs
          tabs={TABS.map(t => t.id === 'defaulters' ? { ...t, count: defaulters?.length || 0 } : t)}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        <div className="flex-1 overflow-auto p-6 bg-[var(--background)]">
          <TabPanel tabId="structures" activeTab={activeTab}>
            <div className="flex gap-4 mb-6">
              <Select
                label="Filter Campus"
                value={campusId ?? ''}
                onChange={(e) => setCampusId(e.target.value)}
                options={[{ label: 'All Campuses', value: '' }, ...(campuses || []).map(c => ({ label: c.name, value: c.id }))]}
              />
              <Input
                label="Academic Year"
                value={academicYear ?? ''}
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

          <TabPanel tabId="records" activeTab={activeTab}>
            <div className="flex flex-wrap gap-4 mb-6">
              <Select
                label="Campus"
                value={campusId ?? ''}
                onChange={(e) => setCampusId(e.target.value)}
                options={[{ label: 'All Campuses', value: '' }, ...(campuses || []).map(c => ({ label: c.name, value: c.id }))]}
              />
              <Select
                label="Status"
                value={recordStatus ?? ''}
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
                value={academicYear ?? ''}
                onChange={(e) => setAcademicYear(e.target.value)}
              />
              <div className="flex-1 min-w-[200px]">
                <SearchInput
                  placeholder="Search student or roll no..."
                  value={searchQuery ?? ''}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <FeeRecordTable
              records={filteredRecords || []}
              isLoading={loadingRecords}
              onMarkPaid={(r) => {
                setSelectedRecord(r);
                setIsMarkOpen(true);
              }}
            />
          </TabPanel>

          <TabPanel tabId="defaulters" activeTab={activeTab}>
            <div className="flex gap-4 mb-6">
              <Select
                label="Campus (Required)"
                value={campusId ?? ''}
                onChange={(e) => setCampusId(e.target.value)}
                options={[{ label: 'Select Campus', value: '' }, ...(campuses || []).map(c => ({ label: c.name, value: c.id }))]}
              />
              <Input
                label="Academic Year"
                value={academicYear ?? ''}
                onChange={(e) => setAcademicYear(e.target.value)}
              />
            </div>
            
            {campusId ? (
              <DefaultersList
                defaulters={defaulters || []}
                isLoading={loadingDefaulters}
              />
            ) : (
              <div className="text-center text-[var(--text-muted)] py-12">
                Please select a campus to view defaulters.
              </div>
            )}
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
        confirmVariant="primary"
        onConfirm={confirmGenerateRecords}
        onCancel={() => setGenerateModalOpen(false)}
        isLoading={generateMutation.isPending}
      >
        <div className="mt-4">
          <Select
            label="Section"
            value={generateSectionId ?? ''}
            onChange={(e) => setGenerateSectionId(e.target.value)}
            options={(sections || []).map(s => ({ label: s.name, value: s.id }))}
          />
        </div>
      </ConfirmDialog>
    </div>
  );
}
