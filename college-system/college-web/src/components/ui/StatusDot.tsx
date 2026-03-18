import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Tooltip } from "./Tooltip";

export type StatusType =
  | 'online' | 'offline' | 'away'
  | 'present' | 'absent' | 'late' | 'on-leave'
  | 'active' | 'inactive' | 'break' | 'free' | 'idle'
  | 'default' | 'unknown';

export interface StatusDotProps extends React.HTMLAttributes<HTMLDivElement> {
  status: StatusType;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  pulse?: boolean;
  label?: string;
  tooltip?: string;
}

const colorMap: Record<StatusType, string> = {
  online: "bg-[var(--success)]",
  present: "bg-[var(--success)]",
  active: "bg-[var(--success)]",
  
  offline: "bg-[var(--danger)]",
  absent: "bg-[var(--danger)]",
  inactive: "bg-[var(--danger)]",
  
  away: "bg-[var(--warning)]",
  'on-leave': "bg-[var(--warning)]",
  late: "bg-[var(--warning)]",
  
  break: "bg-[var(--info)]",
  free: "bg-[var(--info)]",
  idle: "bg-[var(--info)]",
  
  default: "bg-[var(--text-muted)]",
  unknown: "bg-[var(--text-muted)]",
};

const sizeMap = {
  xs: "h-[6px] w-[6px]",
  sm: "h-[8px] w-[8px]",
  md: "h-[10px] w-[10px]",
  lg: "h-[12px] w-[12px]",
};

/**
 * StatusDot
 * 
 * Simple colored dot for availability matching status standards.
 * Supports pulsing animations and tooltip/label combinations.
 */
const StatusDot = forwardRef<HTMLDivElement, StatusDotProps>(
  (
    {
      status,
      size = 'sm',
      pulse = false,
      label,
      tooltip,
      className,
      ...props
    },
    ref
  ) => {
    const bgColor = colorMap[status] || colorMap.default;
    const dotSize = sizeMap[size];

    const content = (
      <div 
        ref={ref} 
        className={cn("inline-flex items-center gap-[6px]", className)} 
        {...props}
      >
        <div className="relative flex items-center justify-center">
          <span
            className={cn(
              "rounded-full shadow-[0_0_0_2px_var(--surface)]",
              bgColor,
              dotSize
            )}
          />
          {pulse && (
            <span
              className={cn(
                "absolute rounded-full opacity-30 animate-pulseDot",
                bgColor,
                dotSize
              )}
            />
          )}
        </div>
        
        {label && (
          <span className="font-body text-[12px] text-[var(--text-secondary)]">
            {label}
          </span>
        )}
      </div>
    );

    if (tooltip) {
      return <Tooltip content={tooltip}>{content}</Tooltip>;
    }

    return content;
  }
);

StatusDot.displayName = "StatusDot";

export { StatusDot };
