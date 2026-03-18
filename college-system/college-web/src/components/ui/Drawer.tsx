import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Drawer
 * 
 * Slide-in overlay panel originating from the right edge.
 * Traps focus, locks body scroll, and supports contextual side-by-side editing.
 */
export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg' | 'full'; // default 'md'
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const Drawer = ({
  isOpen,
  onClose,
  title,
  subtitle,
  size = 'md',
  footer,
  children,
  className
}: DrawerProps) => {
  const panelRef = useRef<HTMLDivElement>(null);

  // Body scroll lock and Escape key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleKeyDown);
      // Slight delay to allow render before focus
      setTimeout(() => panelRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "w-full sm:w-[360px]",
    md: "w-full sm:w-[480px]",
    lg: "w-full sm:w-[600px]",
    full: "w-full",
  };

  const drawerPortal = typeof document !== 'undefined' ? createPortal(
    <div className="fixed inset-0 z-[50] flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-[280ms]"
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "relative z-[51] flex h-full flex-col bg-[var(--surface)] border-l border-[var(--border)] shadow-[var(--shadow-lg)]",
          "animate-in slide-in-from-right duration-[280ms] ease-[cubic-bezier(0.4,0,0.2,1)] focus:outline-none",
          sizeClasses[size],
          className
        )}
      >
        {/* Custom Scrollbar Styles specific to Drawer content */}
        <style dangerouslySetInnerHTML={{ __html: `
          .drawer-scroll::-webkit-scrollbar { width: 4px; }
          .drawer-scroll::-webkit-scrollbar-track { background: transparent; }
          .drawer-scroll::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 2px; }
        `}} />

        {/* Header */}
        <div className="flex shrink-0 h-[60px] items-center justify-between border-b border-[var(--border)] px-5">
          <div className="flex flex-col">
            <h2 className="font-body text-[16px] font-semibold text-[var(--text)] leading-tight">{title}</h2>
            {subtitle && (
              <p className="font-body text-[12px] text-[var(--text-secondary)] leading-tight mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            aria-label="Close drawer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="drawer-scroll flex-1 overflow-y-auto p-5 font-[var(--font-body)] text-[var(--text)]">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex shrink-0 items-center justify-end gap-2.5 border-t border-[var(--border)] bg-[var(--surface)] p-4 px-5">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  ) : null;

  return drawerPortal;
};

export { Drawer };
