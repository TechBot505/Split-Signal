/** International morse chart (letters only). Shared with B as the reference chart. */
export const MORSE: Record<string, string> = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.",
  G: "--.", H: "....", I: "..", J: ".---", K: "-.-", L: ".-..",
  M: "--", N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.",
  S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-",
  Y: "-.--", Z: "--..",
};

/**
 * Word families that share prefixes (decoys) so B can't guess without A's blinks.
 * All words are 4-6 letters and avoid the timing tokens (dot/dash/gap/wordgap)
 * and the speed words (slow/medium/fast) as substrings, keeping leak checks clean.
 */
export const WORD_FAMILIES: string[][] = [
  ["shell", "shelf", "sheet", "sheep"],
  ["plant", "plane", "place", "plate"],
  ["brave", "bread", "break", "brake"],
  ["stone", "store", "stork", "storm"],
  ["crane", "crate", "craze", "cramp"],
  ["flame", "flare", "flesh", "flint"],
];
