'use client'

import { TableColumn } from '@/components/ui/Table'
import { Badge, Button, Table, Tooltip } from '@/components/ui'
import { Exam, ExamStatus } from '../types/exams.types'
import { Edit2, Trash2, ClipboardList } from 'lucide-react'

interface Props {
  exams: Exam[]
  isLoading: boolean
  onEdit: (exam: Exam) => void
  onDelete: (id: string) => void
  onEnterResults: (exam: Exam) => void
}

const STATUS_BADGE: Record<ExamStatus, { variant: 'success' | 'info' | 'warning' | 'danger'; label: string }> = {
  COMPLETED: { variant: 'success', label: 'Completed' },
  SCHEDULED: { variant: 'info', label: 'Scheduled' },
  ONGOING: { variant: 'warning', label: 'Ongoing' },
  CANCELLED: { variant: 'danger', label: 'Cancelled' },
}

export function ExamTable({ exams, isLoading, onEdit, onDelete, onEnterResults }: Props) {
  const columns: TableColumn<Exam>[] = [
    {
      key: 'subject',
      header: 'Subject',
      render: (row) => (
        <div>
          <div className="font-medium">{row.subject?.name ?? '—'}</div>
          <div className="text-xs text-[var(--text-muted)] mt-0.5">{row.subject?.code ?? ''}</div>
        </div>
      ),
    },
    {
      key: 'section',
      header: 'Section',
      render: (row) => <span>{row.section?.name ?? '—'}</span>,
    },
    {
      key: 'examType',
      header: 'Exam Type',
      render: (row) => <span>{row.examType?.name ?? '—'}</span>,
    },
    {
      key: 'date',
      header: 'Date',
      render: (row) => {
        if (!row.date) return '—'
        return new Date(row.date).toLocaleDateString('en-PK', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      },
    },
    {
      key: 'startTime',
      header: 'Start Time',
      render: (row) => <span>{row.startTime ?? '—'}</span>,
    },
    {
      key: 'totalMarks',
      header: 'Total Marks',
      render: (row) => <span>{row.totalMarks ?? '—'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        const cfg = STATUS_BADGE[row.status] ?? { variant: 'neutral' as const, label: row.status }
        return <Badge variant={cfg.variant}>{cfg.label}</Badge>
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <Tooltip content="Enter Results">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEnterResults(row)}
              icon={<ClipboardList className="w-3.5 h-3.5" />}
            >
              Results
            </Button>
          </Tooltip>
          <Tooltip content="Edit Exam">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(row)}
              icon={<Edit2 className="w-3.5 h-3.5" />}
            />
          </Tooltip>
          <Tooltip content="Delete Exam">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(row.id)}
              icon={<Trash2 className="w-3.5 h-3.5" />}
              className="text-[var(--danger)] hover:text-[var(--danger)]"
            />
          </Tooltip>
        </div>
      ),
    },
  ]

  return (
    <Table
      columns={columns}
      data={exams ?? []}
      loading={isLoading}
      emptyMessage="No exams found. Try adjusting your filters or schedule a new exam."
    />
  )
}
