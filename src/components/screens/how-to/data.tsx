import type { ComponentType } from "react";
import { ActIcon, EscapeIcon, SplitScreenIcon, TalkIcon } from "./illustrations";

export interface Step {
  Icon: ComponentType;
  title: string;
  body: string;
}

export const STEPS: Step[] = [
  { Icon: SplitScreenIcon, title: "Split the signal", body: "Each phone shows only half of every puzzle." },
  { Icon: TalkIcon, title: "Talk it out", body: "Describe exactly what you see — out loud." },
  { Icon: ActIcon, title: "Operate & advise", body: "One acts, one reads the manual. Roles swap each stage." },
  { Icon: EscapeIcon, title: "Escape", body: "Clear every stage before the timer or 3 strikes end you." },
];

export interface PuzzleInfo {
  name: string;
  a: string;
  b: string;
}

/** One compact card per v1 puzzle type: what each role sees. */
export const PUZZLES: PuzzleInfo[] = [
  { name: "Wires", a: "Cuts one of several colored wires.", b: "Holds the conditional rulebook." },
  { name: "Keypad", a: "Presses four symbols in order.", b: "Reads the columns that fix the order." },
  { name: "Dials", a: "Rotates three dials and locks in.", b: "Reads target orientations as clock/compass." },
  { name: "Cipher", a: "Enters the decoded five-letter word.", b: "Holds the cipher key and word list." },
  { name: "Maze", a: "Moves blind, one step at a time.", b: "Sees the full map, walls and exit." },
  { name: "Sequence", a: "Repeats the flashing light sequence.", b: "Holds the color-to-button table." },
  { name: "Gauges", a: "Sets levers to hit target bands.", b: "Reads the gauge formulas and targets." },
  { name: "Grid", a: "Places items with half the clues.", b: "Holds the other half of the clues." },
  { name: "Frequency", a: "Tunes the waveform slider.", b: "Confirms the lock against the target." },
  { name: "Switches", a: "Flips switches to light the LEDs.", b: "Reads the truth table for the pattern." },
  { name: "Morse", a: "Watches the blinking light.", b: "Decodes morse, enters the frequency." },
  { name: "Vault", a: "Types the four-digit code, solves 1–2.", b: "Solves riddles for digits 3–4." },
];

export const TIPS: string[] = [
  "Never show your screen — describe it instead.",
  "Advisor: read the rules top to bottom, in order.",
  "Use Signals to ping your partner when it's noisy.",
];

export interface Faq {
  q: string;
  a: string;
}

export const FAQS: Faq[] = [
  { q: "Do we need to be in the same room?", a: "No — any voice or video call works. You just need to talk." },
  { q: "What happens on a wrong answer?", a: "It costs a strike and 15 seconds. Three strikes ends the run." },
  { q: "How do hints work?", a: "Two per run. A hint reveals a clue to both players and costs 30 seconds." },
  { q: "What is the Daily Bunker?", a: "One shared Standard bunker per UTC day, ranked by time remaining." },
  { q: "Do I need an account?", a: "No. Guest runs are saved on this device; sign in to sync across devices." },
];
