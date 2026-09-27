"use client";

import { useEffect, type JSX } from "react";
import { useAuth } from "@clerk/nextjs";
import { useAuthStore } from "@/lib/store/auth";

/**
 * Mirrors Clerk's `useAuth()` session state into the provider-free `useAuthStore`
 * so guest-safe hooks can gate cloud fetches without calling Clerk hooks outside a
 * `<ClerkProvider>`.
 *
 * Mounted ONLY inside `<ClerkProvider>` (see providers.tsx), where `useAuth()` is
 * valid. Renders nothing.
 */
export function AuthBridge(): JSX.Element | null {
  const { isLoaded, isSignedIn, userId } = useAuth();

  useEffect(() => {
    useAuthStore.getState().setAuth(isLoaded, Boolean(isSignedIn), userId ?? null);
  }, [isLoaded, isSignedIn, userId]);

  return null;
}
