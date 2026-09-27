/**
 * Radio-style call-sign generator, e.g. "Echo Fox", "Night Relay", "Static Owl".
 * Two words, space-separated, always ≤ 16 chars so it fits the profile name cap.
 */

const HEADS = [
  "Echo",
  "Night",
  "Static",
  "Delta",
  "Ghost",
  "Iron",
  "Solar",
  "Amber",
  "Radar",
  "Silent",
  "Nova",
  "Cobalt",
  "Rogue",
  "Lunar",
  "Quiet",
] as const;

const TAILS = [
  "Fox",
  "Relay",
  "Owl",
  "Wolf",
  "Signal",
  "Falcon",
  "Vector",
  "Raven",
  "Comet",
  "Lynx",
  "Beacon",
  "Otter",
  "Pilot",
  "Wren",
  "Drift",
] as const;

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Generate a random two-word call-sign (guaranteed 1–16 chars). */
export function randomCallsign(): string {
  const name = `${pick(HEADS)} ${pick(TAILS)}`;
  return name.length <= 16 ? name : pick(HEADS);
}
