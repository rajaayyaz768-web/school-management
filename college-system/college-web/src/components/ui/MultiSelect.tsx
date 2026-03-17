/**
 * MultiSelect Component
 * 
 * A controlled multi-select dropdown supporting search, clear all, and custom chip rendering.
 * Used for selecting multiple tags, subjects, or permissions.
 */

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Search, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export type MultiSelectOption = {
  value: string;
  label: string;
  description?: string;
};

export interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (values: string[]) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  hint?: string;
  disabled?: boolean;
  searchable?: boolean;
  maxVisible?: number;
  className?: string;
}

export function MultiSelect({
  options,
  value,
  onChange,
  label,
  placeholder = 'Select...',
  error,
  hint,
  disabled = false,
  searchable = true,
  maxVisible = 3,
  className,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const toggleOpen = () => {
    if (!disabled) setIsOpen(!isOpen);
    if (!isOpen) setSearchQuery(''); // Reset search when opening
  };

  const currentSelection = options.filter((opt) => value.includes(opt.value));
  const filteredOptions = searchable 
    ? options.filter((opt) => opt.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : options;

  const handleSelect = (val: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val));
    } else {
      onChange([...value, val]);
    }
  };

  const handleRemove = (val: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== val));
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  const handleSelectAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(options.map((opt) => opt.value));
  };

  const showActions = options.length >= 3;

  return (
    <div className={cn('relative w-full font-body', className)} ref={containerRef}>
      {label && (
        <label className="mb-2 block text-sm font-medium text-[var(--text)]">
          {label}
        </label>
      )}

      {/* Input / trigger area */}
      <div
        onClick={toggleOpen}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={cn(
          'relative flex min-h-[42px] w-full items-center justify-between rounded-[var(--radius-md)] border px-3 py-1.5 transition-colors',
          disabled 
            ? 'opacity-50 cursor-not-allowed bg-[var(--bg)] border-[var(--border)]' 
            : 'cursor-pointer bg-[var(--surface)]',
          error 
            ? 'border-[var(--danger)]' 
            : isOpen 
              ? 'border-[var(--primary)] ring-1 ring-[var(--primary)]' 
              : 'border-[var(--border)] hover:border-[var(--border-strong)]'
        )}
      >
        <div className="flex flex-wrap items-center gap-1.5 flex-1 pr-6">
          {currentSelection.length === 0 ? (
            <span className="text-[var(--text-muted)] text-sm">{placeholder}</span>
          ) : (
            <>
              {currentSelection.slice(0, maxVisible).map((item) => (
                <span
                  key={item.value}
                  className="inline-flex items-center gap-1 rounded-full bg-[var(--primary)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--primary)]"
                >
                  {item.label}
                  <button
                    type="button"
                    title={`Remove ${item.label}`}
                    onClick={(e) => handleRemove(item.value, e)}
                    className="rounded-full hover:bg-[var(--primary)]/20 p-0.5 focus:outline-none"
                    disabled={disabled}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {currentSelection.length > maxVisible && (
                <span className="inline-flex items-center rounded-full bg-[var(--primary)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--primary)]">
                  +{currentSelection.length - maxVisible} more
                </span>
              )}
            </>
          )}
        </div>
        
        <ChevronDown 
          className={cn(
            'absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-secondary)] transition-transform duration-200', 
            isOpen && 'rotate-180'
          )} 
        />
      </div>

      {hint && !error && (
        <p className="mt-1.5 text-xs text-[var(--text-muted)]">{hint}</p>
      )}
      
      {error && (
        <p className="mt-1.5 text-xs text-[var(--danger)] font-medium">{error}</p>
      )}

      {/* Dropdown panel */}
      {isOpen && !disabled && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface)] shadow-md">
          {searchable && (
            <div className="flex items-center border-b border-[var(--border)] px-3 py-2">
              <Search className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={(e) => e.stopPropagation()} // Keep dropdown open when typing
                className="ml-2 w-full appearance-none bg-transparent text-sm text-[var(--text)] placeholder-[var(--text-muted)] outline-none"
              />
            </div>
          )}

          {/* Action Header */}
          {showActions && !searchQuery && (
            <div className="flex items-center justify-between border-b border-[var(--border)]/50 px-3 py-2 text-xs font-medium">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-[var(--primary)] hover:underline"
              >
                Select all
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="text-[var(--danger)] hover:underline"
              >
                Clear
              </button>
            </div>
          )}

          <div
            className="custom-scrollbar max-h-60 overflow-y-auto"
            role="listbox"
            aria-multiselectable="true"
          >
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-4 text-center text-sm text-[var(--text-muted)]">
                No results found.
              </div>
            ) : (
              <ul className="py-1">
                {filteredOptions.map((option) => {
                  const isSelected = value.includes(option.value);
                  return (
                    <li
                      key={option.value}
                      role="option"
                      aria-selected={isSelected}
                      onClick={(e) => handleSelect(option.value, e)}
                      className={cn(
                        'relative flex cursor-pointer select-none items-center justify-between px-3 py-2 text-sm transition-colors duration-100 min-h-[36px]',
                        isSelected 
                          ? 'bg-[var(--primary)]/10 text-[var(--primary)] font-medium' 
                          : 'text-[var(--text)] hover:bg-[var(--surface-hover)]'
                      )}
                    >
                      <div className="flex flex-col">
                        <span>{option.label}</span>
                        {option.description && (
                          <span className="text-xs opacity-70 mt-0.5">
                            {option.description}
                          </span>
                        )}
                      </div>
                      
                      {isSelected && (
                        <Check className="h-4 w-4 shrink-0 text-[var(--primary)]" />
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
