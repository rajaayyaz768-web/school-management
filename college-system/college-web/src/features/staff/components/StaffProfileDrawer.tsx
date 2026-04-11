'use client';

import { useState } from 'react';
import { Staff } from '../types/staff.types';
import { useStaffById } from '../hooks/useStaff';
import { Drawer, Avatar, Badge, Button, Tabs, TabPanel, Skeleton, ErrorState } from '@/components/ui';

export interface StaffProfileDrawerProps {
  staffId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (staff: Staff) => void;
}

export function StaffProfileDrawer({ staffId, isOpen, onClose, onEdit }: StaffProfileDrawerProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const { data: staff, isLoading, isError, refetch } = useStaffById(isOpen ? staffId : null);

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
                <div>
                  <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Last Login</label>
                  <p className="text-sm text-[var(--text)] mt-1">Not tracked globally yet</p>
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
