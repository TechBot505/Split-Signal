/**
 * Room codes: 4 letters drawn from an unambiguous alphabet (no I or O, which
 * read as 1/0). Deterministic given an injected Rng so the same seed always
 * produces the same code on server, client and tests.
 */
import type { Rng } from "./rng";

/** 24 letters — the full A–Z minus I and O. */
export const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ";
export const CODE_LENGTH = 4;

/** Generate a fresh 4-letter room code from an injected Rng. */
export function generate(rng: Rng): string {
  let out = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    out += CODE_ALPHABET[rng.int(0, CODE_ALPHABET.length - 1)];
  }
  return out;
}

/** True when `code` is exactly 4 uppercase letters from the code alphabet. */
export function isValid(code: string): boolean {
  if (code.length !== CODE_LENGTH) return false;
  for (const ch of code) {
    if (!CODE_ALPHABET.includes(ch)) return false;
  }
  return true;
}
