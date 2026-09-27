"use client";

import { prefsSnapshot } from "@/lib/prefs";

/**
 * Tiny WebAudio synth for mission-control feedback. All sounds are generated in
 * code (no assets). Lazily creates a single AudioContext on first play (after a
 * user gesture, per browser autoplay policy) and no-ops when sound is muted or
 * WebAudio is unavailable (SSR / older browsers).
 */
export type SoundName =
  | "tick"
  | "click"
  | "solve"
  | "strike"
  | "signal"
  | "escape"
  | "fail";

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/** One shaped oscillator note with an exponential decay envelope. */
function note(
  ac: AudioContext,
  freq: number,
  start: number,
  dur: number,
  type: OscillatorType,
  gain: number,
): void {
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(gain, start + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(g).connect(ac.destination);
  osc.start(start);
  osc.stop(start + dur + 0.02);
}

/** Play a named sound. Silent when muted or unsupported. */
export function playSound(name: SoundName): void {
  if (!prefsSnapshot().sound) return;
  const ac = audio();
  if (!ac) return;
  const t = ac.currentTime;
  switch (name) {
    case "tick":
      note(ac, 880, t, 0.05, "square", 0.05);
      break;
    case "click":
      note(ac, 520, t, 0.06, "triangle", 0.08);
      break;
    case "solve":
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => note(ac, f, t + i * 0.08, 0.22, "triangle", 0.12));
      break;
    case "strike":
      note(ac, 130.81, t, 0.32, "sawtooth", 0.16);
      note(ac, 98, t + 0.04, 0.34, "sawtooth", 0.12);
      break;
    case "signal":
      note(ac, 1318.51, t, 0.09, "sine", 0.1);
      note(ac, 1760, t + 0.06, 0.09, "sine", 0.08);
      break;
    case "escape":
      [523.25, 659.25, 783.99, 1046.5, 1318.51].forEach((f, i) =>
        note(ac, f, t + i * 0.1, 0.5, "triangle", 0.14),
      );
      break;
    case "fail":
      note(ac, 146.83, t, 0.9, "sawtooth", 0.16);
      note(ac, 110, t + 0.05, 1.0, "sine", 0.12);
      break;
  }
}
