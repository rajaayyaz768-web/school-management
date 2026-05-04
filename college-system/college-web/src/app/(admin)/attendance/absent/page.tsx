'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserX, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAbsentByCampus } from '@/features/staff-attendance/hooks/useStaffAttendance';
import { AbsentByCampusGroup, StaffBasicInfo } from '@/features/staff-attendance/types/staff-attendance.types';
import PageHeader from '@/components/layout/PageHeader';
import { Avatar, Badge, Skeleton } from '@/components/ui';
import { cn } from '@/lib/utils';

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function offsetDate(base: string, days: number) {
  const d = new Date(base + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function buildDateChips(selected: string) {
  return [-2, -1, 0, 1, 2].map((offset) => {
    const value = offsetDate(todayStr(), offset);
    const d = new Date(value + 'T00:00:00');
    const isToday = value === todayStr();
    return {
      value,
      label: isToday ? 'Today' : d.toLocaleDateString('en-PK', { weekday: 'short', month: 'short', day: 'numeric' }),
      isSelected: value === selected,
    };
  });
}

function StaffRow({ member }: { member: StaffBasicInfo }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-[var(--border)] last:border-0">
      <Avatar
        name={`${member.firstName} ${member.lastName}`}
        src={member.photoUrl || undefined}
        size="sm"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--text)] truncate">
          {member.firstName} {member.lastName}
        </p>
        <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">
          {member.designation || 'Staff'} · <span className="font-mono">{member.staffCode}</span>
        </p>
      </div>
      <Badge variant="danger">Absent</Badge>
    </div>
  );
}

function CampusCard({ group, index }: { group: AbsentByCampusGroup; index: number }) {
  return (
    <motion.div
      key={group.campusId}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.06 }}
      className="bg-[var(--surface-container-lowest)] border border-[var(--border)] rounded-[var(--radius-card)] overflow-hidden"
    >
      {/* Card header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[var(--surface-container-low)]">
        <div>
          <p className="font-bold text-[var(--text)] text-sm" style={{ fontFamily: 'var(--font-display)' }}>
            {group.campusName}
          </p>
          <p className="text-[10px] font-mono text-[var(--text-muted)] mt-0.5">{group.campusCode}</p>
        </div>
        {group.absentCount > 0 ? (
          <span className="inline-flex items-center gap-1 bg-red-500/10 text-red-500 text-xs font-bold px-2.5 py-1 rounded-full">
            <UserX className="w-3 h-3" />
            {group.absentCount} absent
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-500 text-xs font-bold px-2.5 py-1 rounded-full">
            <CheckCircle2 className="w-3 h-3" />
            All present
          </span>
        )}
      </div>

      {/* Staff list */}
      <div className="px-4">
        {group.absentCount === 0 ? (
          <p className="py-4 text-center text-sm text-[var(--text-muted)]">No absent staff for this campus.</p>
        ) : (
          group.staff.map((member) => <StaffRow key={member.id} member={member} />)
        )}
      </div>
    </motion.div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="border border-[var(--border)] rounded-[var(--radius-card)] overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--border)]">
            <Skeleton className="h-4 w-40 rounded" />
          </div>
          <div className="px-4 py-2 space-y-3">
            {[0, 1].map((j) => (
              <div key={j} className="flex items-center gap-3 py-2">
                <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-32 rounded" />
                  <Skeleton className="h-2.5 w-24 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AbsentTodayPage() {
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const chips = buildDateChips(selectedDate);
  const { data: groups, isLoading } = useAbsentByCampus(selectedDate);

  const totalAbsent = groups?.reduce((sum, g) => sum + g.absentCount, 0) ?? 0;

  const displayDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-PK', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* ── Mobile header ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[var(--bg)]/95 backdrop-blur-md border-b border-[var(--border)] px-4 h-14 flex items-center justify-between md:hidden">
        <div className="flex items-center gap-2">
          <UserX className="w-5 h-5 text-[var(--text-muted)]" />
          <h1 className="font-bold text-lg text-[var(--text)]" style={{ fontFamily: 'var(--font-display)' }}>
            Absent Today
          </h1>
        </div>
        {!isLoading && (
          <span className={cn(
            'text-xs font-bold px-2.5 py-1 rounded-full',
            totalAbsent > 0 ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'
          )}>
            {totalAbsent > 0 ? `${totalAbsent} absent` : 'All present'}
          </span>
        )}
      </header>

      {/* ── Desktop header ────────────────────────────────────────────────── */}
      <div className="hidden md:block max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="Absent Staff Today"
          subtitle={displayDate}
          breadcrumb={[
            { label: 'Home', href: '/' },
            { label: 'Attendance', href: '/attendance/staff' },
            { label: 'Absent Today' },
          ]}
        />
      </div>

      <div className="p-4 md:max-w-5xl md:mx-auto md:px-6 lg:px-8 md:py-0 space-y-4">
        {/* ── Date chip strip ──────────────────────────────────────────────── */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedDate((d) => offsetDate(d, -1))}
            className="shrink-0 p-1.5 rounded-full border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--primary)]/40 transition-colors"
            aria-label="Previous day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex overflow-x-auto gap-2 flex-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {chips.map((chip) => (
              <button
                key={chip.value}
                onClick={() => setSelectedDate(chip.value)}
                className={cn(
                  'shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all border',
                  chip.isSelected
                    ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                    : 'bg-[var(--surface)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--primary)]/40'
                )}
              >
                {chip.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setSelectedDate((d) => offsetDate(d, 1))}
            className="shrink-0 p-1.5 rounded-full border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--primary)]/40 transition-colors"
            aria-label="Next day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* ── Content ──────────────────────────────────────────────────────── */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : !groups || groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-3" />
            <p className="font-semibold text-[var(--text)]">No attendance data</p>
            <p className="text-sm text-[var(--text-muted)] mt-1">Attendance has not been marked for this date.</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedDate}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-8"
            >
              {groups.map((group, i) => (
                <CampusCard key={group.campusId} group={group} index={i} />
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
