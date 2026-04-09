import { Table, Badge, StatCard } from '@/components/ui';
import { TableColumn } from '@/components/ui/Table';
import { FeeDefaulter } from '../types/fees.types';

interface Props {
  defaulters: FeeDefaulter[];
  isLoading: boolean;
}

export function DefaultersList({ defaulters, isLoading }: Props) {
  const totalUnpaidBalance = (defaulters || []).reduce((sum, d) => sum + (d.balance ?? 0), 0);

  const columns: TableColumn<FeeDefaulter>[] = [
    {
      key: 'student',
      header: 'Student',
      render: (row) => (
        <div>
          <div className="font-medium">{row.firstName ?? ''} {row.lastName ?? ''}</div>
          <div className="text-xs text-[var(--text-muted)] mt-0.5">Roll No: {row.rollNumber ?? '—'}</div>
        </div>
      ),
    },
    {
      key: 'totalDue',
      header: 'Total Due (PKR)',
      render: (row) => <span>{(row.totalDue ?? 0).toLocaleString()}</span>,
    },
    {
      key: 'totalPaid',
      header: 'Total Paid (PKR)',
      render: (row) => <span>{(row.totalPaid ?? 0).toLocaleString()}</span>,
    },
    {
      key: 'balance',
      header: 'Balance (PKR)',
      render: (row) => (
        <span className="font-bold text-[var(--danger)]">
          {(row.balance ?? 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'overdueRecords',
      header: 'Overdue Records',
      render: (row) => (
        <Badge variant={row.overdueRecords > 0 ? 'danger' : 'warning'}>
          {row.overdueRecords} records
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Outstanding Balance"
          value={`PKR ${totalUnpaidBalance.toLocaleString()}`}
          trend={{ value: `${defaulters?.length || 0} students`, direction: 'down' }}
        />
      </div>
      
      <Table
        columns={columns}
        data={defaulters || []}
        loading={isLoading}
        emptyMessage="No defaulters found for this period."
      />
    </div>
  );
}
