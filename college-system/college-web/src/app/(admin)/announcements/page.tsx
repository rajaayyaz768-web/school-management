'use client'

import { useState } from 'react'
import { Plus, X, Megaphone } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Card } from '@/components/ui/Card'
import { useAnnouncements, useDeleteAnnouncement } from '@/features/announcements/hooks/useAnnouncements'
import { AnnouncementForm } from '@/features/announcements/components/AnnouncementForm'
import { AnnouncementList } from '@/features/announcements/components/AnnouncementList'
import { Announcement, AnnouncementAudience } from '@/features/announcements/types/announcements.types'

const AUDIENCE_OPTIONS = [
  { value: '', label: 'All Audiences' },
  { value: 'ALL', label: 'All' },
  { value: 'STUDENTS', label: 'Students' },
  { value: 'PARENTS', label: 'Parents' },
  { value: 'TEACHERS', label: 'Teachers' },
  { value: 'SECTION', label: 'Section' },
]

const ACTIVE_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'true', label: 'Active Only' },
  { value: 'false', label: 'Expired' },
]

export default function AnnouncementsPage() {
  const [filterAudience, setFilterAudience] = useState('')
  const [filterActive, setFilterActive] = useState('')

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | undefined>()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filters = {
    audience: filterAudience || undefined,
    isActive: filterActive === '' ? undefined : filterActive === 'true',
  }

  const { data: announcements, isLoading } = useAnnouncements(filters)
  const deleteMutation = useDeleteAnnouncement()

  const hasFilters = !!(filterAudience || filterActive)

  const handleOpenCreate = () => {
    setEditingAnnouncement(undefined)
    setIsFormOpen(true)
  }

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement)
    setIsFormOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (!deleteId) return
    deleteMutation.mutate(deleteId, {
      onSuccess: () => setDeleteId(null),
    })
  }

  const handleClearFilters = () => {
    setFilterAudience('')
    setFilterActive('')
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-8">
      <PageHeader
        title="Announcements"
        subtitle="Post and manage notices for students, parents, and staff"
        breadcrumb={[{ label: 'Home', href: '/admin' }, { label: 'Announcements' }]}
        actions={
          <Button onClick={handleOpenCreate} icon={<Plus className="w-4 h-4" />}>
            New Announcement
          </Button>
        }
      />

      <Card className="flex-1 overflow-hidden mt-6 flex flex-col">
        {/* Filter bar */}
        <div className="flex flex-wrap items-end gap-4 p-6 border-b border-[var(--border)]">
          <Select
            label="Audience"
            value={filterAudience}
            onChange={(e) => setFilterAudience(e.target.value)}
            options={AUDIENCE_OPTIONS}
          />
          <Select
            label="Status"
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
            options={ACTIVE_OPTIONS}
          />
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              icon={<X className="w-3.5 h-3.5" />}
              className="mb-0.5"
            >
              Clear Filters
            </Button>
          )}
        </div>

        {/* List */}
        <div className="flex-1 overflow-auto p-6 bg-[var(--background)]">
          <AnnouncementList
            announcements={announcements ?? []}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={(id) => setDeleteId(id)}
            showActions
          />
        </div>
      </Card>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingAnnouncement ? 'Edit Announcement' : 'New Announcement'}
        subtitle={
          editingAnnouncement
            ? 'Update the announcement details below'
            : 'Fill in the details to post a new announcement'
        }
        size="lg"
      >
        <AnnouncementForm
          announcement={editingAnnouncement}
          onSuccess={() => setIsFormOpen(false)}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Announcement"
        message="Delete this announcement? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
