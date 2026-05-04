'use client';

import { useState } from 'react';
import { Staff } from '../types/staff.types';
import { useStaffById, useResendStaffCredentials } from '../hooks/useStaff';
import { useStaffAttendanceHistory } from '@/features/staff-attendance/hooks/useStaffAttendance';
import { Drawer, Avatar, Badge, Button, Tabs, TabPanel, Skeleton, ErrorState } from '@/components/ui';
import { Eye, EyeOff, Copy, Mail } from 'lucide-react';

export interface StaffProfileDrawerProps {
  staffId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (staff: Staff) => void;
}

export function StaffProfileDrawer({ staffId, isOpen, onClose, onEdit }: StaffProfileDrawerProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showPassword, setShowPassword] = useState(false);
  const resendMutation = useResendStaffCredentials();
  const { data: staff, isLoading, isError, refetch } = useStaffById(isOpen ? staffId : null);
  const now = new Date();
  const { data: attendanceHistory, isLoading: isAttendanceLoading } = useStaffAttendanceHistory(
    isOpen ? staffId : null,
    now.getMonth() + 1,
    now.getFullYear()
  );

  const getEmploymentBadge = (type?: string) => {
    switch (type) {
      case 'PERMANENT': return 'info';
      case 'CONTRACT': return 'warning';
      default: return 'neutral';
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Staff Profile"
      size="md"
    >
      {isLoading ? (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton variant="circle" className="w-16 h-16" />
            <div className="space-y-2 flex-1">
              <Skeleton variant="text" className="w-1/2" />
              <Skeleton variant="text" className="w-1/3" />
            </div>
          </div>
          <Skeleton variant="card" className="h-[200px]" />
        </div>
      ) : isError ? (
        <ErrorState action={{ label: 'Retry', onClick: () => refetch() }} />
      ) : staff ? (
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Avatar name={`${staff.firstName} ${staff.lastName}`} src={staff.photoUrl || undefined} size="lg" />
            <div>
              <h2 className="text-xl font-bold text-[var(--text)]">
                {staff.firstName} {staff.lastName}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-sm text-[var(--text-muted)]">{staff.staffCode}</span>
                <Badge variant={getEmploymentBadge(staff.employmentType)}>{staff.employmentType}</Badge>
              </div>
            </div>
          </div>

          <Tabs 
            tabs={[{ id: 'overview', label: 'Overview' }, { id: 'account', label: 'Account' }]} 
            activeTab={activeTab} 
            onChange={setActiveTab} 
          />

          <div className="flex-1 mt-6 overflow-y-auto pr-2 pb-6 space-y-4">
            <TabPanel tabId="overview" activeTab={activeTab}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Designation</label>
                  <p className="text-sm text-[var(--text)] mt-1">{staff.designation || '—'}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Gender</label>
                  <p className="text-sm text-[var(--text)] mt-1">{staff.gender}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Joining Date</label>
                  <p className="text-sm text-[var(--text)] mt-1">
                    {staff.joiningDate ? new Date(staff.joiningDate).toLocaleDateString() : '—'}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Phone</label>
                  <p className="text-sm text-[var(--text)] mt-1">{staff.phone || '—'}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Email</label>
                  <p className="text-sm text-[var(--text)] mt-1 break-all">{staff.user?.email || '—'}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Campus Assignment</label>
                  <div className="mt-2">
                    {staff.campus ? (
                      <Badge variant="neutral">{staff.campus.name}</Badge>
                    ) : (
                      <span className="text-sm text-[var(--text-muted)]">Unassigned</span>
                    )}
                  </div>
                </div>

                {/* ─── This Month's Attendance ─────────────────────────── */}
                <div className="col-span-2 pt-3 border-t border-[var(--border)]">
                  <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                    This Month&apos;s Attendance
                  </label>
                  {isAttendanceLoading ? (
                    <div className="mt-3 grid grid-cols-4 gap-2">
                      {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
                    </div>
                  ) : attendanceHistory && attendanceHistory.summary.totalDays > 0 ? (
                    <div className="mt-3 grid grid-cols-4 gap-2">
                      {[
                        { label: 'Present', value: attendanceHistory.summary.presentDays, color: 'text-emerald-500' },
                        { label: 'Absent', value: attendanceHistory.summary.absentDays, color: 'text-red-500' },
                        { label: 'Leave', value: attendanceHistory.summary.leaveDays, color: 'text-amber-500' },
                        {
                          label: 'Rate',
                          value: `${Math.round((attendanceHistory.summary.presentDays / attendanceHistory.summary.totalDays) * 100)}%`,
                          color: (() => {
                            const pct = Math.round((attendanceHistory.summary.presentDays / attendanceHistory.summary.totalDays) * 100);
                            return pct >= 85 ? 'text-emerald-500' : pct >= 70 ? 'text-amber-500' : 'text-red-500';
                          })(),
                        },
                      ].map((stat) => (
                        <div key={stat.label} className="flex flex-col items-center justify-center bg-[var(--surface-container-low)] rounded-lg py-2.5 px-1">
                          <span className={`text-xl font-bold ${stat.color}`}>{stat.value}</span>
                          <span className="text-[10px] text-[var(--text-muted)] mt-0.5 font-medium">{stat.label}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[var(--text-muted)] mt-2 italic">No attendance records this month.</p>
                  )}
                </div>
              </div>
            </TabPanel>

            <TabPanel tabId="account" activeTab={activeTab}>
              <div className="space-y-4 bg-[var(--surface-container-low)] p-4 rounded-lg">
                <div>
                  <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Login Email</label>
                  <p className="text-sm text-[var(--text)] font-medium mt-1 break-all">
                    {staff.user?.email || 'No linked account'}
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Role</label>
                  {staff.user?.role && <Badge variant="info">{staff.user.role}</Badge>}
                </div>
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Account Status</label>
                  {staff.user && (
                    <Badge variant={staff.user.isActive ? 'success' : 'danger'}>
                      {staff.user.isActive ? 'Active' : 'Suspended'}
                    </Badge>
                  )}
                </div>

                {/* ─── Portal Password ────────────────────────────────────── */}
                <div className="pt-2 border-t border-[var(--border)]">
                  <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Portal Password</label>
                  {staff.temporaryPassword ? (
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center gap-2 bg-[var(--surface)] border border-[var(--border)] rounded-md px-3 py-2">
                        <span className="flex-1 font-mono text-sm text-[var(--text)] tracking-widest">
                          {showPassword ? staff.temporaryPassword : '••••••••'}
                        </span>
                        <button
                          onClick={() => setShowPassword(v => !v)}
                          className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                          title={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => navigator.clipboard.writeText(staff.temporaryPassword!)}
                          className="text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors"
                          title="Copy password"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-amber-600">
                        This is the current temporary password. It will be cleared once the teacher changes it.
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-[var(--text-muted)] mt-1 italic">
                      Teacher has set their own password.
                    </p>
                  )}
                </div>

                {/* ─── Resend Credentials ─────────────────────────────────── */}
                <div className="pt-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => resendMutation.mutate(staff.id)}
                    loading={resendMutation.isPending}
                    disabled={!staff.temporaryPassword}
                    className="flex items-center gap-2"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    Resend Login Credentials by Email
                  </Button>
                  {!staff.temporaryPassword && (
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      Not available — teacher has already changed their password.
                    </p>
                  )}
                </div>
              </div>
            </TabPanel>
          </div>

          <div className="flex justify-end gap-3 pt-4 mt-auto border-t border-[var(--border)]">
            <Button variant="secondary" onClick={onClose}>Close</Button>
            <Button variant="primary" onClick={() => onEdit(staff)}>Edit Profile</Button>
          </div>
        </div>
      ) : null}
    </Drawer>
  );
}
