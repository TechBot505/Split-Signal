"use client";

import type { ReactNode } from "react";

/** Shared horizontal rhythm: gutters + centered 480px column for every band. */
const BAND = "mx-auto w-full max-w-[480px] px-4";

export interface PhaseLayoutProps {
  /** Title row content shown directly below RoomHeader (role, stage, etc.). */
  title?: ReactNode;
  /** Right-aligned slot in the title row (e.g. the timer). */
  aside?: ReactNode;
  /** Always-visible bottom action dock (safe-area aware). */
  dock?: ReactNode;
  children: ReactNode;
}

/**
 * The single consistent room-phase shell:
 *
 *   RoomHeader (owned by RoomScreen)
 *   ├─ title / aside row      ← below the header, never overlaps its buttons
 *   ├─ scrollable content     ← min-h-0 flex-1 overflow-y-auto
 *   └─ bottom action dock      ← sticky + safe-area, primary action always visible
 *
 * Per the design contract the dock combines `pt-3` with a single
 * `pb-[max(16px,env(safe-area-inset-bottom))]`, never a bare safe-area utility
 * alongside another Tailwind padding on the same box.
 */
export function PhaseLayout({ title, aside, dock, children }: PhaseLayoutProps) {
  return (
    <section className="flex min-h-0 flex-1 flex-col">
      {(title || aside) && (
        <div className="shrink-0">
          <div className={`${BAND} flex items-start justify-between gap-3 pb-1 pt-1`}>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">{title}</div>
            {aside && <div className="shrink-0">{aside}</div>}
          </div>
        </div>
      )}

      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className={`${BAND} pb-8 pt-2`}>{children}</div>
      </div>

      {dock && (
        <div
          className="shrink-0 hairline-t bg-canvas/85 pt-3 pb-[max(16px,env(safe-area-inset-bottom))] backdrop-blur"
        >
          <div className={BAND}>{dock}</div>
        </div>
      )}
    </section>
  );
}
