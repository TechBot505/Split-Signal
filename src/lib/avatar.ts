import { z } from "zod";

/** Operator-avatar option sets (geometric helmet/visor faces). */
export const AVATAR_SHAPES = ["dome", "hex", "round", "wedge"] as const;
export const AVATAR_TONES = [
  "slate",
  "steel",
  "moss",
  "clay",
  "plum",
  "sand",
  "aqua",
  "ash",
] as const;
export const AVATAR_VISORS = ["teal", "amber", "ice", "violet", "lime", "rose"] as const;
export const AVATAR_ANTENNAE = ["none", "single", "dual", "dish"] as const;
export const AVATAR_BADGES = ["none", "alpha", "bravo", "star", "bolt"] as const;

export const avatarSchema = z.object({
  shape: z.enum(AVATAR_SHAPES),
  tone: z.enum(AVATAR_TONES),
  visor: z.enum(AVATAR_VISORS),
  antenna: z.enum(AVATAR_ANTENNAE),
  badge: z.enum(AVATAR_BADGES),
});

export type AvatarConfig = z.infer<typeof avatarSchema>;

/** Muted helmet fills (kept desaturated so the accent stays the only signal). */
export const TONE_COLORS: Record<(typeof AVATAR_TONES)[number], string> = {
  slate: "#3a444f",
  steel: "#4a5561",
  moss: "#3d4a40",
  clay: "#5a473f",
  plum: "#4a3d4f",
  sand: "#5a5244",
  aqua: "#33474b",
  ash: "#2c333a",
};

export const VISOR_COLORS: Record<(typeof AVATAR_VISORS)[number], string> = {
  teal: "#3cf2d6",
  amber: "#ffb547",
  ice: "#8fd0ff",
  violet: "#b79cff",
  lime: "#b8f24a",
  rose: "#ff8fb0",
};

const DEFAULT: AvatarConfig = {
  shape: "dome",
  tone: "steel",
  visor: "teal",
  antenna: "single",
  badge: "none",
};

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Deterministic when a seed is given; random otherwise. */
export function randomAvatar(seed?: string): AvatarConfig {
  let s = seed ? hash(seed) : Math.floor(Math.random() * 0xffffffff);
  const pick = <T,>(arr: readonly T[]): T => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return arr[s % arr.length];
  };
  return {
    shape: pick(AVATAR_SHAPES),
    tone: pick(AVATAR_TONES),
    visor: pick(AVATAR_VISORS),
    antenna: pick(AVATAR_ANTENNAE),
    badge: pick(AVATAR_BADGES),
  };
}

/** Coerce arbitrary/legacy input into a valid config (never throws). */
export function normalizeAvatar(input: unknown): AvatarConfig {
  const parsed = avatarSchema.safeParse(input);
  if (parsed.success) return parsed.data;
  if (input && typeof input === "object") {
    const merged = avatarSchema.safeParse({ ...DEFAULT, ...(input as object) });
    if (merged.success) return merged.data;
  }
  return DEFAULT;
}
