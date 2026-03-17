/**
 * Component Library Barrel Export
 * Import all components from this single file
 * Example: import { Button, Card, Badge } from '@/components'
 */

// UI Components
export { Button } from './ui/Button'
export type { ButtonProps } from './ui/Button'

export { Input } from './ui/Input'
export type { InputProps } from './ui/Input'

export { Select } from './ui/Select'
export type { SelectProps, SelectOption } from './ui/Select'

export { Badge } from './ui/Badge'
export type { BadgeProps } from './ui/Badge'

export { Card } from './ui/Card'
export type { CardProps } from './ui/Card'

export { StatCard } from './ui/StatCard'
export type { StatCardProps } from './ui/StatCard'

export { Modal } from './ui/Modal'
export type { ModalProps } from './ui/Modal'

export { ConfirmDialog } from './ui/ConfirmDialog'
export type { ConfirmDialogProps } from './ui/ConfirmDialog'

export { Skeleton } from './ui/Skeleton'
export type { SkeletonProps } from './ui/Skeleton'

export { EmptyState } from './ui/EmptyState'
export type { EmptyStateProps } from './ui/EmptyState'

export { Table } from './ui/Table'
export type { TableProps, TableColumn } from './ui/Table'

export { Pagination } from './ui/Pagination'
export type { PaginationProps } from './ui/Pagination'

export { Toast, ToastContainer } from './ui/Toast'

// Layout Components
export { default as Sidebar } from './layout/Sidebar'

export { TopBar } from './layout/TopBar'
export type { TopBarProps } from './layout/TopBar'

export { PageHeader } from './layout/PageHeader'
export type { PageHeaderProps } from './layout/PageHeader'

export { MainLayout } from './layout/MainLayout'
export type { MainLayoutProps } from './layout/MainLayout'

// Display Components
export { AttendanceCard } from './displays/AttendanceCard'
export type { AttendanceCardProps, AttendanceStatus } from './displays/AttendanceCard'

export { TimetableGrid } from './displays/TimetableGrid'
export type { TimetableGridProps, TimetableSlot } from './displays/TimetableGrid'

export { MarksEntryRow } from './displays/MarksEntryRow'
export type { MarksEntryRowProps } from './displays/MarksEntryRow'

export { FeeStatusCard } from './displays/FeeStatusCard'
export type { FeeStatusCardProps } from './displays/FeeStatusCard'
