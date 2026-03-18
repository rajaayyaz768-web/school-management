import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

/**
 * Tooltip
 * 
 * Floating label that appears on hover or focus to provide context.
 * Renders into a React Portal attached to document.body to prevent clipping.
 */
export interface TooltipProps {
  content: string | React.ReactNode;
  children: React.ReactElement;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  disabled?: boolean;
  className?: string;
}

const Tooltip = ({
  content,
  children,
  position = 'top',
  delay = 400,
  disabled = false,
  className
}: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [actualPosition, setActualPosition] = useState(position);
  
  const triggerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (disabled || !content) return;
    timerRef.current = setTimeout(() => {
      calculatePosition();
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsVisible(false);
  };

  const calculatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;
    
    let top = 0;
    let left = 0;
    let newPos = position;

    // Smart flip: flip if there's no room
    if (position === 'top' && rect.top < 40) newPos = 'bottom';
    if (position === 'bottom' && window.innerHeight - rect.bottom < 40) newPos = 'top';
    if (position === 'left' && rect.left < 100) newPos = 'right';
    if (position === 'right' && window.innerWidth - rect.right < 100) newPos = 'left';

    switch (newPos) {
      case 'top':
        top = rect.top + scrollY - 6;
        left = rect.left + scrollX + rect.width / 2;
        break;
      case 'bottom':
        top = rect.bottom + scrollY + 6;
        left = rect.left + scrollX + rect.width / 2;
        break;
      case 'left':
        top = rect.top + scrollY + rect.height / 2;
        left = rect.left + scrollX - 6;
        break;
      case 'right':
        top = rect.top + scrollY + rect.height / 2;
        left = rect.right + scrollX + 6;
        break;
    }

    setActualPosition(newPos);
    setCoords({ top, left });
  };

  // Re-calc on scroll/resize if visible
  useEffect(() => {
    if (!isVisible) return;
    window.addEventListener("scroll", calculatePosition, true);
    window.addEventListener("resize", calculatePosition);
    return () => {
      window.removeEventListener("scroll", calculatePosition, true);
      window.removeEventListener("resize", calculatePosition);
    };
  }, [isVisible, position]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const isLongText = typeof content === 'string' && content.length > 30;

  const tooltipPortal = isVisible && typeof document !== 'undefined' ? createPortal(
    <div
      className={cn(
        "absolute z-[9999] pointer-events-none w-max max-w-[200px] rounded-[var(--radius-sm)] bg-[var(--text)]/90 px-2.5 py-1.5 font-[var(--font-body)] text-[12px] font-normal text-[var(--bg)] shadow-[var(--shadow-md)]",
        "animate-in fade-in duration-[140ms] ease-[var(--transition-base)]",
        actualPosition === 'top' && "slide-in-from-bottom-1 -translate-x-1/2 -translate-y-full",
        actualPosition === 'bottom' && "slide-in-from-top-1 -translate-x-1/2",
        actualPosition === 'left' && "slide-in-from-right-1 -translate-y-1/2 -translate-x-full",
        actualPosition === 'right' && "slide-in-from-left-1 -translate-y-1/2",
        isLongText ? "whitespace-normal text-left" : "whitespace-nowrap text-center",
        className
      )}
      style={{
        top: coords.top,
        left: coords.left,
      }}
    >
      {content}
      
      {/* Arrow */}
      <div 
        className={cn(
          "absolute h-2 w-2 rotate-45 bg-[var(--text)]/90",
          actualPosition === 'top' && "bottom-[-4px] left-1/2 -ml-1",
          actualPosition === 'bottom' && "top-[-4px] left-1/2 -ml-1",
          actualPosition === 'left' && "right-[-4px] top-1/2 -mt-1",
          actualPosition === 'right' && "left-[-4px] top-1/2 -mt-1"
        )}
      />
    </div>,
    document.body
  ) : null;

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
        className="inline-flex items-center justify-center align-middle"
      >
        {children}
      </div>
      {tooltipPortal}
    </>
  );
};

export { Tooltip };
