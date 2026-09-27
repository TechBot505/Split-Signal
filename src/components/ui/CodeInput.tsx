"use client";

import { useRef, type ClipboardEvent, type KeyboardEvent } from "react";
import { cn } from "@/lib/cn";

const ALLOWED = /[A-HJ-NP-Z]/g; // A–Z minus I and O

export interface CodeInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
  ariaLabel?: string;
}

function sanitize(raw: string): string {
  return (raw.toUpperCase().match(ALLOWED) ?? []).join("");
}

/** N mono boxes for room codes: auto-advance, paste-aware, filtered to A–Z (no I/O). */
export function CodeInput({
  value,
  onChange,
  length = 4,
  onComplete,
  disabled,
  autoFocus,
  className,
  ariaLabel = "Room code",
}: CodeInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const chars = Array.from({ length }, (_, i) => value[i] ?? "");

  const commit = (next: string) => {
    const clipped = next.slice(0, length);
    onChange(clipped);
    if (clipped.length === length) onComplete?.(clipped);
  };

  const setAt = (i: number, raw: string) => {
    const c = sanitize(raw).slice(-1);
    const arr = chars.slice();
    arr[i] = c;
    commit(arr.join("").slice(0, length));
    if (c && i < length - 1) refs.current[i + 1]?.focus();
  };

  const onKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !chars[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

  const onPaste = (i: number, e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = sanitize(e.clipboardData.getData("text"));
    if (!pasted) return;
    const arr = chars.slice();
    for (let k = 0; k < pasted.length && i + k < length; k++) arr[i + k] = pasted[k];
    commit(arr.join("").slice(0, length));
    const nextEmpty = Math.min(i + pasted.length, length - 1);
    refs.current[nextEmpty]?.focus();
  };

  return (
    <div role="group" aria-label={ariaLabel} className={cn("flex gap-2", className)}>
      {chars.map((c, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={c}
          disabled={disabled}
          autoFocus={autoFocus && i === 0}
          inputMode="text"
          autoCapitalize="characters"
          autoComplete="off"
          maxLength={1}
          aria-label={`Character ${i + 1}`}
          onChange={(e) => setAt(i, e.target.value)}
          onKeyDown={(e) => onKeyDown(i, e)}
          onPaste={(e) => onPaste(i, e)}
          onFocus={(e) => e.target.select()}
          className={cn(
            "h-14 w-12 rounded-(--radius-input) bg-surface-1 text-center font-mono text-2xl uppercase text-fg",
            "hairline outline-none transition-colors caret-accent",
            "focus:border-accent focus:ring-2 focus:ring-accent/30",
            c && "border-accent/50",
            disabled && "text-faint"
          )}
        />
      ))}
    </div>
  );
}
