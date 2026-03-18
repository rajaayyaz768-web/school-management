import React, { forwardRef, useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Returns a WhatsApp API URL strictly for Pakistani mobile numbers starting with 03.
 * Automatically formats "03001234567" to "https://wa.me/923001234567".
 * Returns empty string if invalid or a landline.
 */
export function toWhatsAppUrl(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (!isValidPakistaniPhone(digits)) return "";
  return `https://wa.me/92${digits.substring(1)}`;
}

/**
 * Formats exactly 11 digits as "0300-1234567". 
 * Used automatically by PhoneInput but available for manual usage.
 */
export function formatPakistaniPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length <= 4) return digits;
  return `${digits.substring(0, 4)}-${digits.substring(4, 11)}`;
}

/**
 * Validates that the number has exactly 11 digits and starts with 03.
 */
export function isValidPakistaniPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return /^03\d{9}$/.test(digits);
}

export interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  showInput?: boolean;      // default true
  showWhatsApp?: boolean;   // default true
  showCopy?: boolean;       // default true
  name?: string;            // e.g. "Father" shown before number
  className?: string;
}

/**
 * PhoneInput
 * 
 * Specialized Pakistani phone number component spanning two modes:
 * Input mode: Flex container with pre-pended +92 pill and formatting enforcement.
 * Display mode: Read-only presentation with copy-to-clipboard and WhatsApp launching.
 */
const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  (
    {
      value,
      onChange,
      label,
      error: externalError,
      hint,
      required,
      disabled,
      placeholder = "0300-1234567",
      showInput = true,
      showWhatsApp = true,
      showCopy = true,
      name,
      className,
      ...props
    },
    ref
  ) => {
    const [internalError, setInternalError] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const [copied, setCopied] = useState(false);

    const displayValue = formatPakistaniPhone(value);
    const activeError = externalError || internalError;

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(displayValue);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } catch (err) {
        // Fallback or ignore clipboard errors on unsupported devices
      }
    };

    if (!showInput) {
      const waUrl = toWhatsAppUrl(value);
      const isMobile = !!waUrl;

      return (
        <div className={cn("group flex items-center gap-2.5", className)}>
          {name && <span className="text-sm font-medium text-[var(--text-secondary)]">{name}:</span>}
          {value ? (
            <span className="font-body text-sm font-medium text-[var(--text)] tracking-[0.02em]">
              {displayValue}
            </span>
          ) : (
            <span className="font-body text-sm text-[var(--text-muted)]">Not provided</span>
          )}

          {value && showWhatsApp && isMobile && (
            <button
              onClick={() => window.open(waUrl, "_blank")}
              className={cn(
                "flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[#25D366]/30 bg-[#25D366]/12 px-2.5 py-1",
                "transition-colors hover:bg-[#25D366]/20 focus:outline-none focus:ring-2 focus:ring-[#25D366]/50"
              )}
              title="Open in WhatsApp"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.059-.173-.298-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.585-.011c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.575-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" fill="#25D366"/>
              </svg>
              <span className="font-body text-[11px] font-medium text-[#25D366]">WhatsApp</span>
            </button>
          )}

          {value && showCopy && (
            <div className="relative flex items-center">
              <button
                onClick={handleCopy}
                className={cn(
                  "opacity-0 transition-opacity hover:text-[var(--text)] text-[var(--text-muted)] focus:opacity-100 group-hover:opacity-100",
                  "flex h-6 w-6 items-center justify-center rounded-md hover:bg-[var(--surface-hover)]"
                )}
                title="Copy number"
              >
                {copied ? <Check className="h-4 w-4 text-[var(--success)]" /> : <Copy className="h-4 w-4" />}
              </button>
              {copied && (
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 rounded bg-[var(--text)] px-2 py-1 text-[10px] whitespace-nowrap font-medium text-[var(--bg)] shadow-sm">
                  Copied!
                </span>
              )}
            </div>
          )}
        </div>
      );
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\D/g, "").substring(0, 11);
      onChange(raw);
      setInternalError(""); // clear error immediately upon typing
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      const raw = value.replace(/\D/g, "");
      if (required && !raw) {
        setInternalError("Phone number is required");
      } else if (raw && (!raw.startsWith("0") || raw.length !== 11)) {
        setInternalError("Enter a valid Pakistani mobile number (e.g. 0300-1234567)");
      }
    };

    return (
      <div className={cn("flex w-full flex-col gap-1.5", className)}>
        {label && (
          <label className="font-body text-xs font-medium text-[var(--text-secondary)]">
            {label}
            {required && <span className="ml-1 text-[var(--danger)]">*</span>}
          </label>
        )}

        <div
          className={cn(
            "flex w-full items-stretch rounded-[var(--radius-md)] bg-[var(--surface)] transition-all duration-[var(--transition-base)]",
            "border border-[var(--border)]",
            disabled ? "cursor-not-allowed opacity-50" : "hover:border-[var(--border-strong)]",
            isFocused && "border-[var(--border-strong)] shadow-[var(--shadow-glow)]",
            activeError && "border-[var(--danger)] shadow-[0_0_0_3px_rgba(239,68,68,0.12)]"
          )}
        >
          {/* Left Pill */}
          <div className="flex select-none items-center justify-center gap-1.5 rounded-l-[var(--radius-md)] border-r border-[var(--border)] bg-[var(--surface-hover)] px-3 text-[13px] text-[var(--text-secondary)]">
            <span>🇵🇰</span>
            <span>+92</span>
          </div>

          {/* Right Text Input */}
          <input
            {...props}
            ref={ref}
            type="tel"
            disabled={disabled}
            placeholder={placeholder}
            value={displayValue}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={handleBlur}
            className="flex-1 rounded-r-[var(--radius-md)] bg-transparent px-3 font-[var(--font-body)] text-[14px] tracking-[0.02em] text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none"
          />
        </div>

        {activeError && (
          <p className="font-body text-xs font-medium text-[var(--danger)] animate-shake">
            {activeError}
          </p>
        )}
        {hint && !activeError && (
          <p className="font-body text-xs text-[var(--text-muted)]">{hint}</p>
        )}
      </div>
    );
  }
);

PhoneInput.displayName = "PhoneInput";

export { PhoneInput };
