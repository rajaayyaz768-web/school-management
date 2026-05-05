'use client';

import { MessageCircle, CheckCircle } from 'lucide-react';
import { Table, Badge, StatCard, Tooltip } from '@/components/ui';
import { TableColumn } from '@/components/ui/Table';
import { FeeDefaulter } from '../types/fees.types';
import { useMarkDefaulterReminded } from '../hooks/useFees';
import { sendFeeReminderWhatsApp } from '@/lib/whatsapp';

interface Props {
  defaulters: FeeDefaulter[];
  isLoading: boolean;
  campusId?: string;
}

export function DefaultersList({ defaulters, isLoading, campusId = '' }: Props) {
  const { mutate: markReminded } = useMarkDefaulterReminded();
  const totalUnpaidBalance = (defaulters || []).reduce((sum, d) => sum + (d.balance ?? 0), 0);

  const handleWhatsApp = (row: FeeDefaulter) => {
    if (!row.parentPhone) return;
    sendFeeReminderWhatsApp({
      phone: row.parentPhone,
      studentName: `${row.firstName} ${row.lastName}`,
      rollNumber: row.rollNumber,
      balance: row.balance,
      overdueRecords: row.overdueRecords,
    });
    if (!row.reminderSentAt) {
      markReminded({ studentId: row.studentId, campusId });
    }
  };

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
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => {
        if (!row.parentPhone) return <span className="text-xs text-[var(--text-muted)]">No phone</span>;
        const sent = !!row.reminderSentAt;
        return (
          <Tooltip content={sent
            ? `Reminder sent on ${new Date(row.reminderSentAt!).toLocaleDateString()}`
            : 'Send fee reminder to parent via WhatsApp'
          }>
            <button
              onClick={() => handleWhatsApp(row)}
              className={[
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors',
                sent
                  ? 'border-green-400 text-green-600 bg-green-50 hover:bg-green-100'
                  : 'border-orange-300 text-orange-600 hover:bg-orange-50',
              ].join(' ')}
            >
              {sent ? <CheckCircle className="w-3.5 h-3.5" /> : <MessageCircle className="w-3.5 h-3.5" />}
              {sent ? 'Reminded' : 'Remind'}
            </button>
          </Tooltip>
        );
      },
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
