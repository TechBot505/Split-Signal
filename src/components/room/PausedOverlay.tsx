"use client";

import { Button, ModalCard } from "@/components/ui";
import { RadarLoader } from "@/components/hud";

export interface PausedOverlayProps {
  open: boolean;
  /** True when both seats are connected (Resume only allowed then). */
  bothConnected: boolean;
  onResume: () => void;
}

/** Overlay shown while the shared countdown is frozen (manual or auto pause). */
export function PausedOverlay({ open, bothConnected, onResume }: PausedOverlayProps) {
  return (
    <ModalCard
      open={open}
      tone={bothConnected ? "warn" : "fail"}
      dismissable={false}
      title={bothConnected ? "Paused" : "Partner disconnected"}
      footer={
        bothConnected ? (
          <Button size="sm" onClick={onResume}>
            Resume
          </Button>
        ) : undefined
      }
    >
      <div className="flex flex-col items-center gap-4 py-2 text-center">
        {!bothConnected && <RadarLoader size={56} label="Waiting…" />}
        <p className="text-sm text-muted">
          {bothConnected
            ? "The countdown is frozen. Resume when you're both ready to continue."
            : "Your partner dropped out. The run resumes automatically once they reconnect."}
        </p>
      </div>
    </ModalCard>
  );
}
