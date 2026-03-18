import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export interface PopoverProps {
  trigger: React.ReactElement;
  children: React.ReactNode;
  position?: 'bottom-start' | 'bottom-end' | 'bottom' | 'top-start' | 'top-end' | 'top';
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  closeOnContentClick?: boolean;
  showArrow?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * Popover
 * 
 * Interactive floating panel that appears on click.
 * Handles menus, custom pickers, and deep interactions.
 */
const Popover = ({
  trigger,
  children,
  position = 'bottom-start',
  isOpen: controlledIsOpen,
  onOpenChange,
  closeOnContentClick = false,
  showArrow = false,
  disabled = false,
  className
}: PopoverProps) => {
  const [uncontrolledIsOpen, setUncontrolledIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [actualPosition, setActualPosition] = useState(position);

  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : uncontrolledIsOpen;

  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const toggleOpen = () => {
    if (disabled) return;
    const nextState = !isOpen;
    if (!isControlled) setUncontrolledIsOpen(nextState);
    if (onOpenChange) onOpenChange(nextState);
  };

  const close = () => {
    if (!isControlled) setUncontrolledIsOpen(false);
    if (onOpenChange) onOpenChange(false);
  };

  const calculatePosition = () => {
    if (!triggerRef.current || !isOpen) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;
    
    let top = 0;
    let left = 0;
    let newPos = position;

    // Smart flip
    if (position.startsWith('bottom') && window.innerHeight - rect.bottom < 150) {
      newPos = position.replace('bottom', 'top') as any;
    }
    if (position.startsWith('top') && rect.top < 150) {
      newPos = position.replace('top', 'bottom') as any;
    }

    const gap = showArrow ? 10 : 6;

    switch (newPos) {
      case 'bottom-start':
        top = rect.bottom + scrollY + gap;
        left = rect.left + scrollX;
        break;
      case 'bottom-end':
        top = rect.bottom + scrollY + gap;
        // Approximation: will attach inline style for right-alignment logic
        left = rect.right + scrollX; 
        break;
      case 'bottom':
        top = rect.bottom + scrollY + gap;
        left = rect.left + scrollX + rect.width / 2;
        break;
      case 'top-start':
        top = rect.top + scrollY - gap;
        left = rect.left + scrollX;
        break;
      case 'top-end':
        top = rect.top + scrollY - gap;
        left = rect.right + scrollX;
        break;
      case 'top':
        top = rect.top + scrollY - gap;
        left = rect.left + scrollX + rect.width / 2;
        break;
    }

    setActualPosition(newPos);
    setCoords({ top, left });
  };

  // Click outside listener
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target as Node) &&
        panelRef.current && !panelRef.current.contains(e.target as Node)
      ) {
        close();
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    window.addEventListener("scroll", calculatePosition, true);
    window.addEventListener("resize", calculatePosition);

    calculatePosition();

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("scroll", calculatePosition, true);
      window.removeEventListener("resize", calculatePosition);
    };
  }, [isOpen]);

  const handleContentClick = () => {
    if (closeOnContentClick) close();
  };

  const popoverPortal = isOpen && typeof document !== 'undefined' ? createPortal(
    <div
      ref={panelRef}
      onClick={handleContentClick}
      className={cn(
        "absolute z-[60] min-w-[160px] max-w-[320px] rounded-[var(--radius-md)] bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-lg)]",
        "animate-in fade-in duration-[160ms] ease-[var(--transition-base)]",
        actualPosition.startsWith('bottom') && "slide-in-from-top-2 origin-top",
        actualPosition.startsWith('top') && "slide-in-from-bottom-2 origin-bottom",
        actualPosition.endsWith('bottom') && "-translate-x-1/2",
        actualPosition.endsWith('top') && "-translate-y-full -translate-x-1/2",
        actualPosition === 'bottom-start' && "",
        actualPosition === 'bottom-end' && "-translate-x-full",
        actualPosition === 'top-start' && "-translate-y-full",
        actualPosition === 'top-end' && "-translate-y-full -translate-x-full",
        className
      )}
      style={{
        top: coords.top,
        left: coords.left,
      }}
    >
      {children}
      
      {showArrow && (
        <div 
          className={cn(
            "absolute h-2 w-2 rotate-45 border-l border-t border-[var(--border)] bg-[var(--surface)]",
            actualPosition.startsWith('bottom') ? "-top-[5px] left-4 border-r-0 border-b-0" : "-bottom-[5px] left-4 border-l-0 border-t-0 border-r border-b",
            actualPosition.endsWith('end') && "left-auto right-4",
            (actualPosition === 'top' || actualPosition === 'bottom') && "left-1/2 -ml-1 border"
          )}
        />
      )}
    </div>,
    document.body
  ) : null;

  return (
    <>
      <div
        ref={triggerRef}
        onClick={toggleOpen}
        className="inline-flex cursor-pointer"
      >
        {trigger}
      </div>
      {popoverPortal}
    </>
  );
};

export const PopoverContent = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("p-2", className)}>{children}</div>
);

export interface PopoverItemProps {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'danger';
  disabled?: boolean;
  className?: string;
}

export const PopoverItem = ({ label, icon, onClick, variant = 'default', disabled, className }: PopoverItemProps) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "flex w-full items-center gap-2 h-9 px-3 text-[14px] font-[var(--font-body)] text-[var(--text)] transition-colors rounded-[var(--radius-sm)] focus:outline-none focus:bg-[var(--surface-hover)]",
      variant === 'default' && "hover:bg-[var(--surface-hover)]",
      variant === 'danger' && "text-[var(--danger)] hover:bg-[var(--danger)]/10 text-[var(--danger)]",
      disabled && "opacity-50 cursor-not-allowed",
      className
    )}
  >
    {icon && (
      <span className={cn(
        "flex h-4 w-4 shrink-0 items-center justify-center text-[var(--text-secondary)]",
        variant === 'danger' && "text-[var(--danger)]/80"
      )}>
        {icon}
      </span>
    )}
    <span className="truncate">{label}</span>
  </button>
);

export const PopoverDivider = ({ className }: { className?: string }) => (
  <div className={cn("my-1 h-px w-full bg-[var(--border)]", className)} />
);

export const PopoverHeader = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("px-3 py-2 text-[11px] uppercase tracking-[0.07em] font-medium text-[var(--text-muted)] font-[var(--font-body)]", className)}>
    {children}
  </div>
);

export { Popover };
