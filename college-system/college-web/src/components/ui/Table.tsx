'use client'

import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import Skeleton from './Skeleton'
import EmptyState from './EmptyState'

/**
 * Table component with loading/empty states
 * Data-dense elegance: sticky header, row hover tint, selected accent, alternating rows
 */
export interface TableColumn<T> {
  key: string
  header: string
  render?: (row: T, index: number) => ReactNode
  className?: string
  sortable?: boolean
}

export interface TableProps<T> {
  columns: TableColumn<T>[]
  data: T[]
  loading?: boolean
  onRowClick?: (row: T, index: number) => void
  emptyMessage?: string
  striped?: boolean
  caption?: string
  selectedRows?: number[]
  className?: string
}

export function Table<T extends Record<string, unknown>>({
  columns,
  data,
  loading = false,
  onRowClick,
  emptyMessage = 'No data available',
  striped = true,
  caption,
  selectedRows = [],
  className,
}: TableProps<T>) {
  if (loading) {
    return <Skeleton variant="table" className={className} />
  }

  if (data.length === 0) {
    return (
      <div
        className={cn(
          'bg-[var(--surface)] rounded-[var(--radius-lg)] border border-[var(--border)]',
          className
        )}
      >
        <EmptyState
          title={emptyMessage}
          description="Try adjusting your filters or adding new records"
        />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'bg-[var(--surface)] rounded-[var(--radius-lg)] border border-[var(--border)] overflow-hidden shadow-[var(--shadow-sm)]',
        className
      )}
    >
      {caption && (
        <div className="px-6 py-3 border-b border-[var(--border)]">
          <p className="font-body text-sm font-medium text-[var(--text)]">
            {caption}
          </p>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[var(--primary-dark)] sticky top-0 z-10">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'text-[var(--gold-light)] font-body text-[11px] uppercase tracking-[0.06em] font-semibold',
                    'py-3.5 px-6 text-left',
                    'border-b border-white/10',
                    col.sortable && 'cursor-pointer select-none hover:text-[var(--gold)]',
                    col.className
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    {col.header}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => {
              const isSelected = selectedRows.includes(index)

              return (
                <tr
                  key={index}
                  onClick={() => onRowClick?.(row, index)}
                  className={cn(
                    'border-b border-[var(--border)]/50 last:border-b-0',
                    'transition-colors duration-[120ms]',
                    onRowClick && 'cursor-pointer',
                    // Hover
                    'hover:bg-[var(--surface-hover)]',
                    // Striped
                    striped && index % 2 === 1 && 'bg-[var(--surface-alt)]/50',
                    // Selected
                    isSelected && 'bg-[var(--primary)]/5 border-l-[3px] border-l-[var(--primary)]',
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        'font-body text-sm text-[var(--text)] py-3 px-6',
                        col.className
                      )}
                    >
                      {col.render
                        ? col.render(row, index)
                        : (row[col.key] as ReactNode)}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Table
