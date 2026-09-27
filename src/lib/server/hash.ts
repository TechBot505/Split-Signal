/**
 * Hashing helpers shared by the claim flow. Kept dependency-free and pure so they
 * can be unit-tested and reused. Uses Node's crypto (routes run on nodejs runtime).
 */
import { createHash } from "node:crypto";

/** Lowercase hex sha256 of a single token. Matches the worker's tokenHash. */
export function sha256Hex(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

/** Hash a batch of tokens, de-duplicating so repeated tokens are hashed once. */
export function hashTokens(tokens: string[]): string[] {
  return [...new Set(tokens)].map(sha256Hex);
}
