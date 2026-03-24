'use client';

import { Parent } from '../types/parents.types';
import { useParentById, useUnlinkStudent } from '../hooks/useParents';
import {
  Drawer,
  Avatar,
  Badge,
  Button,
  Tabs,
  TabPanel,
  Skeleton,
  ErrorState,
  PhoneInput,
  ConfirmDialog,
  EmptyState,
} from '@/components/ui';
import { useState } from 'react';

interface ParentProfileDrawerProps {
  parentId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (parent: Parent) => void;
  onLinkStudent: (parentId: string) => void;
}

export function ParentProfileDrawer({
  parentId,
  isOpen,
  onClose,
  onEdit,
  onLinkStudent,
}: ParentProfileDrawerProps) {
  const { data: parent, isLoading, error } = useParentById(parentId);
  const unlinkMutation = useUnlinkStudent();

  const [studentToUnlink, setStudentToUnlink] = useState<string | null>(null);

  const handleConfirmUnlink = () => {
    if (parentId && studentToUnlink) {
      unlinkMutation.mutate(
        { parentId, studentId: studentToUnlink },
        { onSuccess: () => setStudentToUnlink(null) }
      );
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

    if (error || !parent) {
      return (
        <ErrorState 
          title="Could not load profile" 
          message="There was a problem retrieving parent details." 
        />
      );
    }

    const tabs = [
      { id: 'details', label: 'Details' },
      { id: 'students', label: 'Linked Students' },
    ];

    return (
      <div className="flex flex-col h-full">
        {/* Header Section */}
        <div className="flex items-start gap-4 mb-6 pb-6 border-b border-[var(--border)]">
          <Avatar
            fallback={`${parent.firstName[0]}${parent.lastName[0]}`}
            size="xl"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-[var(--text)] truncate">
                {parent.firstName} {parent.lastName}
              </h2>
              <Badge variant={parent.user?.isActive ? 'success' : 'danger'}>
                {parent.user?.isActive ? 'Active Login' : 'Disabled'}
              </Badge>
            </div>
            <div className="text-sm text-[var(--text-muted)] mt-1 flex gap-2 items-center">
              <span>Account Created {new Date(parent.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="flex-1 overflow-y-auto pr-2">
          <Tabs tabs={tabs} defaultActiveId="details">
            <TabPanel id="details" className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[var(--text-muted)] font-medium mb-1 uppercase tracking-wider">Email Address</p>
                  <p className="text-sm font-medium text-[var(--text)]">{parent.user?.email}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)] font-medium mb-1 uppercase tracking-wider">CNIC</p>
                  <p className="text-sm font-medium text-[var(--text)]">{parent.cnic || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)] font-medium mb-1 uppercase tracking-wider">Occupation</p>
                  <p className="text-sm font-medium text-[var(--text)]">{parent.occupation || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)] font-medium mb-1 uppercase tracking-wider">Phone</p>
                  {parent.phone ? (
                    <div className="mt-1">
                      <PhoneInput value={parent.phone} onChange={() => {}} disabled />
                    </div>
                  ) : (
                    <p className="text-sm font-medium text-[var(--text)]">N/A</p>
                  )}
                </div>
                <div className="col-span-1 md:col-span-2">
                  <p className="text-xs text-[var(--text-muted)] font-medium mb-1 uppercase tracking-wider">Address</p>
                  <p className="text-sm font-medium text-[var(--text)] leading-relaxed">{parent.address || 'N/A'}</p>
                </div>
              </div>
            </TabPanel>

            <TabPanel id="students" className="space-y-4 py-4">
              {parent.studentLinks.length === 0 ? (
                <EmptyState
                  title="No students linked yet"
                  description="Use the button below to link a student."
                />
              ) : (
                <div className="grid gap-3">
                  {parent.studentLinks.map((link) => (
                    <div key={link.id} className="p-4 border border-[var(--border)] rounded-xl bg-[var(--surface-container-lowest)] flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-[var(--text)]">
                          {link.student.firstName} {link.student.lastName}
                        </div>
                        <div className="text-sm text-[var(--text-muted)] mt-1">
                          Roll No: {link.student.rollNumber || 'Unassigned'} • Section: {link.student.section?.name || 'Unassigned'}
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Badge variant="neutral">{link.relationship}</Badge>
                          {link.isPrimary && <Badge variant="warning">Primary Contact</Badge>}
                        </div>
                      </div>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setStudentToUnlink(link.student.id)}
                        disabled={unlinkMutation.isPending}
                      >
                        Unlink
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabPanel>
          </Tabs>
        </div>

        {/* Footer Actions */}
        <div className="pt-6 border-t border-[var(--border)] mt-auto flex justify-between gap-3">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => onLinkStudent(parent.id)}>
              Link Student
            </Button>
            <Button variant="primary" onClick={() => onEdit(parent)}>
              Edit Details
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        title="Parent Profile"
        size="md"
      >
        {renderContent()}
      </Drawer>

      <ConfirmDialog
        isOpen={!!studentToUnlink}
        title="Unlink Student"
        description="Are you sure you want to remove this student link from the parent profile? You can always link them again later."
        confirmText="Unlink"
        cancelText="Cancel"
        onConfirm={handleConfirmUnlink}
        onCancel={() => setStudentToUnlink(null)}
        isDestructive
      />
    </>
  );
}
