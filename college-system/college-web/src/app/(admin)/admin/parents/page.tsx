'use client';

import { useState } from 'react';
import { Parent } from '@/features/parents/types/parents.types';
import { useParents } from '@/features/parents/hooks/useParents';
import { ParentTable } from '@/features/parents/components/ParentTable';
import { ParentProfileDrawer } from '@/features/parents/components/ParentProfileDrawer';
import { ParentForm } from '@/features/parents/components/ParentForm';
import { LinkStudentForm } from '@/features/parents/components/LinkStudentForm';

import PageHeader from '@/components/layout/PageHeader';
import {
  Button,
  SearchInput,
  Modal,
} from '@/components/ui';
import { useToast } from '@/hooks/useToast';

export default function ParentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modaling & Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [viewingParentId, setViewingParentId] = useState<string | null>(null);

  // Parent Form State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingParent, setEditingParent] = useState<Parent | null>(null);

  // Link Student Modal State
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkingParentId, setLinkingParentId] = useState<string | null>(null);
  
  // Password sharing state
  const [showTempPasswordModal, setShowTempPasswordModal] = useState(false);
  const [tempPassword, setTempPassword] = useState('');
  const { success } = useToast();

  // Queries
  const { data: parents = [], isLoading } = useParents(searchQuery);

  const handleAddParentClick = () => {
    setEditingParent(null);
    setIsFormModalOpen(true);
  };

  const handleEditParentClick = (parent: Parent) => {
    setEditingParent(parent);
    setIsFormModalOpen(true);
  };

  const handleViewParentClick = (parent: Parent) => {
    setViewingParentId(parent.id);
    setIsDrawerOpen(true);
  };

  const handleLinkStudentClick = (parentId: string) => {
    setIsDrawerOpen(false); // UI Spec states drawer closely transitions into link modal
    setLinkingParentId(parentId);
    setIsLinkModalOpen(true);
  };

  const handleFormSuccess = (pw?: string) => {
    setIsFormModalOpen(false);
    if (pw) {
      setTempPassword(pw);
      setShowTempPasswordModal(true);
    }
  };

  const handleLinkSuccess = () => {
    setIsLinkModalOpen(false);
    // Restart drawer view implicitly keeping structural context alive seamlessly
    if (linkingParentId) {
      setViewingParentId(linkingParentId);
      setIsDrawerOpen(true);
    }
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(tempPassword);
    success('Password copied to clipboard');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Parent Management"
        breadcrumb={[
          { label: 'Home', href: '/' },
          { label: 'Parents' },
        ]}
        actions={
          <Button variant="primary" onClick={handleAddParentClick}>
            Add Parent
          </Button>
        }
      />

      {/* Filter Bar */}
      <div className="bg-[var(--surface)] p-4 rounded-xl border border-[var(--border)] shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="w-full sm:w-80">
          <SearchInput
            placeholder="Search by name or phone..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>
      </div>

      <ParentTable
        parents={parents}
        isLoading={isLoading}
        onView={handleViewParentClick}
        onEdit={handleEditParentClick}
      />

      {/* Drawer Context */}
      <ParentProfileDrawer
        parentId={viewingParentId}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onEdit={(parent) => {
           setIsDrawerOpen(false);
           handleEditParentClick(parent);
        }}
        onLinkStudent={handleLinkStudentClick}
      />

      {/* Primary Modification Modals */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingParent ? 'Edit Parent Profile' : 'Create Parent Account'}
        size="lg"
      >
        <ParentForm
          parent={editingParent || undefined}
          onSuccess={handleFormSuccess}
          onCancel={() => setIsFormModalOpen(false)}
        />
      </Modal>

      {/* Link Student Modal Overlay */}
      <Modal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        title="Link Student to Parent Account"
        size="md"
      >
        {linkingParentId && (
          <LinkStudentForm
            parentId={linkingParentId}
            onSuccess={handleLinkSuccess}
            onCancel={() => {
              setIsLinkModalOpen(false);
              setViewingParentId(linkingParentId);
              setIsDrawerOpen(true);
            }}
          />
        )}
      </Modal>

      {/* Temp Password Dialog Extraction Mode */}
      <Modal
        isOpen={showTempPasswordModal}
        onClose={() => setShowTempPasswordModal(false)}
        title="Account Created Successfully"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--text)]">
            A login account for parent <strong>{editingParent?.firstName} {editingParent?.lastName}</strong> has been secured natively.
          </p>
          <div className="bg-[var(--surface-container-low)] p-4 rounded-lg flex items-center justify-between">
            <div>
              <p className="text-xs text-[var(--text-muted)] font-semibold uppercase mb-1">Temporary Password</p>
              <p className="font-mono text-lg font-bold text-[var(--text)]">{tempPassword}</p>
            </div>
            <Button variant="secondary" onClick={handleCopyPassword}>
              Copy
            </Button>
          </div>
          <p className="text-sm font-semibold text-[var(--danger)]">
            Save this password — it cannot be recovered later.
          </p>
          <div className="flex justify-end pt-4">
            <Button variant="primary" onClick={() => setShowTempPasswordModal(false)}>
              Done
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
