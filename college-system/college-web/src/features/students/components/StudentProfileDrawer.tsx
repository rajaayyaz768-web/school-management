'use client';

import { Student } from '../types/students.types';
import { useStudentById } from '../hooks/useStudents';
import {
  Drawer,
  Avatar,
  Badge,
  Button,
  Tabs,
  TabPanel,
  Skeleton,
  ErrorState,
} from '@/components/ui';

interface StudentProfileDrawerProps {
  studentId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (student: Student) => void;
}

export function StudentProfileDrawer({
  studentId,
  isOpen,
  onClose,
  onEdit,
}: StudentProfileDrawerProps) {
  const { data: student, isLoading, error } = useStudentById(studentId);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'UNASSIGNED': return 'warning';
      case 'SUSPENDED': return 'danger';
      default: return 'neutral';
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      );
    }

    if (error || !student) {
      return (
        <ErrorState 
          title="Could not load profile" 
          message="There was a problem retrieving student details." 
        />
      );
    }

    const personalTabs = [
      { id: 'personal', label: 'Personal' },
      { id: 'academic', label: 'Academic' },
      { id: 'account', label: 'Account' },
    ];

    return (
      <div className="flex flex-col h-full">
        {/* Header Section */}
        <div className="flex items-start gap-4 mb-6 pb-6 border-b border-[var(--border)]">
          <Avatar
            src={student.photoUrl || undefined}
            fallback={`${student.firstName[0]}${student.lastName[0]}`}
            size="xl"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-[var(--text)] truncate">
                {student.firstName} {student.lastName}
              </h2>
              <Badge variant={getStatusVariant(student.status)}>
                {student.status.charAt(0) + student.status.slice(1).toLowerCase()}
              </Badge>
            </div>
            <div className="text-sm text-[var(--text-muted)] mt-1 flex gap-2 items-center">
              <span>{student.rollNumber || 'Unassigned Roll No'}</span>
              <span>•</span>
              <span className="truncate">{student.campus.name}</span>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="flex-1 overflow-y-auto pr-2">
          <Tabs tabs={personalTabs} defaultActiveId="personal">
            <TabPanel id="personal" className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[var(--text-muted)] font-medium mb-1 uppercase tracking-wider">Gender</p>
                  <p className="text-sm font-medium text-[var(--text)]">{student.gender}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)] font-medium mb-1 uppercase tracking-wider">Date of Birth</p>
                  <p className="text-sm font-medium text-[var(--text)]">
                    {student.dob ? new Date(student.dob).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)] font-medium mb-1 uppercase tracking-wider">Phone</p>
                  <p className="text-sm font-medium text-[var(--text)]">{student.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)] font-medium mb-1 uppercase tracking-wider">Guardian Phone</p>
                  <p className="text-sm font-medium text-[var(--text)]">{student.guardianPhone || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-[var(--text-muted)] font-medium mb-1 uppercase tracking-wider">Home Address</p>
                  <p className="text-sm font-medium text-[var(--text)] leading-relaxed">{student.address || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-[var(--text-muted)] font-medium mb-1 uppercase tracking-wider">Enrollment Date</p>
                  <p className="text-sm font-medium text-[var(--text)]">{new Date(student.enrollmentDate).toLocaleDateString()}</p>
                </div>
              </div>
            </TabPanel>

            <TabPanel id="academic" className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[var(--text-muted)] font-medium mb-1 uppercase tracking-wider">Campus</p>
                  <p className="text-sm font-medium text-[var(--text)] truncate">{student.campus.name}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)] font-medium mb-1 uppercase tracking-wider">Assigned Section</p>
                  <p className="text-sm font-medium text-[var(--text)]">
                    {student.section?.name || 'Not assigned yet'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)] font-medium mb-1 uppercase tracking-wider">Ranking Marks</p>
                  <p className="text-sm font-medium text-[var(--text)]">
                    {student.rankingMarks !== null ? student.rankingMarks : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)] font-medium mb-1 uppercase tracking-wider">Roll Number</p>
                  <p className="text-sm font-medium text-[var(--text)]">{student.rollNumber || 'N/A'}</p>
                </div>
              </div>
            </TabPanel>

            <TabPanel id="account" className="space-y-6 py-4">
              <div className="p-4 bg-[var(--surface-container-low)] rounded-xl border border-[var(--border)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[var(--text-muted)] font-medium mb-1 uppercase tracking-wider">Email Address</p>
                    <p className="text-sm font-medium text-[var(--text)]">{student.user?.email}</p>
                  </div>
                  <Badge variant={student.user?.isActive ? 'success' : 'danger'}>
                    {student.user?.isActive ? 'Active Login' : 'Disabled'}
                  </Badge>
                </div>
              </div>
            </TabPanel>
          </Tabs>
        </div>

        {/* Footer Actions */}
        <div className="pt-6 border-t border-[var(--border)] mt-auto flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" onClick={() => onEdit(student)}>
            Edit Profile
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Student Profile"
      size="md"
    >
      {renderContent()}
    </Drawer>
  );
}
