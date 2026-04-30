'use client';

import { Table, EmptyState, Skeleton, Button, Tooltip } from '@/components/ui';
import { useImportHistory, useDownloadCredentials } from '../hooks/useImport';
import { ImportHistoryRecord } from '../types/import.types';

interface Props {
  sectionId: string;
  sectionName: string;
}

export function ImportHistoryTable({ sectionId, sectionName }: Props) {
  const { data: history = [], isLoading } = useImportHistory(sectionId);
  const downloadMutation = useDownloadCredentials(sectionName);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <EmptyState
        title="No imports yet"
        description="Upload a CSV or XLSX file to import students in bulk."
      />
    );
  }

  const columns = [
    {
      key: 'importedAt',
      header: 'Date',
      render: (row: ImportHistoryRecord) =>
        new Date(row.importedAt).toLocaleString('en-PK', {
          dateStyle: 'medium',
          timeStyle: 'short',
        }),
    },
    {
      key: 'importedBy',
      header: 'Imported By',
      render: (row: ImportHistoryRecord) =>
        `${row.importedBy.firstName} ${row.importedBy.lastName}`.trim() || '—',
    },
    {
      key: 'studentsCreated',
      header: 'Students',
      render: (row: ImportHistoryRecord) => row.studentsCreated,
    },
    {
      key: 'parentsCreated',
      header: 'New Parents',
      render: (row: ImportHistoryRecord) => row.parentsCreated,
    },
    {
      key: 'parentsLinked',
      header: 'Linked Parents',
      render: (row: ImportHistoryRecord) => row.parentsLinked,
    },
    {
      key: 'actions',
      header: 'Credentials',
      render: (row: ImportHistoryRecord) =>
        row.credentialsDownloaded ? (
          <Tooltip content="Credentials already downloaded">
            <Button variant="secondary" disabled className="text-xs px-3 py-1">
              Downloaded
            </Button>
          </Tooltip>
        ) : (
          <Button
            variant="primary"
            className="text-xs px-3 py-1"
            loading={downloadMutation.isPending}
            onClick={() => downloadMutation.mutate(row.id)}
          >
            Download
          </Button>
        ),
    },
  ];

  return <Table columns={columns} data={history} striped />;
}
