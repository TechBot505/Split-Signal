"use client";

import { useEffect } from "react";
import { usePrefs } from "@/lib/prefs";
import { useHistoryStore } from "@/lib/store/history";
import { useProfileStore } from "@/lib/store/profile";

/**
 * Rehydrates every persisted store from localStorage AFTER mount. The stores use
 * `skipHydration`, so the server-rendered HTML and the client's first render both
 * see the initial (empty) state — eliminating the text/attribute mismatch that
 * synchronous localStorage rehydration would otherwise trigger during hydration.
 */
export function StoreHydrator() {
  useEffect(() => {
    useProfileStore.persist.rehydrate();
    useHistoryStore.persist.rehydrate();
    usePrefs.persist.rehydrate();
  }, []);
  return null;
}
