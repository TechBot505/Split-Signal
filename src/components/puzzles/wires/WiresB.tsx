"use client";

import { Fragment } from "react";
import { WIRE_COLORS, type WireColor, type WiresViewB } from "@/game/puzzles/wires/types";
import type { WiresAction } from "@/game/puzzles/wires/types";
import type { PuzzleViewProps } from "../types";
import { PartnerStrip, PuzzlePanel } from "../shared";
import { WIRE_HEX } from "./colors";

const COLOR_SET = new Set<string>(WIRE_COLORS);

/** Render a rule line, inlining a color swatch before any color word. */
function RuleText({ text }: { text: string }) {
  const parts = text.split(/(\b\w+\b)/);
  return (
    <span className="text-sm leading-relaxed text-fg">
      {parts.map((part, i) => {
        const key = part.toLowerCase();
        if (COLOR_SET.has(key)) {
          return (
            <Fragment key={i}>
              <span
                className="mx-0.5 inline-block h-2.5 w-2.5 translate-y-px rounded-full align-baseline ring-1 ring-hairline"
                style={{ backgroundColor: WIRE_HEX[key as WireColor] }}
              />
              {part}
            </Fragment>
          );
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </span>
  );
}

/** Advisor: the wire rulebook. Reads top to bottom; first match wins. */
export function WiresB({ view }: PuzzleViewProps<WiresViewB, WiresAction>) {
  return (
    <PuzzlePanel
      eyebrow="Field manual"
      right={<span className="label-mono">{view.wireCount} wires</span>}
    >
      <PartnerStrip />
      <ol className="flex flex-col gap-2">
        {view.rules.map((rule, i) => (
          <li
            key={i}
            className="flex gap-3 rounded-(--radius-card) bg-surface-1 p-3 hairline"
          >
            <span className="font-mono text-sm text-accent">
              {String(i + 1).padStart(2, "0")}
            </span>
            <RuleText text={rule.text} />
          </li>
        ))}
      </ol>
      <p className="text-xs text-faint">
        Read each rule in order. The first rule that matches your partner&apos;s wires decides the cut.
      </p>
    </PuzzlePanel>
  );
}
