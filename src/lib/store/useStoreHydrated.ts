"use client";

import { useEffect, useState } from "react";
import { useProfileStore } from "./profile";

/**
 * True once the persisted profile store has finished rehydrating from
 * localStorage (stores use `skipHydration`, rehydrated after mount by
 * `<StoreHydrator/>`). Gate navigation decisions on this so we never redirect on
 * a not-yet-loaded profile, and never diverge from server markup during hydration.
 */
export function useStoreHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    if (useProfileStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    return useProfileStore.persist.onFinishHydration(() => setHydrated(true));
  }, []);
  return hydrated;
}
