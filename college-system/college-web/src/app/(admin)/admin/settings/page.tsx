'use client'

import { Settings, User, Bell, Shield, Building2 } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useAuthStore } from '@/store/authStore'

function SettingsSection({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <Card className="space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-[var(--border)]">
        <div className="w-7 h-7 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)]">
          {icon}
        </div>
        <h3 className="font-semibold text-[var(--text)]">{title}</h3>
      </div>
      {children}
    </Card>
  )
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
      <span className="text-sm text-[var(--text-muted)]">{label}</span>
      <span className="text-sm font-medium text-[var(--text)]">{value}</span>
    </div>
  )
}

export default function AdminSettingsPage() {
  const { user } = useAuthStore()

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Settings"
        breadcrumb={[{ label: 'Home', href: '/admin/dashboard' }, { label: 'Settings' }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Info */}
        <SettingsSection icon={<User className="w-4 h-4" />} title="Account Information">
          <InfoRow label="Email" value={user?.email ?? '—'} />
          <InfoRow label="Role" value={<Badge variant="info">Admin</Badge>} />
          <InfoRow label="Campus" value={user?.campusId ? 'Assigned' : 'All Campuses'} />
          <InfoRow label="Status" value={<Badge variant="success">Active</Badge>} />
        </SettingsSection>

        {/* System Info */}
        <SettingsSection icon={<Building2 className="w-4 h-4" />} title="System Information">
          <InfoRow label="Platform" value="School Management System" />
          <InfoRow label="Version" value="1.0.0" />
          <InfoRow label="Environment" value={<Badge variant="success">Production</Badge>} />
          <InfoRow label="Last Login" value={new Date().toLocaleDateString('en-PK', { dateStyle: 'medium' })} />
        </SettingsSection>

        {/* Permissions */}
        <SettingsSection icon={<Shield className="w-4 h-4" />} title="Admin Permissions">
          {[
            'Manage Students & Parents',
            'Manage Staff',
            'Configure Fee Structures',
            'Record Attendance',
            'Enter Exam Results',
            'Manage Timetable',
            'Post Announcements',
            'View Reports',
          ].map((perm) => (
            <div key={perm} className="flex items-center gap-2 py-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              <span className="text-sm text-[var(--text)]">{perm}</span>
            </div>
          ))}
        </SettingsSection>

        {/* Notifications */}
        <SettingsSection icon={<Bell className="w-4 h-4" />} title="Notifications">
          {[
            { label: 'Absence Alerts', enabled: true },
            { label: 'New Student Registrations', enabled: true },
            { label: 'Fee Overdue Reminders', enabled: true },
            { label: 'Exam Schedule Updates', enabled: true },
            { label: 'System Maintenance Notices', enabled: false },
          ].map(({ label, enabled }) => (
            <div key={label} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
              <span className="text-sm text-[var(--text)]">{label}</span>
              <Badge variant={enabled ? 'success' : 'neutral'}>{enabled ? 'On' : 'Off'}</Badge>
            </div>
          ))}
        </SettingsSection>
      </div>

      <p className="text-xs text-[var(--text-muted)] text-center">
        To change account credentials or advanced settings, contact your system administrator.
      </p>
    </div>
  )
}
