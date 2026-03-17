'use client'

import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import Skeleton from './Skeleton'
import EmptyState from './EmptyState'

/**
 * Table component with loading and empty states
 * @param columns - Column definitions
 * @param data - Data rows
 * @param loading - Show loading skeleton
 * @param onRowClick - Row click handler
 * @param emptyMessage - Message when no data
 * @param striped - Alternate row backgrounds
 * @param caption - Table caption
 */
export interface TableColumn<T> {
  key: string
  header: string
  render?: (row: T, index: number) => ReactNode
  className?: string
}

export interface TableProps<T> {
  columns: TableColumn<T>[]
  data: T[]
  loading?: boolean
  onRowClick?: (row: T, index: number) => void
  emptyMessage?: string
  striped?: boolean
  caption?: string
  className?: string
}

export function Table<T extends Record<string, unknown>>({
  columns,
  data,
  loading = false,
  onRowClick,
  emptyMessage = 'No data available',
  striped = false,
  caption,
  className,
}: TableProps<T>) {
  if (loading) {
    return <Skeleton variant="table" className={className} />
  }

  if (data.length === 0) {
    return (
      <div
        className={cn(
          'bg-[var(--surface)] rounded-card border border-[var(--border)]',
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
        'bg-[var(--surface)] rounded-card border border-[var(--border)] overflow-hidden',
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
            <tr className="bg-teal-700 dark:bg-charcoal-700">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'text-gold-300 font-body text-xs uppercase tracking-wider font-semibold',
                    'py-4 px-6 text-left',
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr
                key={index}
                onClick={() => onRowClick?.(row, index)}
                className={cn(
                  'border-b border-[var(--border)] last:border-b-0',
                  'transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-[var(--bg-secondary)]',
                  striped && index % 2 === 1 && 'bg-[var(--surface-alt)]'
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Table
