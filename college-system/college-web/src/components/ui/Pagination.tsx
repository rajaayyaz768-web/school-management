'use client'

import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * Pagination component for paginated data
 * @param currentPage - Current page number (1-indexed)
 * @param totalPages - Total number of pages
 * @param onPageChange - Page change handler
 * @param totalItems - Total item count
 * @param itemsPerPage - Items per page
 */
export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  totalItems?: number
  itemsPerPage?: number
  className?: string
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage = 25,
  className,
}: PaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems || 0)

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = []
    const showEllipsis = totalPages > 7

    if (!showEllipsis) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    // Always show first page
    pages.push(1)

    if (currentPage > 3) {
      pages.push('ellipsis')
    }

    // Show pages around current
    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)

    for (let i = start; i <= end; i++) {
      if (!pages.includes(i)) pages.push(i)
    }

    if (currentPage < totalPages - 2) {
      pages.push('ellipsis')
    }

    // Always show last page
    if (!pages.includes(totalPages)) {
      pages.push(totalPages)
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 py-4',
        className
      )}
    >
      {/* Info text */}
      {totalItems !== undefined && (
        <p className="font-body text-sm text-[var(--text-muted)]">
          Showing {startItem}–{endItem} of {totalItems.toLocaleString()} results
        </p>
      )}

      {/* Page buttons */}
      <div className="flex items-center gap-1">
        {/* Previous */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={cn(
            'w-9 h-9 rounded-[var(--radius-sm)] flex items-center justify-center',
            'transition-colors font-body text-sm',
            'bg-[var(--surface)] border border-[var(--border)] text-[var(--text)]',
            'hover:bg-[var(--bg-secondary)]',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[var(--surface)]'
          )}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page numbers */}
        {pageNumbers.map((page, index) =>
          page === 'ellipsis' ? (
            <span
              key={`ellipsis-${index}`}
              className="w-9 h-9 flex items-center justify-center text-[var(--text-muted)]"
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={cn(
                'w-9 h-9 rounded-[var(--radius-sm)] flex items-center justify-center',
                'transition-colors font-body text-sm font-medium',
                page === currentPage
                  ? 'bg-teal-700 dark:bg-gold-400 text-white dark:text-charcoal-900'
                  : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--bg-secondary)]'
              )}
            >
              {page}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={cn(
            'w-9 h-9 rounded-[var(--radius-sm)] flex items-center justify-center',
            'transition-colors font-body text-sm',
            'bg-[var(--surface)] border border-[var(--border)] text-[var(--text)]',
            'hover:bg-[var(--bg-secondary)]',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[var(--surface)]'
          )}
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default Pagination
