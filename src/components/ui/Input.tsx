import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: ReactNode;
  mono?: boolean;
}

/** Labeled text input with hairline surface and accent focus ring. */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, leftIcon, mono, className, id, ...props },
  ref
) {
  const inputId = id ?? props.name;
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="label-mono">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "h-11 w-full rounded-(--radius-input) bg-surface-1 px-3 text-fg placeholder:text-faint",
            "hairline transition-colors outline-none",
            "focus:border-accent focus:ring-2 focus:ring-accent/30",
            leftIcon && "pl-9",
            mono && "font-mono tracking-wide",
            error && "border-fail focus:border-fail focus:ring-fail/30",
            className
          )}
          aria-invalid={error ? true : undefined}
          {...props}
        />
      </div>
      {error ? (
        <p className="text-xs text-fail">{error}</p>
      ) : hint ? (
        <p className="text-xs text-faint">{hint}</p>
      ) : null}
    </div>
  );
});
