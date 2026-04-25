'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserCog, Plus, Building2, Mail, CheckCircle, XCircle } from 'lucide-react';
import { useAdmins, useCreateAdmin } from '@/features/admin-management/hooks/useAdminManagement';
import { useCampuses } from '@/features/campus/hooks/useCampus';
import { Modal } from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';

const createAdminSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().optional(),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  campusId: z.string().min(1, 'Campus is required'),
  employeeCode: z.string().optional(),
});

type FormValues = z.infer<typeof createAdminSchema>;

export default function AdminsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: admins, isLoading, error } = useAdmins();
  const { data: campuses } = useCampuses();
  const createAdmin = useCreateAdmin();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(createAdminSchema) });

  const onSubmit = (values: FormValues) => {
    createAdmin.mutate(values, {
      onSuccess: () => {
        setIsOpen(false);
        reset();
      },
    });
  };

  const campusOptions = (campuses ?? []).map((c: { id: string; name: string }) => ({
    value: c.id,
    label: c.name,
  }));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--gold)]/15">
            <UserCog className="h-5 w-5 text-[var(--gold)]" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-[var(--text)]">Admin Management</h1>
            <p className="font-body text-sm text-[var(--text-muted)]">
              Create campus administrator accounts
            </p>
          </div>
        </div>
        <Button onClick={() => setIsOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Admin
        </Button>
      </div>

      {/* Table */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-14 rounded-[var(--radius-lg)] bg-[var(--surface)] animate-pulse" />
          ))}
        </div>
      )}

      {error && <ErrorState description="Failed to load admins. Please try again." />}

      {!isLoading && !error && admins?.length === 0 && (
        <EmptyState
          icon={<UserCog className="h-8 w-8" />}
          title="No admins yet"
          description="Create the first campus administrator account to get started."
        />
      )}

      {!isLoading && !error && admins && admins.length > 0 && (
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] overflow-hidden bg-[var(--surface)]">
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface-alt,var(--surface))]">
                <th className="px-4 py-3 text-left font-medium text-[var(--text-muted)]">Name</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--text-muted)]">Email</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--text-muted)]">Campus</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--text-muted)]">Status</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--text-muted)]">Created</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-hover,var(--border))]/20 transition-colors">
                  <td className="px-4 py-3 font-medium text-[var(--text)]">
                    {admin.staffProfile
                      ? `${admin.staffProfile.firstName} ${admin.staffProfile.lastName}`.trim()
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-muted)]">
                    <span className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 shrink-0" />
                      {admin.email}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--text-muted)]">
                    {admin.campus ? (
                      <span className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 shrink-0" />
                        {admin.campus.name}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {admin.isActive ? (
                      <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                        <CheckCircle className="h-3.5 w-3.5" /> Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[var(--text-muted)]">
                        <XCircle className="h-3.5 w-3.5" /> Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-muted)]">
                    {new Date(admin.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Admin Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => { setIsOpen(false); reset(); }}
        title="Create Admin Account"
        subtitle="This admin will only see data for their assigned campus."
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => { setIsOpen(false); reset(); }}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit(onSubmit)}
              disabled={createAdmin.isPending}
            >
              {createAdmin.isPending ? 'Creating…' : 'Create Admin'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">First Name *</label>
              <Input {...register('firstName')} placeholder="e.g. Ahmad" />
              {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Last Name</label>
              <Input {...register('lastName')} placeholder="e.g. Khan" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Email Address *</label>
            <Input {...register('email')} type="email" placeholder="admin@school.edu.pk" />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Password *</label>
            <Input {...register('password')} type="password" placeholder="Min 8 characters" />
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Assign Campus *</label>
            <Select
              {...register('campusId')}
              options={campusOptions}
              placeholder="Select campus"
            />
            {errors.campusId && <p className="mt-1 text-xs text-red-500">{errors.campusId.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
              Employee Code <span className="text-[var(--text-muted)] font-normal">(optional)</span>
            </label>
            <Input {...register('employeeCode')} placeholder="Auto-generated if blank" />
          </div>
        </div>
      </Modal>
    </div>
  );
}
