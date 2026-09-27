"use client";

import type { ClientMessage } from "@/game/protocol";
import type { SignalKind } from "@/game/types";
import { cn } from "@/lib/cn";
import { haptic } from "@/lib/haptics";
import { playSound } from "@/lib/sound";
import { SIGNALS } from "./constants";

export interface SignalBarProps {
  send: (msg: ClientMessage) => void;
  disabled?: boolean;
}

/** Bottom dock: six equal-width quick-signal keys (icon over a micro label). */
export function SignalBar({ send, disabled }: SignalBarProps) {
  const flash = (kind: SignalKind) => {
    send({ type: "signal", kind });
    playSound("click");
    haptic("light");
  };

  return (
    <div className="grid grid-cols-6 gap-1.5" role="group" aria-label="Quick signals">
      {SIGNALS.map(({ kind, label, Icon }) => (
        <button
          key={kind}
          type="button"
          disabled={disabled}
          onClick={() => flash(kind)}
          className={cn(
            "flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-(--radius-input) px-0.5",
            "bg-surface-2 text-fg hairline transition-colors hover:bg-surface-1 active:scale-95",
            disabled && "pointer-events-none opacity-40",
          )}
        >
          <Icon size={17} aria-hidden />
          <span className="text-[11px] font-medium leading-none whitespace-nowrap">{label}</span>
        </button>
      ))}
    </div>
  );
}
