import type { WireColor } from "@/game/puzzles/wires/types";

/** Wire body colors (glossy strokes) and the stripe overlay tuned for contrast. */
export const WIRE_HEX: Record<WireColor, string> = {
  red: "#E5484D",
  blue: "#4C86FF",
  yellow: "#FFC53D",
  green: "#46C46A",
  white: "#E6EDF3",
  black: "#3A414B",
};

/** Stripe color painted over the body — dark on light wires, light on dark. */
export const STRIPE_HEX: Record<WireColor, string> = {
  red: "rgba(255,255,255,0.65)",
  blue: "rgba(255,255,255,0.65)",
  yellow: "rgba(0,0,0,0.45)",
  green: "rgba(255,255,255,0.6)",
  white: "rgba(0,0,0,0.4)",
  black: "rgba(255,255,255,0.55)",
};

/** Human label for a color (capitalized). */
export function colorLabel(c: WireColor): string {
  return c.charAt(0).toUpperCase() + c.slice(1);
}
