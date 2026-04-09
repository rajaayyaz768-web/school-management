import { Table } from '@/components/ui';
import { TableColumn } from '@/components/ui/Table';
import { Badge, Button } from '@/components/ui';
import { FeeStructureResponse } from '../types/fees.types';

interface Props {
  structures: FeeStructureResponse[];
  isLoading: boolean;
  onEdit: (structure: FeeStructureResponse) => void;
  onGenerateRecords: (structure: FeeStructureResponse) => void;
}

export function FeeStructureTable({ structures, isLoading, onEdit, onGenerateRecords }: Props) {
  const columns: TableColumn<FeeStructureResponse>[] = [
    {
      key: 'program',
      header: 'Program / Grade',
      render: (row) => (
        <div>
          <div className="font-medium">{row.program?.name ?? '—'}</div>
          <div className="text-xs text-[var(--text-muted)] mt-0.5">{row.grade?.name ?? '—'}</div>
        </div>
      ),
    },
    {
      key: 'academicYear',
      header: 'Year',
      render: (row) => <Badge variant="info">{row.academicYear}</Badge>,
    },
    {
      key: 'totalFee',
      header: 'Total Fee',
      render: (row) => (
        <div className="font-bold text-[var(--primary)]">
          PKR {(row.totalFee ?? 0).toLocaleString()}
        </div>
      ),
    },
    {
      key: 'breakdown',
      header: 'Breakdown (PKR)',
      render: (row) => (
        <div className="text-xs text-[var(--text-muted)] space-y-0.5">
          <div>Adm: {(row.admissionFee ?? 0).toLocaleString()}</div>
          <div>Tui: {(row.tuitionFee ?? 0).toLocaleString()}</div>
          <div>Exm: {(row.examFee ?? 0).toLocaleString()}</div>
          <div>Misc: {(row.miscFee ?? 0).toLocaleString()}</div>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => onEdit(row)}>
            Edit
          </Button>
          <Button size="sm" variant="primary" onClick={() => onGenerateRecords(row)}>
            Generate Records
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={structures || []}
      loading={isLoading}
      emptyMessage="No fee structures found."
    />
  );
}
