"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Prefs } from "@/lib/store/types";

/**
 * Sound + haptic preferences (default ON), persisted to `ss:prefs`. Kept as its
 * own tiny store so `sound.ts` / `haptics.ts` and the room mute control all read
 * one source of truth and re-render on change.
 */
interface PrefsState extends Prefs {
  setSound: (on: boolean) => void;
  setHaptics: (on: boolean) => void;
  toggleSound: () => void;
}

export const usePrefs = create<PrefsState>()(
  persist(
    (set, get) => ({
      sound: true,
      haptics: true,
      setSound: (sound) => set({ sound }),
      setHaptics: (haptics) => set({ haptics }),
      toggleSound: () => set({ sound: !get().sound }),
    }),
    { name: "ss:prefs", skipHydration: true },
  ),
);

/** Non-reactive snapshot read — safe to call from imperative code (sound/haptics). */
export const prefsSnapshot = (): Prefs => {
  const s = usePrefs.getState();
  return { sound: s.sound, haptics: s.haptics };
};
