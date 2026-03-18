import React, { forwardRef, useRef, useEffect } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * SearchInput
 * 
 * Used for searching and filtering tables (students, staff, defaulters).
 * Features automatic debouncing, loading states, and size variants.
 */
export interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'size'> {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;        // default 350
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg'; // default 'md'
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      value,
      onChange,
      onSearch,
      placeholder = "Search...",
      debounceMs = 350,
      isLoading = false,
      size = 'md',
      disabled = false,
      autoFocus = false,
      className,
      ...props
    },
    ref
  ) => {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Cleanup timeout on unmount
    useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVal = e.target.value;
      onChange(newVal);

      if (onSearch) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          onSearch(newVal);
        }, debounceMs);
      }
    };

    const handleClear = () => {
      onChange("");
      if (onSearch) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        onSearch("");
      }
    };

    const sizeStyles = {
      sm: "h-[34px] text-[13px] pl-[34px] pr-[34px]",
      md: "h-[40px] text-[14px] pl-[38px] pr-[38px]",
      lg: "h-[46px] text-[15px] pl-[42px] pr-[42px]",
    };

    const iconSizes = {
      sm: "h-3.5 w-3.5",
      md: "h-4 w-4",
      lg: "h-[18px] w-[18px]",
    };

    return (
      <div className={cn("relative flex w-full items-center", className)}>
        {/* Search Icon */}
        <div className="pointer-events-none absolute left-3 flex h-full items-center justify-center text-[var(--text-muted)] p-[2px] transition-colors peer-focus:text-[var(--primary)]">
          <Search className={iconSizes[size]} />
        </div>

        {/* Input */}
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={handleChange}
          disabled={disabled}
          autoFocus={autoFocus}
          placeholder={placeholder}
          className={cn(
            "peer w-full rounded-[var(--radius-md)] bg-[var(--surface)] text-[var(--text)] font-[var(--font-body)]",
            "border border-[var(--border)] transition-all duration-[var(--transition-base)]",
            "placeholder:text-[var(--text-muted)]",
            "focus:border-[var(--border-strong)] focus:outline-none focus:shadow-[var(--shadow-glow)]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            sizeStyles[size]
          )}
          {...props}
        />

        {/* Right Side Actions */}
        <div className="absolute right-3 flex h-full items-center justify-center">
          {isLoading ? (
            <Loader2 className={cn("animate-spin text-[var(--primary)]", iconSizes[size])} style={{ animationDuration: '0.7s' }} />
          ) : (
             <button
              type="button"
              onClick={handleClear}
              disabled={disabled}
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded-full bg-[var(--text-muted)]/15 text-[var(--text)] transition-opacity duration-200",
                "hover:bg-[var(--text-secondary)]/25 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-1 focus:ring-offset-[var(--surface)]",
                value ? "opacity-100" : "opacity-0 pointer-events-none"
              )}
              aria-label="Clear search"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          )}
        </div>
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";

export { SearchInput };
