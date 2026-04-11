import api from '@/lib/axios'
import { AttendanceReportFilters, FeeReportFilters, ResultsReportFilters } from '../types/reports.types'

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function openAndPrint(html: string) {
  const win = window.open('', '_blank')
  if (!win) return
  win.document.write(html)
  win.print()
}

// ─── Attendance ────────────────────────────────────────────────────────────

export async function downloadAttendanceExcel(filters: AttendanceReportFilters): Promise<void> {
  const res = await api.get('/api/v1/reports/attendance', {
    params: { ...filters, format: 'excel' },
    responseType: 'blob',
  })
  triggerDownload(res.data, 'attendance-report.xlsx')
}

export async function printAttendanceReport(filters: AttendanceReportFilters): Promise<void> {
  const res = await api.get('/api/v1/reports/attendance', {
    params: { ...filters, format: 'html' },
  })
  openAndPrint(res.data)
}

// ─── Fees ──────────────────────────────────────────────────────────────────

export async function downloadFeeExcel(filters: FeeReportFilters): Promise<void> {
  const res = await api.get('/api/v1/reports/fees', {
    params: { ...filters, format: 'excel' },
    responseType: 'blob',
  })
  triggerDownload(res.data, 'fee-report.xlsx')
}

export async function printFeeReport(filters: FeeReportFilters): Promise<void> {
  const res = await api.get('/api/v1/reports/fees', {
    params: { ...filters, format: 'html' },
  })
  openAndPrint(res.data)
}

// ─── Results ───────────────────────────────────────────────────────────────

export async function downloadResultsExcel(filters: ResultsReportFilters): Promise<void> {
  const res = await api.get('/api/v1/reports/results', {
    params: { ...filters, format: 'excel' },
    responseType: 'blob',
  })
  triggerDownload(res.data, 'results-report.xlsx')
}

export async function printResultsReport(filters: ResultsReportFilters): Promise<void> {
  const res = await api.get('/api/v1/reports/results', {
    params: { ...filters, format: 'html' },
  })
  openAndPrint(res.data)
}
