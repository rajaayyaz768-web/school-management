'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  UserCog, Plus, Building2, Mail, CheckCircle, XCircle,
  Laptop, Wifi, ChevronDown, ChevronRight, Trash2, ToggleLeft, ToggleRight, ShieldCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  useAdmins, useCreateAdmin,
  useDeviceRequests, useUnreadDeviceRequestCount, useReviewDeviceRequest, useMarkDeviceRequestsRead,
  useAdminDevices, useUpdateDevice, useDeleteDevice,
  useAllowedNetworks, useCreateAllowedNetwork, useUpdateAllowedNetwork, useDeleteAllowedNetwork,
} from '@/features/admin-management/hooks/useAdminManagement';
import { useCampuses } from '@/features/campus/hooks/useCampus';
import { Tabs } from '@/components/ui/Tabs';
import { Modal } from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import type { Admin, AllowedNetwork, DeviceRequest, RegisteredDevice } from '@/features/admin-management/types/adminManagement.types';

// ── Create Admin form schema ─────────────────────────────────────────────────

const createAdminSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().optional(),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  campusId: z.string().min(1, 'Campus is required'),
  employeeCode: z.string().optional(),
});

type FormValues = z.infer<typeof createAdminSchema>;

// ── Admin row with expandable devices ────────────────────────────────────────

function AdminRow({ admin }: { admin: Admin }) {
  const [expanded, setExpanded] = useState(false);
  const { data: devices, isLoading: devicesLoading } = useAdminDevices(expanded ? admin.id : '');
  const updateDevice = useUpdateDevice(admin.id);
  const deleteDevice = useDeleteDevice(admin.id);

  return (
    <>
      <tr
        className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-hover,var(--border))]/20 transition-colors cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <td className="px-4 py-3">
          <span className="flex items-center gap-1.5 text-[var(--text-muted)] text-xs">
            {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
            <span className="font-medium text-[var(--text)]">
              {admin.staffProfile
                ? `${admin.staffProfile.firstName} ${admin.staffProfile.lastName}`.trim()
                : '—'}
            </span>
          </span>
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

      <AnimatePresence>
        {expanded && (
          <tr>
            <td colSpan={5} className="px-0 py-0 bg-[var(--surface-alt,var(--surface))]">
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-6 py-3 border-b border-[var(--border)]">
                  <p className="text-xs font-medium text-[var(--text-muted)] mb-2 flex items-center gap-1.5">
                    <Laptop className="h-3.5 w-3.5" /> Registered Devices
                  </p>

                  {devicesLoading && (
                    <p className="text-xs text-[var(--text-muted)] animate-pulse">Loading devices…</p>
                  )}

                  {!devicesLoading && (!devices || devices.length === 0) && (
                    <p className="text-xs text-[var(--text-muted)]">No registered devices for this admin.</p>
                  )}

                  {!devicesLoading && devices && devices.length > 0 && (
                    <div className="space-y-1.5">
                      {devices.map((device: RegisteredDevice) => (
                        <div
                          key={device.id}
                          className="flex items-center justify-between rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2"
                        >
                          <div>
                            <p className="text-xs font-medium text-[var(--text)]">
                              {device.label || 'Unnamed Device'}
                            </p>
                            <p className="text-[10px] text-[var(--text-muted)] font-mono truncate max-w-[280px]">
                              {device.deviceToken}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                              device.status === 'ACTIVE'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-[var(--border)] text-[var(--text-muted)]'
                            }`}>
                              {device.status}
                            </span>
                            <button
                              title={device.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                              onClick={(e) => {
                                e.stopPropagation();
                                updateDevice.mutate({
                                  deviceId: device.id,
                                  data: { status: device.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' },
                                });
                              }}
                              className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                            >
                              {device.status === 'ACTIVE'
                                ? <ToggleRight className="h-4 w-4 text-green-500" />
                                : <ToggleLeft className="h-4 w-4" />
                              }
                            </button>
                            <button
                              title="Remove device"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteDevice.mutate(device.id);
                              }}
                              className="text-[var(--text-muted)] hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  );
}

// ── Device Requests tab ───────────────────────────────────────────────────────

function DeviceRequestsTab() {
  const { data: requests, isLoading } = useDeviceRequests();
  const reviewRequest = useReviewDeviceRequest();
  const markRead = useMarkDeviceRequestsRead();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState('');

  const handleTabFocus = () => markRead.mutate();

  return (
    <div onFocus={handleTabFocus} className="space-y-4">
      {isLoading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-14 rounded-[var(--radius-lg)] bg-[var(--surface)] animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && (!requests || requests.length === 0) && (
        <EmptyState
          icon={<Laptop className="h-8 w-8" />}
          title="No device requests"
          description="When an admin tries to log in from an unregistered device, the request appears here."
        />
      )}

      {!isLoading && requests && requests.length > 0 && (
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] overflow-hidden bg-[var(--surface)]">
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface-alt,var(--surface))]">
                <th className="px-4 py-3 text-left font-medium text-[var(--text-muted)]">Admin</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--text-muted)]">Device Token</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--text-muted)]">IP Address</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--text-muted)]">Requested</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--text-muted)]">Status</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--text-muted)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req: DeviceRequest) => (
                <>
                  <tr key={req.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[var(--text)]">
                        {req.adminUser.staffProfile
                          ? `${req.adminUser.staffProfile.firstName} ${req.adminUser.staffProfile.lastName}`
                          : req.adminUser.email}
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)]">{req.adminUser.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-[11px] text-[var(--text-muted)] font-mono">
                        {req.deviceToken.slice(0, 8)}…
                      </code>
                    </td>
                    <td className="px-4 py-3 text-[var(--text-muted)] text-xs font-mono">
                      {req.requestedFromIp || '—'}
                    </td>
                    <td className="px-4 py-3 text-[var(--text-muted)] text-xs">
                      {new Date(req.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-4 py-3">
                      {req.status === 'PENDING' && (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => reviewRequest.mutate({ requestId: req.id, data: { action: 'APPROVE' } })}
                            disabled={reviewRequest.isPending}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => { setRejectingId(req.id); setRejectNote(''); }}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                      {req.reviewNote && (
                        <p className="text-[11px] text-[var(--text-muted)] max-w-[160px] truncate" title={req.reviewNote}>
                          Note: {req.reviewNote}
                        </p>
                      )}
                    </td>
                  </tr>
                  {rejectingId === req.id && (
                    <tr key={`${req.id}-reject`} className="bg-[var(--surface-alt,var(--surface))]">
                      <td colSpan={6} className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Input
                            placeholder="Optional rejection reason…"
                            value={rejectNote}
                            onChange={(e) => setRejectNote(e.target.value)}
                            className="flex-1"
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              reviewRequest.mutate(
                                { requestId: req.id, data: { action: 'REJECT', note: rejectNote || undefined } },
                                { onSuccess: () => setRejectingId(null) }
                              );
                            }}
                            disabled={reviewRequest.isPending}
                          >
                            Confirm Reject
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setRejectingId(null)}>
                            Cancel
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Network Settings tab ─────────────────────────────────────────────────────

function NetworkSettingsTab({ campuses }: { campuses: { id: string; name: string }[] }) {
  const [selectedCampusId, setSelectedCampusId] = useState(campuses[0]?.id ?? '');
  const { data: networks, isLoading } = useAllowedNetworks(selectedCampusId);
  const createNetwork = useCreateAllowedNetwork(selectedCampusId);
  const updateNetwork = useUpdateAllowedNetwork(selectedCampusId);
  const deleteNetwork = useDeleteAllowedNetwork(selectedCampusId);

  const [cidr, setCidr] = useState('');
  const [label, setLabel] = useState('');

  const campusOptions = campuses.map((c) => ({ value: c.id, label: c.name }));

  const handleAdd = () => {
    if (!cidr.trim()) return;
    createNetwork.mutate(
      { campusId: selectedCampusId, cidr: cidr.trim(), label: label.trim() || undefined },
      { onSuccess: () => { setCidr(''); setLabel(''); } }
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 p-4 rounded-[var(--radius-lg)] border border-[var(--gold)]/30 bg-[var(--gold)]/5">
        <Wifi className="h-4 w-4 text-[var(--gold)] mt-0.5 shrink-0" />
        <p className="text-xs text-[var(--text-muted)]">
          Admins can only log in from IP addresses that fall within the ranges listed here.
          Enter the campus Wi-Fi public IP in CIDR notation, e.g. <code className="font-mono text-[var(--text)]">203.0.113.0/24</code> or a single IP as <code className="font-mono text-[var(--text)]">203.0.113.5/32</code>.
          If no ranges are configured for a campus, network restriction is not enforced.
        </p>
      </div>

      <div className="max-w-xs">
        <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Campus</label>
        <Select
          value={selectedCampusId}
          onChange={(e) => setSelectedCampusId(e.target.value)}
          options={campusOptions}
          placeholder="Select campus"
        />
      </div>

      {isLoading && (
        <div className="space-y-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-12 rounded-[var(--radius-lg)] bg-[var(--surface)] animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && networks && (
        <div className="space-y-2">
          {networks.length === 0 && (
            <p className="text-sm text-[var(--text-muted)]">No network rules configured for this campus.</p>
          )}
          <AnimatePresence>
            {networks.map((net: AllowedNetwork) => (
              <motion.div
                key={net.id}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="flex items-center justify-between rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5"
              >
                <div>
                  <code className="text-sm font-mono font-medium text-[var(--text)]">{net.cidr}</code>
                  {net.label && (
                    <span className="ml-2 text-xs text-[var(--text-muted)]">— {net.label}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    title={net.isActive ? 'Deactivate' : 'Activate'}
                    onClick={() => updateNetwork.mutate({ networkId: net.id, data: { isActive: !net.isActive } })}
                    className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                  >
                    {net.isActive
                      ? <ToggleRight className="h-4 w-4 text-green-500" />
                      : <ToggleLeft className="h-4 w-4" />
                    }
                  </button>
                  <button
                    title="Delete rule"
                    onClick={() => deleteNetwork.mutate(net.id)}
                    className="text-[var(--text-muted)] hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add new network */}
      <div className="flex items-end gap-2 pt-2 border-t border-[var(--border)]">
        <div className="flex-1">
          <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">CIDR Range *</label>
          <Input
            placeholder="e.g. 192.168.1.0/24"
            value={cidr}
            onChange={(e) => setCidr(e.target.value)}
            className="font-mono"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Label (optional)</label>
          <Input
            placeholder="e.g. Main Office Wi-Fi"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </div>
        <Button
          onClick={handleAdd}
          disabled={!cidr.trim() || createNetwork.isPending || !selectedCampusId}
          className="flex items-center gap-1.5 shrink-0"
        >
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>
    </div>
  );
}

// ── Status badge helper ───────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    APPROVED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };
  return (
    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${map[status] ?? 'bg-[var(--border)] text-[var(--text-muted)]'}`}>
      {status}
    </span>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminsPage() {
  const [activeTab, setActiveTab] = useState('admins');
  const [isOpen, setIsOpen] = useState(false);

  const { data: admins, isLoading, error } = useAdmins();
  const { data: campuses } = useCampuses();
  const createAdmin = useCreateAdmin();
  const { data: unreadCount } = useUnreadDeviceRequestCount();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(createAdminSchema) });

  const onSubmit = (values: FormValues) => {
    createAdmin.mutate(values, {
      onSuccess: () => { setIsOpen(false); reset(); },
    });
  };

  const campusOptions = (campuses ?? []).map((c: { id: string; name: string }) => ({
    value: c.id,
    label: c.name,
  }));

  const tabs = [
    { id: 'admins', label: 'Admins', icon: <UserCog className="h-3.5 w-3.5" /> },
    {
      id: 'device-requests',
      label: 'Device Requests',
      icon: <Laptop className="h-3.5 w-3.5" />,
      count: unreadCount || undefined,
      countVariant: 'alert' as const,
    },
    { id: 'networks', label: 'Network Settings', icon: <Wifi className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Mobile header */}
      <header className="sticky top-0 z-40 bg-[var(--bg)]/95 backdrop-blur-md border-b border-[var(--border)] px-4 h-14 flex items-center justify-between md:hidden">
        <h1 className="font-bold text-lg text-[var(--text)]" style={{ fontFamily: 'var(--font-display)' }}>Admin Management</h1>
        {activeTab === 'admins' && (
          <button onClick={() => setIsOpen(true)} className="p-2 rounded-full bg-[var(--primary)] text-white active:opacity-80 transition-opacity">
            <Plus className="h-5 w-5" />
          </button>
        )}
      </header>
    <div className="p-4 sm:p-6 space-y-6">
      {/* Desktop Header */}
      <div className="hidden sm:flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--gold)]/15">
            <ShieldCheck className="h-5 w-5 text-[var(--gold)]" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-[var(--text)]">Admin Security</h1>
            <p className="font-body text-sm text-[var(--text-muted)]">
              Manage admin accounts, registered devices, and campus network restrictions
            </p>
          </div>
        </div>
        {activeTab === 'admins' && (
          <Button onClick={() => setIsOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Admin
          </Button>
        )}
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15 }}
        >
          {/* ── Admins Tab ── */}
          {activeTab === 'admins' && (
            <>
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
                <>
                  {/* Desktop table */}
                  <div className="hidden md:block rounded-[var(--radius-lg)] border border-[var(--border)] overflow-hidden bg-[var(--surface)]">
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
                          <AdminRow key={admin.id} admin={admin} />
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile card list */}
                  <div className="space-y-2 md:hidden">
                    {admins.map((admin, idx) => {
                      const name = admin.staffProfile
                        ? `${admin.staffProfile.firstName} ${admin.staffProfile.lastName}`.trim()
                        : admin.email;
                      const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
                      const colors = ['bg-[var(--primary)]', 'bg-[var(--gold)]', 'bg-purple-600', 'bg-blue-600', 'bg-rose-600'];
                      return (
                        <motion.div
                          key={admin.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.03, duration: 0.25 }}
                          className="flex items-center gap-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3.5"
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${colors[idx % colors.length]}`}>
                            {initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-[var(--text)] truncate">{name}</p>
                            <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">
                              {admin.campus?.name || 'No campus'} · {admin.email}
                            </p>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                            admin.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                          }`}>
                            {admin.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          )}

          {/* ── Device Requests Tab ── */}
          {activeTab === 'device-requests' && <DeviceRequestsTab />}

          {/* ── Network Settings Tab ── */}
          {activeTab === 'networks' && campuses && (
            <NetworkSettingsTab campuses={campuses} />
          )}
        </motion.div>
      </AnimatePresence>

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
            <Button onClick={handleSubmit(onSubmit)} disabled={createAdmin.isPending}>
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
            <Select {...register('campusId')} options={campusOptions} placeholder="Select campus" />
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
    </div>
  );
}
