import { Check, Hand, HelpCircle, RotateCcw, ThumbsDown, ThumbsUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { MODE_CONFIG } from "@/game/engine";
import type { Mode, SignalKind } from "@/game/types";
import type { Role } from "@/game/puzzles/types";

/** Display metadata per run mode, pairing the label with engine config. */
export const MODES: Mode[] = ["quick", "standard", "hard", "daily"];

export const MODE_LABEL: Record<Mode, string> = {
  quick: "Quick",
  standard: "Standard",
  hard: "Hard",
  daily: "Daily",
};

/** Total run budget for a mode in whole minutes (for briefing copy). */
export function budgetMinutes(mode: Mode): number {
  return Math.round(MODE_CONFIG[mode].budgetMs / 60_000);
}

export function stageCount(mode: Mode): number {
  return MODE_CONFIG[mode].stages;
}

/** Map an engine role to the HUD's operator/advisor vocabulary. */
export function gameRole(role: Role | null): "operator" | "advisor" {
  return role === "B" ? "advisor" : "operator";
}

export interface SignalMeta {
  kind: SignalKind;
  label: string;
  Icon: LucideIcon;
}

/** The six quick signals a player can flash to their partner. */
export const SIGNALS: SignalMeta[] = [
  { kind: "wait", label: "Wait", Icon: Hand },
  { kind: "yes", label: "Yes", Icon: ThumbsUp },
  { kind: "no", label: "No", Icon: ThumbsDown },
  { kind: "repeat", label: "Repeat", Icon: RotateCcw },
  { kind: "gotit", label: "Got it", Icon: Check },
  { kind: "help", label: "Help", Icon: HelpCircle },
];

export const SIGNAL_LABEL: Record<SignalKind, string> = {
  wait: "Wait",
  yes: "Yes",
  no: "No",
  repeat: "Repeat",
  gotit: "Got it",
  help: "Help",
};
