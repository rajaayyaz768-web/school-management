'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Modal, Button, Card, Badge, FileUpload, Table, EmptyState,
} from '@/components/ui';
import {
  useDownloadTemplate, useValidateImport, useConfirmImport, useDownloadCredentials,
} from '../hooks/useImport';
import { ValidationReport, ImportResult, RowValidationResult } from '../types/import.types';

interface Props {
  sectionId: string;
  sectionName: string;
  onClose: () => void;
  onImportComplete: () => void;
}

type Step = 1 | 2 | 3 | 4;

const STEPS = ['Upload File', 'Review', 'Confirm', 'Credentials'];

function StepIndicator({ current }: { current: Step }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {STEPS.map((label, i) => {
        const num = (i + 1) as Step;
        const active = num === current;
        const done = num < current;
        return (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                active
                  ? 'bg-[var(--primary)] text-white'
                  : done
                  ? 'bg-green-500 text-white'
                  : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--text-muted)]'
              }`}
            >
              {done ? '✓' : num}
            </div>
            <span
              className={`text-xs ${active ? 'text-[var(--text)] font-medium' : 'text-[var(--text-muted)]'}`}
            >
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <div className="w-6 h-px bg-[var(--border)] mx-1" />
            )}
          </div>
        );
      })}
    </div>
  );
}

function exportErrorCsv(report: ValidationReport) {
  const errorRows = report.rows.filter((r) => r.status === 'ERROR');
  const lines = [
    'Row,Student Name,Issues',
    ...errorRows.map((r) =>
      `${r.rowNumber},"${r.studentName}","${r.issues.map((i) => i.message).join('; ')}"`
    ),
  ];
  const blob = new Blob([lines.join('\r\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Import_Errors.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function ImportWizard({ sectionId, sectionName, onClose, onImportComplete }: Props) {
  const [step, setStep] = useState<Step>(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [report, setReport] = useState<ValidationReport | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [warningsAcknowledged, setWarningsAcknowledged] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const templateMutation = useDownloadTemplate(sectionId);
  const validateMutation = useValidateImport();
  const confirmMutation = useConfirmImport(sectionId);
  const credentialsMutation = useDownloadCredentials(sectionName);

  // ── Step 1 handlers ──────────────────────────────────────────────────────
  const handleValidate = () => {
    if (!selectedFile) return;
    validateMutation.mutate(
      { sectionId, file: selectedFile },
      {
        onSuccess: (r) => {
          setReport(r);
          if (r.errorCount === 0) {
            setStep(2);
          }
          // If errorCount > 0, stay on step 1 and show error summary below
        },
      }
    );
  };

  // ── Step 3 handlers ──────────────────────────────────────────────────────
  const handleConfirm = () => {
    if (!report) return;
    setConfirmError(null);
    confirmMutation.mutate(
      { validationToken: report.validationToken, acknowledgeWarnings: warningsAcknowledged },
      {
        onSuccess: (res) => {
          setImportResult(res);
          setStep(4);
        },
        onError: (err: unknown) => {
          const msg = err instanceof Error ? err.message : 'Import failed. Please try again.';
          setConfirmError(msg);
        },
      }
    );
  };

  // ── Validation result table columns ──────────────────────────────────────
  const reviewColumns = [
    {
      key: 'rowNumber',
      header: 'Row',
      render: (r: RowValidationResult) => r.rowNumber,
      className: 'w-12',
    },
    {
      key: 'studentName',
      header: 'Student Name',
      render: (r: RowValidationResult) => r.studentName,
    },
    {
      key: 'status',
      header: 'Status',
      render: (r: RowValidationResult) => (
        <Badge
          variant={r.status === 'READY' ? 'success' : r.status === 'WARNING' ? 'warning' : 'danger'}
        >
          {r.status === 'READY' ? '✅ Ready' : r.status === 'WARNING' ? '⚠️ Warning' : '❌ Error'}
        </Badge>
      ),
      className: 'w-28',
    },
    {
      key: 'issues',
      header: 'Issues',
      render: (r: RowValidationResult) =>
        r.issues.length === 0 ? (
          <span className="text-xs text-[var(--text-muted)]">—</span>
        ) : (
          <ul className="text-xs space-y-0.5">
            {r.issues.map((issue, i) => (
              <li
                key={i}
                className={
                  issue.severity === 'ERROR'
                    ? 'text-red-500'
                    : issue.severity === 'WARNING'
                    ? 'text-amber-500'
                    : 'text-[var(--text-muted)]'
                }
              >
                {issue.message}
              </li>
            ))}
          </ul>
        ),
    },
    {
      key: 'parentAction',
      header: 'Parent Action',
      render: (r: RowValidationResult) =>
        r.parentAction === 'CREATE' ? (
          <span className="text-xs text-green-600 font-medium">New account</span>
        ) : r.parentAction === 'LINK_EXISTING' ? (
          <span className="text-xs text-blue-600">Link → {r.existingParentName}</span>
        ) : (
          <span className="text-xs text-[var(--text-muted)]">—</span>
        ),
    },
  ];

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`Import Students — ${sectionName}`}
      size="xl"
    >
      <StepIndicator current={step} />

      <AnimatePresence mode="wait">
        {/* ── STEP 1 ── */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-[var(--text-muted)]">
                Download the template, fill it in Excel or Google Sheets, then upload it here.
              </p>
              <Button
                variant="secondary"
                loading={templateMutation.isPending}
                onClick={() => templateMutation.mutate()}
                className="shrink-0 ml-4"
              >
                Download Template
              </Button>
            </div>

            <FileUpload
              accept=".csv,.xlsx"
              maxSize={5}
              onFilesChange={(files) => setSelectedFile(files[0] ?? null)}
            />

            {/* Error summary after failed validation */}
            {!!report && report.errorCount > 0 && (
              <div className="rounded-lg border border-red-300 bg-red-50 dark:bg-red-950/20 p-4 space-y-2">
                <p className="text-sm font-medium text-red-600">
                  {report.errorCount} row{report.errorCount > 1 ? 's have' : ' has'} errors that must be fixed before importing.
                </p>
                <Button
                  variant="secondary"
                  className="text-xs"
                  onClick={() => exportErrorCsv(report)}
                >
                  Download Error Report (CSV)
                </Button>
              </div>
            )}

            {!!validateMutation.error && !report && (
              <p className="text-sm text-red-500">
                {String(
                  validateMutation.error instanceof Error
                    ? validateMutation.error.message
                    : 'Validation failed'
                )}
              </p>
            )}

            <div className="flex justify-end gap-3 pt-2 border-t border-[var(--border)]">
              <Button variant="secondary" onClick={onClose}>Cancel</Button>
              <Button
                variant="primary"
                disabled={!selectedFile}
                loading={validateMutation.isPending}
                onClick={handleValidate}
              >
                Validate File
              </Button>
            </div>
          </motion.div>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && !!report && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {/* Summary card */}
            <Card className="p-4 space-y-2">
              <p className="text-sm font-semibold text-[var(--text)]">
                {report.campusName} — {report.sectionName}
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                <span>{report.totalRows} rows total</span>
                <span className="text-green-600">✅ {report.readyCount} ready</span>
                {report.warningCount > 0 && (
                  <span className="text-amber-500">⚠️ {report.warningCount} warnings</span>
                )}
                {report.errorCount > 0 && (
                  <span className="text-red-500">❌ {report.errorCount} errors</span>
                )}
              </div>
              <div className="flex flex-wrap gap-4 text-xs text-[var(--text-muted)]">
                <span>New parents: {report.newParentsToCreate}</span>
                <span>Existing parents to link: {report.existingParentsToLink}</span>
                {report.siblingsDetected > 0 && (
                  <span>Siblings detected: {report.siblingsDetected}</span>
                )}
                <span>
                  Capacity after import: {report.currentEnrollment + report.readyCount + report.warningCount}/{report.sectionCapacity}
                  {report.wouldExceedCapacity && (
                    <span className="text-amber-500 ml-1">(exceeds capacity)</span>
                  )}
                </span>
              </div>
            </Card>

            <div className="max-h-80 overflow-y-auto">
              <Table columns={reviewColumns} data={report.rows} striped />
            </div>

            {report.warningCount > 0 && (
              <label className="flex items-start gap-3 cursor-pointer text-sm text-[var(--text)]">
                <input
                  type="checkbox"
                  checked={warningsAcknowledged}
                  onChange={(e) => setWarningsAcknowledged(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-[var(--primary)]"
                />
                I have reviewed all warnings and want to proceed with this import.
              </label>
            )}

            <div className="flex justify-between pt-2 border-t border-[var(--border)]">
              <Button
                variant="secondary"
                onClick={() => {
                  setStep(1);
                  setReport(null);
                  setWarningsAcknowledged(false);
                }}
              >
                Back
              </Button>
              <Button
                variant="primary"
                disabled={report.warningCount > 0 && !warningsAcknowledged}
                onClick={() => setStep(3)}
              >
                Proceed to Confirm
              </Button>
            </div>
          </motion.div>
        )}

        {/* ── STEP 3 ── */}
        {step === 3 && !!report && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {confirmError ? (
              <div className="space-y-4">
                <div className="rounded-lg border border-red-300 bg-red-50 dark:bg-red-950/20 p-4">
                  <p className="text-sm font-medium text-red-600 mb-1">Import failed</p>
                  <p className="text-sm text-red-500">{confirmError}</p>
                </div>
                <div className="flex justify-end">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setStep(1);
                      setReport(null);
                      setConfirmError(null);
                      setWarningsAcknowledged(false);
                    }}
                  >
                    Start Over
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/20 p-4 space-y-3">
                  <p className="text-sm font-semibold text-amber-700">⚠️ This action cannot be undone</p>
                  <p className="text-sm text-[var(--text)]">
                    You are about to import into <strong>{report.campusName} — {report.sectionName}</strong>
                  </p>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
                    <span className="text-[var(--text-muted)]">Students to create:</span>
                    <span className="font-medium">{report.readyCount + report.warningCount}</span>
                    <span className="text-[var(--text-muted)]">New parent accounts:</span>
                    <span className="font-medium">{report.newParentsToCreate}</span>
                    <span className="text-[var(--text-muted)]">Existing parents to link:</span>
                    <span className="font-medium">{report.existingParentsToLink}</span>
                    {report.siblingsDetected > 0 && (
                      <>
                        <span className="text-[var(--text-muted)]">Siblings auto-linked:</span>
                        <span className="font-medium">{report.siblingsDetected}</span>
                      </>
                    )}
                    <span className="text-[var(--text-muted)]">Roll number assignment:</span>
                    <span className="font-medium">Alphabetical 001–{String(report.readyCount + report.warningCount).padStart(3, '0')}</span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">
                    All students will be created as ACTIVE with full section placement.
                  </p>
                </div>

                <div className="flex justify-between pt-2 border-t border-[var(--border)]">
                  <Button variant="secondary" onClick={() => setStep(2)}>Back</Button>
                  <Button
                    variant="primary"
                    loading={confirmMutation.isPending}
                    onClick={handleConfirm}
                  >
                    {confirmMutation.isPending ? 'Importing...' : 'Confirm Import'}
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* ── STEP 4 ── */}
        {step === 4 && importResult && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <div className="rounded-lg border border-green-300 bg-green-50 dark:bg-green-950/20 p-5 space-y-3">
              <p className="text-base font-semibold text-green-700">✅ Import Complete</p>
              <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
                <span className="text-[var(--text-muted)]">Students created:</span>
                <span className="font-medium">{importResult.studentsCreated}</span>
                <span className="text-[var(--text-muted)]">Parent accounts created:</span>
                <span className="font-medium">{importResult.parentsCreated}</span>
                <span className="text-[var(--text-muted)]">Existing parents linked:</span>
                <span className="font-medium">{importResult.parentsLinked}</span>
              </div>
              <p className="text-sm text-[var(--text-muted)]">
                Download the credentials file and distribute login details to students and parents.
              </p>
            </div>

            <p className="text-xs text-amber-600 font-medium">
              ⚠️ The credentials file should be downloaded now. Plain-text passwords are cleared after download.
            </p>

            <Button
              variant="primary"
              className="w-full"
              loading={credentialsMutation.isPending}
              onClick={() => credentialsMutation.mutate(importResult.importId)}
            >
              📥 Download Credentials Excel
            </Button>

            <div className="flex justify-end pt-2 border-t border-[var(--border)]">
              <Button
                variant="secondary"
                onClick={() => {
                  onImportComplete();
                  onClose();
                }}
              >
                Close
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
}
