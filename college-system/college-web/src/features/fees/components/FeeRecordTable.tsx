import { TableColumn } from '@/components/ui/Table';
import { Badge, Button, Table } from '@/components/ui';
import { FeeRecordResponse, FeeStatus } from '../types/fees.types';

interface Props {
  records: FeeRecordResponse[];
  isLoading: boolean;
  onMarkPaid: (record: FeeRecordResponse) => void;
}

export function FeeRecordTable({ records, isLoading, onMarkPaid }: Props) {
  const columns: TableColumn<FeeRecordResponse>[] = [
    {
      key: 'student',
      header: 'Student',
      render: (row) => (
        <div>
          <div className="font-medium">{row.student?.firstName ?? ''} {row.student?.lastName ?? ''}</div>
          <div className="text-xs text-[var(--text-muted)] mt-0.5">Roll No: {row.student?.rollNumber ?? '—'}</div>
        </div>
      ),
    },
    {
      key: 'program',
      header: 'Program / Grade',
      render: (row) => (
        <div>
          <div className="text-sm">{row.feeStructure?.program?.name ?? '—'}</div>
          <div className="text-xs text-[var(--text-muted)]">{row.feeStructure?.grade?.name ?? '—'}</div>
        </div>
      ),
    },
    {
      key: 'amountDue',
      header: 'Amount Due',
      render: (row) => <span>PKR {(row.amountDue ?? 0).toLocaleString()}</span>,
    },
    {
      key: 'amountPaid',
      header: 'Amount Paid',
      render: (row) => <span>PKR {(row.amountPaid ?? 0).toLocaleString()}</span>,
    },
    {
      key: 'balance',
      header: 'Balance',
      render: (row) => {
        const balance = (row.amountDue ?? 0) - (row.amountPaid ?? 0) - (row.discount ?? 0);
        return <span className="font-medium">PKR {balance.toLocaleString()}</span>;
      },
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      render: (row) => {
        if (!row.dueDate) return '—';
        return new Date(row.dueDate).toLocaleDateString();
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        const variants: Record<FeeStatus, any> = {
          PAID: 'success',
          PARTIAL: 'warning',
          OVERDUE: 'danger',
          PENDING: 'default',
          WAIVED: 'info',
        };
        const labels: Record<FeeStatus, string> = {
          PAID: 'Paid',
          PARTIAL: 'Partial',
          OVERDUE: 'Overdue',
          PENDING: 'Pending',
          WAIVED: 'Waived',
        };
        return <Badge variant={variants[row.status] || 'default'}>{labels[row.status] || row.status}</Badge>;
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <Button
          size="sm"
          disabled={row.status === 'PAID' || row.status === 'WAIVED'}
          onClick={() => onMarkPaid(row)}
        >
          Mark as Paid
        </Button>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={records || []}
      loading={isLoading}
      emptyMessage="No fee records found."
    />
  );
}
