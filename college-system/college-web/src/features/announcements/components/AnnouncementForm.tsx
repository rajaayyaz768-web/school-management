'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { DatePicker } from '@/components/ui/DatePicker'
import { useCampuses } from '@/features/campus/hooks/useCampus'
import { usePrograms } from '@/features/programs/hooks/usePrograms'
import { useProgramGrades, useSections } from '@/features/sections/hooks/useSections'
import { useCreateAnnouncement, useUpdateAnnouncement } from '../hooks/useAnnouncements'
import { Announcement, CreateAnnouncementInput, AnnouncementAudience } from '../types/announcements.types'

const AUDIENCE_OPTIONS = [
  { value: 'ALL', label: 'All' },
  { value: 'STUDENTS', label: 'Students' },
  { value: 'PARENTS', label: 'Parents' },
  { value: 'TEACHERS', label: 'Teachers' },
  { value: 'SECTION', label: 'Section' },
]

interface FormValues {
  title: string
  content: string
  audience: AnnouncementAudience
  campusId: string
  programId: string
  gradeId: string
  sectionId: string
  publishedAt: string
  expiresAt: string
}

interface AnnouncementFormProps {
  announcement?: Announcement
  onSuccess: () => void
  onCancel: () => void
}

export function AnnouncementForm({ announcement, onSuccess, onCancel }: AnnouncementFormProps) {
  const isEdit = !!announcement

  const { register, handleSubmit, watch, control, setValue, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      title: announcement?.title ?? '',
      content: announcement?.content ?? '',
      audience: announcement?.audience ?? 'ALL',
      campusId: announcement?.campusId ?? '',
      programId: '',
      gradeId: '',
      sectionId: announcement?.sectionId ?? '',
      publishedAt: announcement?.publishedAt
        ? announcement.publishedAt.split('T')[0]
        : new Date().toISOString().split('T')[0],
      expiresAt: announcement?.expiresAt
        ? announcement.expiresAt.split('T')[0]
        : '',
    },
  })

  const watchAudience = watch('audience')
  const watchCampusId = watch('campusId')
  const watchProgramId = watch('programId')
  const watchGradeId = watch('gradeId')
  const isSection = watchAudience === 'SECTION'

  const { data: campuses } = useCampuses()
  const { data: programs } = usePrograms(watchCampusId || undefined)
  const { data: grades } = useProgramGrades(watchProgramId || undefined)
  const { data: sections } = useSections(watchGradeId || undefined)

  const createMutation = useCreateAnnouncement()
  const updateMutation = useUpdateAnnouncement()
  const isPending = createMutation.isPending || updateMutation.isPending

  const onSubmit = (values: FormValues) => {
    const payload: CreateAnnouncementInput = {
      title: values.title,
      content: values.content,
      audience: values.audience,
      campusId: values.campusId || undefined,
      sectionId: isSection && values.sectionId ? values.sectionId : undefined,
      publishedAt: values.publishedAt ? new Date(values.publishedAt).toISOString() : undefined,
      expiresAt: values.expiresAt ? new Date(values.expiresAt).toISOString() : undefined,
    }

    if (isEdit) {
      updateMutation.mutate(
        { id: announcement.id, data: payload },
        { onSuccess }
      )
    } else {
      createMutation.mutate(payload, { onSuccess })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Title */}
      <Input
        label="Title"
        placeholder="Announcement title..."
        error={errors.title?.message}
        {...register('title', { required: 'Title is required' })}
      />

      {/* Content */}
      <Textarea
        label="Content"
        placeholder="Write announcement content here..."
        rows={6}
        error={errors.content?.message}
        {...register('content', { required: 'Content is required' })}
      />

      {/* Audience + Campus */}
      <div className="grid grid-cols-2 gap-4">
        <Controller
          name="audience"
          control={control}
          render={({ field }) => (
            <Select
              label="Audience"
              value={field.value ?? ''}
              onChange={(e) => {
                field.onChange(e.target.value)
                if (e.target.value !== 'SECTION') {
                  setValue('sectionId', '')
                  setValue('programId', '')
                  setValue('gradeId', '')
                }
              }}
              options={AUDIENCE_OPTIONS}
            />
          )}
        />
        <Controller
          name="campusId"
          control={control}
          render={({ field }) => (
            <Select
              label="Campus"
              value={field.value ?? ''}
              onChange={(e) => {
                field.onChange(e.target.value)
                setValue('programId', '')
                setValue('gradeId', '')
                setValue('sectionId', '')
              }}
              options={[
                { value: '', label: 'All Campuses' },
                ...(campuses ?? []).map((c) => ({ value: c.id, label: c.name })),
              ]}
            />
          )}
        />
      </div>

      {/* Section cascading (only when audience = SECTION) */}
      {isSection && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="programId"
              control={control}
              render={({ field }) => (
                <Select
                  label="Program"
                  value={field.value ?? ''}
                  onChange={(e) => {
                    field.onChange(e.target.value)
                    setValue('gradeId', '')
                    setValue('sectionId', '')
                  }}
                  options={[
                    { value: '', label: 'Select Program' },
                    ...(programs ?? []).map((p) => ({ value: p.id, label: p.name })),
                  ]}
                />
              )}
            />
            <Controller
              name="gradeId"
              control={control}
              render={({ field }) => (
                <Select
                  label="Grade"
                  value={field.value ?? ''}
                  onChange={(e) => {
                    field.onChange(e.target.value)
                    setValue('sectionId', '')
                  }}
                  options={[
                    { value: '', label: 'Select Grade' },
                    ...(grades ?? []).map((g) => ({ value: g.id, label: g.name })),
                  ]}
                />
              )}
            />
          </div>
          <Controller
            name="sectionId"
            control={control}
            rules={isSection ? { required: 'Section is required when audience is Section' } : {}}
            render={({ field }) => (
              <Select
                label="Section"
                value={field.value ?? ''}
                onChange={field.onChange}
                error={errors.sectionId?.message}
                options={[
                  { value: '', label: 'Select Section' },
                  ...(sections ?? []).map((s) => ({ value: s.id, label: s.name })),
                ]}
              />
            )}
          />
        </>
      )}

      {/* Publish + Expiry dates */}
      <div className="grid grid-cols-2 gap-4">
        <Controller
          name="publishedAt"
          control={control}
          render={({ field }) => (
            <DatePicker
              label="Publish Date"
              value={field.value ?? ''}
              onChange={field.onChange}
            />
          )}
        />
        <Controller
          name="expiresAt"
          control={control}
          render={({ field }) => (
            <DatePicker
              label="Expiry Date (optional)"
              value={field.value ?? ''}
              onChange={field.onChange}
            />
          )}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2 border-t border-[var(--border)]">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" loading={isPending}>
          {isEdit ? 'Save Changes' : 'Post Announcement'}
        </Button>
      </div>
    </form>
  )
}

export default AnnouncementForm
