import type { SeqColor } from "@/game/puzzles/sequence/types";

/** Lamp/button colors for the four signal channels. */
export const SEQ_HEX: Record<SeqColor, string> = {
  red: "#E5484D",
  green: "#46C46A",
  blue: "#4C86FF",
  yellow: "#FFC53D",
};

export function seqLabel(c: SeqColor): string {
  return c.charAt(0).toUpperCase() + c.slice(1);
}
