'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchSectionById } from '@/features/sections/api/sections.api';
import { useStudentsBySection } from '@/features/students/hooks/useStudents';
import { ImportWizard } from '@/features/import/components/ImportWizard';
import { ImportHistoryTable } from '@/features/import/components/ImportHistoryTable';
import PageHeader from '@/components/layout/PageHeader';
import {
  Button, Tabs, TabPanel, Table, Skeleton, EmptyState, ErrorState, Badge,
} from '@/components/ui';
import type { Tab } from '@/components/ui/Tabs';
import { useRole } from '@/store/authStore';
import { Student } from '@/features/students/types/students.types';

export default function SectionDetailPage() {
  const { sectionId } = useParams<{ sectionId: string }>();
  const role = useRole();
  const queryClient = useQueryClient();
  const isAdminOrAbove = role === 'SUPER_ADMIN' || role === 'ADMIN';

  const [importOpen, setImportOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('students');

  const TABS: Tab[] = [
    { id: 'students', label: 'Students' },
    { id: 'import-history', label: 'Import History' },
  ];

  const {
    data: section,
    isLoading: loadingSection,
    isError: sectionError,
    refetch: refetchSection,
  } = useQuery({
    queryKey: ['sections', sectionId],
    queryFn: () => fetchSectionById(sectionId),
    enabled: !!sectionId,
  });

  const {
    data: students = [],
    isLoading: loadingStudents,
  } = useStudentsBySection(sectionId ?? '');

  const breadcrumb = section
    ? [
        { label: 'Home', href: '/' },
        { label: 'Sections', href: '/admin/sections' },
        { label: section.grade?.program?.campus?.name ?? 'Campus' },
        { label: section.grade?.program?.name ?? 'Program' },
        { label: section.grade?.name ?? 'Grade' },
        { label: `Section ${section.name}` },
      ]
    : [{ label: 'Sections', href: '/admin/sections' }];

  const studentColumns = [
    {
      key: 'rollNumber',
      header: 'Roll No.',
      render: (s: Student) => (
        <span className="font-mono text-xs">{s.rollNumber ?? '—'}</span>
      ),
      className: 'w-28',
    },
    {
      key: 'name',
      header: 'Name',
      render: (s: Student) => `${s.firstName} ${s.lastName}`,
    },
    {
      key: 'gender',
      header: 'Gender',
      render: (s: Student) => (
        <Badge variant="neutral" size="sm">{s.gender}</Badge>
      ),
      className: 'w-24',
    },
    {
      key: 'status',
      header: 'Status',
      render: (s: Student) => (
        <Badge
          variant={s.status === 'ACTIVE' ? 'success' : s.status === 'SUSPENDED' ? 'warning' : 'danger'}
          size="sm"
        >
          {s.status}
        </Badge>
      ),
      className: 'w-28',
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (s: Student) => s.phone ?? '—',
      className: 'w-36',
    },
  ];

  if (loadingSection) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
        <Skeleton className="h-10 w-64 rounded-lg" />
        <Skeleton className="h-80 w-full rounded-xl" />
      </div>
    );
  }

  if (sectionError || !section) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <ErrorState action={{ label: 'Retry', onClick: () => refetchSection() }} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <PageHeader
        title={`Section ${section.name}`}
        subtitle={`${section.grade?.program?.campus?.name ?? ''} · ${section.grade?.program?.name ?? ''} · ${section.grade?.name ?? ''}`}
        breadcrumb={breadcrumb}
        actions={
          isAdminOrAbove ? (
            <Button variant="gold" onClick={() => setImportOpen(true)}>
              Import Students via CSV
            </Button>
          ) : undefined
        }
      />

      {/* Stats row */}
      <div className="mt-6 flex flex-wrap gap-4 text-sm text-[var(--text-muted)]">
        <span>
          Enrolled: <strong className="text-[var(--text)]">{students.length}</strong>
          {' / '}
          <strong className="text-[var(--text)]">{section.capacity}</strong>
        </span>
        <span>
          Room: <strong className="text-[var(--text)]">{section.roomNumber ?? '—'}</strong>
        </span>
        <Badge variant={section.isActive ? 'success' : 'danger'} size="sm">
          {section.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </div>

      {/* Tabs */}
      <div className="mt-8">
        <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

        <TabPanel tabId="students" activeTab={activeTab}>
          {loadingStudents ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : students.length === 0 ? (
            <EmptyState
              title="No students yet"
              description={
                isAdminOrAbove
                  ? 'Use "Import Students via CSV" to bulk-enrol students, or add them individually.'
                  : 'No students are assigned to this section.'
              }
            />
          ) : (
            <Table columns={studentColumns} data={students} striped />
          )}
        </TabPanel>

        <TabPanel tabId="import-history" activeTab={activeTab}>
          <ImportHistoryTable sectionId={sectionId} sectionName={section.name} />
        </TabPanel>
      </div>

      {/* Import Wizard Modal */}
      {importOpen && (
        <ImportWizard
          sectionId={sectionId}
          sectionName={section.name}
          onClose={() => setImportOpen(false)}
          onImportComplete={() => {
            queryClient.invalidateQueries({ queryKey: ['students', 'section', sectionId] });
            queryClient.invalidateQueries({ queryKey: ['import-history', sectionId] });
          }}
        />
      )}
    </div>
  );
}
