'use client'

import { Megaphone, ArrowRight } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Skeleton } from '@/components/ui'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useCampusStore } from '@/store/campusStore'
import { usePrincipalDashboard } from '@/features/dashboard/principal/hooks/usePrincipalDashboard'
import { StatsRow } from '@/features/dashboard/principal/components/StatsRow'
import { AbsentStaffCard } from '@/features/dashboard/principal/components/AbsentStaffCard'
import { UpcomingExamsCard } from '@/features/dashboard/principal/components/UpcomingExamsCard'
import { FeeSummaryCard } from '@/features/dashboard/principal/components/FeeSummaryCard'
import { CampusSummaryCard } from '@/features/dashboard/principal/components/CampusSummaryCard'
import { useAbsenceAlerts } from '@/features/absence-alerts/hooks/useAbsenceAlerts'
import { AbsenceAlertPanel } from '@/features/absence-alerts/components/AbsenceAlertPanel'

const AUDIENCE_META: Record<string, { label: string; variant: 'info' | 'warning' | 'success' | 'neutral' }> = {
  ALL: { label: 'All', variant: 'info' },
  STUDENTS: { label: 'Students', variant: 'success' },
  PARENTS: { label: 'Parents', variant: 'warning' },
  TEACHERS: { label: 'Faculty', variant: 'neutral' },
}

export default function PrincipalDashboardPage() {
  // Use the global campus store — set by the topbar picker
  const activeCampusId = useCampusStore((s) => s.activeCampusId)

  const { data, isLoading } = usePrincipalDashboard(activeCampusId ?? undefined)
  const { alerts, dismissAlert, clearAlerts } = useAbsenceAlerts()

  const breakdown = data?.campusBreakdown ?? []
  const showBreakdown = breakdown.length > 1

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] p-6 xl:p-8 gap-6">
      <PageHeader
        title="Principal Dashboard"
        subtitle="Live overview of campus operations"
        breadcrumb={[{ label: 'Home', href: '/principal/dashboard' }, { label: 'Dashboard' }]}
      />

      {/* Absence alerts (real-time socket events) */}
      {alerts.length > 0 && (
        <AbsenceAlertPanel
          alerts={alerts}
          onDismiss={dismissAlert}
          onClearAll={clearAlerts}
        />
      )}

      {/* Per-campus breakdown cards — shown when viewing all campuses and backend returns >1 */}
      {showBreakdown && (
        <div>
          <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-3">
            Campus Overview — click a card to drill in
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {breakdown.map((campus) => (
              <CampusSummaryCard key={campus.campusId} campus={campus} />
            ))}
          </div>
        </div>
      )}

      {/* Aggregate stats row — 6 metric cards */}
      <StatsRow
        stats={
          data?.stats ?? {
            totalStudents: 0,
            totalStaff: 0,
            totalSections: 0,
            presentStaff: 0,
            totalStaffForCampus: 0,
            todayFeeCollection: 0,
          }
        }
        isLoading={isLoading}
      />

      {/* Main grid — 2 column */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Left column */}
        <div className="flex flex-col gap-6">
          <AbsentStaffCard
            absentStaff={data?.absentStaff ?? []}
            isLoading={isLoading}
          />
          <UpcomingExamsCard
            exams={data?.upcomingExams ?? []}
            isLoading={isLoading}
          />
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          <FeeSummaryCard
            feeSummary={
              data?.feeSummary ?? {
                totalPending: 0,
                collectedThisMonth: 0,
                defaulterCount: 0,
              }
            }
            isLoading={isLoading}
          />

          {/* Recent Announcements */}
          <Card className="flex flex-col">
            <div className="flex items-center gap-2 px-5 pt-5 pb-3 border-b border-[var(--border)]">
              <Megaphone className="w-4 h-4 text-[var(--text-muted)]" />
              <h3 className="text-sm font-semibold text-[var(--text)]">Recent Announcements</h3>
              {(data?.recentAnnouncements?.length ?? 0) > 0 && (
                <span className="ml-auto text-xs text-[var(--text-muted)] font-medium">
                  {data!.recentAnnouncements.length} posted
                </span>
              )}
            </div>

            <div className="p-4 space-y-2.5">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <Skeleton key={i} variant="text" className="h-14" />
                ))
              ) : (data?.recentAnnouncements ?? []).length === 0 ? (
                <p className="text-sm text-[var(--text-muted)] py-6 text-center">
                  No recent announcements
                </p>
              ) : (
                (data?.recentAnnouncements ?? []).slice(0, 4).map((ann) => {
                  const meta = AUDIENCE_META[ann.audience] ?? { label: ann.audience, variant: 'neutral' as const }
                  return (
                    <div
                      key={ann.id}
                      className="flex items-start justify-between gap-3 px-4 py-3 rounded-[var(--radius)] bg-[var(--background)] border border-[var(--border)] hover:border-[var(--gold)]/30 transition-colors group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--text)] truncate">{ann.title}</p>
                        <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                          {new Date(ann.publishedAt).toLocaleDateString('en-PK', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant={meta.variant} size="sm">{meta.label}</Badge>
                        <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
