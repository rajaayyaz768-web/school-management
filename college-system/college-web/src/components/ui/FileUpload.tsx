'use client'

import { useState, useRef, useId } from 'react'
import { cn } from '@/lib/utils'
import { Upload, X, FileText } from 'lucide-react'

/**
 * FileUpload component — drag and drop + click to upload
 */
export interface FileUploadProps {
  label?: string
  accept?: string
  multiple?: boolean
  maxSize?: number // in MB
  onFilesChange?: (files: File[]) => void
  error?: string
  hint?: string
  disabled?: boolean
  className?: string
}

export function FileUpload({
  label,
  accept,
  multiple = false,
  maxSize = 10,
  onFilesChange,
  error,
  hint,
  disabled = false,
  className,
}: FileUploadProps) {
  const id = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [files, setFiles] = useState<File[]>([])

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return
    const validFiles = Array.from(newFiles).filter(
      (f) => f.size <= maxSize * 1024 * 1024
    )
    const updated = multiple ? [...files, ...validFiles] : validFiles.slice(0, 1)
    setFiles(updated)
    onFilesChange?.(updated)
  }

  const removeFile = (index: number) => {
    const updated = files.filter((_, i) => i !== index)
    setFiles(updated)
    onFilesChange?.(updated)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block font-body text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
          {label}
        </label>
      )}
      <div
        onDragEnter={(e) => { handleDrag(e); setIsDragging(true) }}
        onDragLeave={(e) => { handleDrag(e); setIsDragging(false) }}
        onDragOver={handleDrag}
        onDrop={(e) => { handleDrag(e); setIsDragging(false); handleFiles(e.dataTransfer.files) }}
        onClick={() => !disabled && inputRef.current?.click()}
        className={cn(
          'relative border-2 border-dashed rounded-[var(--radius-md)] p-8',
          'flex flex-col items-center justify-center gap-3 text-center',
          'transition-all duration-[180ms] ease-[cubic-bezier(0.4,0,0.2,1)]',
          'cursor-pointer',
          isDragging
            ? 'border-[var(--primary)] bg-[var(--primary)]/5 scale-[1.01]'
            : error
            ? 'border-[var(--danger)]/50 bg-[var(--danger)]/5'
            : 'border-[var(--border)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)]',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          disabled={disabled}
        />
        <div className={cn(
          'w-12 h-12 rounded-full flex items-center justify-center',
          'transition-colors duration-[180ms]',
          isDragging ? 'bg-[var(--primary)]/10' : 'bg-[var(--bg-secondary)]'
        )}>
          <Upload className={cn(
            'w-5 h-5',
            isDragging ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'
          )} />
        </div>
        <div>
          <p className="font-body text-sm text-[var(--text)]">
            <span className="font-semibold text-[var(--primary)]">Click to upload</span>
            {' '}or drag and drop
          </p>
          <p className="font-body text-xs text-[var(--text-muted)] mt-1">
            {accept ? accept.replace(/,/g, ', ') : 'Any file'} up to {maxSize}MB
          </p>
        </div>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          {files.map((file, i) => (
            <div
              key={i}
              className="flex items-center gap-3 bg-[var(--surface-alt)] rounded-[var(--radius-sm)] px-3 py-2 border border-[var(--border)]"
            >
              <FileText className="w-4 h-4 text-[var(--primary)] shrink-0" />
              <span className="font-body text-sm text-[var(--text)] truncate flex-1">
                {file.name}
              </span>
              <span className="font-body text-xs text-[var(--text-muted)] shrink-0">
                {(file.size / 1024).toFixed(0)}KB
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); removeFile(i) }}
                className="text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors shrink-0"
                aria-label={`Remove ${file.name}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="text-xs text-[var(--danger)] mt-1.5 font-body font-medium" role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-xs text-[var(--text-muted)] mt-1.5 font-body">{hint}</p>
      )}
    </div>
  )
}

export default FileUpload
