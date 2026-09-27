"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { IconButton } from "@/components/ui";
import { formatDateKey } from "@/lib/format";

export const MAX_DAYS_BACK = 7;

function label(offset: number, dateKey: string): string {
  if (offset === 0) return "Today";
  if (offset === 1) return "Yesterday";
  return formatDateKey(dateKey);
}

export interface DateSwitcherProps {
  offset: number;
  dateKey: string;
  onChange: (offset: number) => void;
}

/** Day stepper: ← older (up to 7 days), → newer (up to today). */
export function DateSwitcher({ offset, dateKey, onChange }: DateSwitcherProps) {
  return (
    <div className="mb-4 flex items-center justify-between gap-2 rounded-(--radius-card) bg-surface-1 p-2 hairline">
      <IconButton
        label="Older day"
        tone="ghost"
        disabled={offset >= MAX_DAYS_BACK}
        onClick={() => onChange(Math.min(MAX_DAYS_BACK, offset + 1))}
      >
        <ChevronLeft size={18} />
      </IconButton>
      <div className="flex flex-col items-center">
        <span className="text-sm text-display text-fg">{label(offset, dateKey)}</span>
        <span className="label-mono">{dateKey}</span>
      </div>
      <IconButton
        label="Newer day"
        tone="ghost"
        disabled={offset <= 0}
        onClick={() => onChange(Math.max(0, offset - 1))}
      >
        <ChevronRight size={18} />
      </IconButton>
    </div>
  );
}
