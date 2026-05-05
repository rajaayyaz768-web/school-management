'use client';

import { Printer, MessageCircle, CheckCircle } from 'lucide-react';
import { TableColumn } from '@/components/ui/Table';
import { Badge, Button, Table, Tooltip } from '@/components/ui';
import { FeeRecordResponse, FeeStatus } from '../types/fees.types';
import { useMarkFeeWhatsappNotified } from '../hooks/useFees';
import { sendFeesPaidWhatsApp } from '@/lib/whatsapp';

interface Props {
  records: FeeRecordResponse[];
  isLoading: boolean;
  onMarkPaid: (record: FeeRecordResponse) => void;
  onChallan: (record: FeeRecordResponse) => void;
}

export function FeeRecordTable({ records, isLoading, onMarkPaid, onChallan }: Props) {
  const { mutate: markNotified } = useMarkFeeWhatsappNotified();

  const handleWhatsApp = (row: FeeRecordResponse) => {
    if (!row.parentPhone) return;
    const month = new Date(row.dueDate).toLocaleDateString('en-PK', { month: 'long', year: 'numeric' });
    const className = [
      row.feeStructure?.program?.name,
      row.feeStructure?.grade?.name,
      row.student?.section?.name ? `Sec ${row.student.section.name}` : null,
    ].filter(Boolean).join(' · ');

    sendFeesPaidWhatsApp({
      phone: row.parentPhone,
      studentName: `${row.student?.firstName ?? ''} ${row.student?.lastName ?? ''}`.trim(),
      rollNumber: row.student?.rollNumber ?? null,
      className,
      amount: row.amountPaid,
      month,
      receiptNumber: row.receiptNumber,
      paidAt: row.paidAt,
    });

    if (!row.whatsappNotifiedAt) {
      markNotified(row.id);
    }
  };

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
      key: 'class',
      header: 'Program · Grade · Section',
      render: (row) => (
        <div>
          <div className="text-sm font-medium">{row.feeStructure?.program?.name ?? '—'}</div>
          <div className="text-xs text-[var(--text-muted)] mt-0.5">
            {row.feeStructure?.grade?.name ?? '—'}
            {row.student?.section?.name ? (
              <span className="ml-1.5 font-mono bg-[var(--surface-container-low)] px-1.5 py-0.5 rounded text-[10px]">
                Sec {row.student.section.name}
              </span>
            ) : null}
          </div>
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
          PAID: 'success', PARTIAL: 'warning', OVERDUE: 'danger', PENDING: 'default', WAIVED: 'info',
        };
        const labels: Record<FeeStatus, string> = {
          PAID: 'Paid', PARTIAL: 'Partial', OVERDUE: 'Overdue', PENDING: 'Pending', WAIVED: 'Waived',
        };
        return <Badge variant={variants[row.status] || 'default'}>{labels[row.status] || row.status}</Badge>;
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            disabled={row.status === 'PAID' || row.status === 'WAIVED'}
            onClick={() => onMarkPaid(row)}
          >
            Mark as Paid
          </Button>

          <button
            onClick={() => onChallan(row)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--primary)] transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Challan
          </button>

          {row.status === 'PAID' && row.parentPhone && (
            <Tooltip content={row.whatsappNotifiedAt
              ? `Sent on ${new Date(row.whatsappNotifiedAt).toLocaleDateString()}`
              : 'Send WhatsApp receipt to parent'
            }>
              <button
                onClick={() => handleWhatsApp(row)}
                className={[
                  'inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors',
                  row.whatsappNotifiedAt
                    ? 'border-green-400 text-green-600 bg-green-50 hover:bg-green-100'
                    : 'border-[var(--border)] text-[var(--text-muted)] hover:text-green-600 hover:border-green-500',
                ].join(' ')}
              >
                {row.whatsappNotifiedAt
                  ? <CheckCircle className="w-3.5 h-3.5" />
                  : <MessageCircle className="w-3.5 h-3.5" />
                }
                WhatsApp
              </button>
            </Tooltip>
          )}
        </div>
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
