/**
 * Deterministic seeded randomness shared by every puzzle generator and the engine.
 * Same seed string => same sequence on server, client and tests.
 */

/** FNV-1a 32-bit hash of a string → unsigned int seed. */
export function hashSeed(seed: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export interface Rng {
  /** Float in [0, 1). */
  next(): number;
  /** Integer in [min, max] inclusive. */
  int(min: number, max: number): number;
  /** Random element (array must be non-empty). */
  pick<T>(items: readonly T[]): T;
  /** New shuffled copy (Fisher–Yates). */
  shuffle<T>(items: readonly T[]): T[];
  /** `count` distinct elements from `items` (count ≤ length). */
  sample<T>(items: readonly T[], count: number): T[];
  /** true with probability p. */
  chance(p: number): boolean;
}

/** mulberry32 PRNG seeded from a string. Namespaces keep sub-streams independent: rng(seed, "wires"). */
export function createRng(seed: string, ...namespace: string[]): Rng {
  let a = hashSeed([seed, ...namespace].join("|"));
  const next = (): number => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (min: number, max: number): number => min + Math.floor(next() * (max - min + 1));
  const shuffle = <T>(items: readonly T[]): T[] => {
    const out = [...items];
    for (let i = out.length - 1; i > 0; i--) {
      const j = int(0, i);
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  };
  return {
    next,
    int,
    pick: <T>(items: readonly T[]): T => items[int(0, items.length - 1)],
    shuffle,
    sample: <T>(items: readonly T[], count: number): T[] => shuffle(items).slice(0, count),
    chance: (p: number): boolean => next() < p,
  };
}
