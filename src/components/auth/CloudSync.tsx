"use client";

import { useEffect, useRef, type JSX } from "react";
import { useAuth } from "@clerk/nextjs";
import { normalizeAvatar, type AvatarConfig } from "@/lib/avatar";
import { useProfileStore } from "@/lib/store/profile";

/**
 * Event dispatched on `window` after a cloud sync completes so history views can
 * refetch. Screens (built separately) listen for this instead of importing this
 * module, keeping the plumbing decoupled.
 */
export const HISTORY_REFRESH_EVENT = "ss:history-refresh";

interface CloudProfile {
  name: string;
  avatar: unknown;
  updatedAt: string;
}

/**
 * One-shot per-session cloud sync for signed-in users. Mounted ONLY when auth is
 * enabled (inside ClerkProvider). It:
 *   (a) reconciles the local profile with the cloud copy (newer edit wins),
 *   (b) claims the local guest seat token so past runs attach to the account,
 *   (c) asks history views to refresh.
 *
 * Every request is best-effort: 401/503/offline failures are swallowed so guest
 * play (and a freshly signed-in session with the DB disabled) never breaks.
 */
export function CloudSync(): JSX.Element | null {
  const { isLoaded, isSignedIn } = useAuth();
  const done = useRef(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || done.current) return;
    done.current = true;
    void runSync();
  }, [isLoaded, isSignedIn]);

  return null;
}

async function runSync(): Promise<void> {
  await syncProfile();
  await claimSeats();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(HISTORY_REFRESH_EVENT));
  }
}

/** (a) Adopt the cloud profile locally, or push the local one up — newer wins. */
async function syncProfile(): Promise<void> {
  const local = useProfileStore.getState().profile;
  try {
    const res = await fetch("/api/profile");
    if (!res.ok) return; // 401/503 → nothing to sync
    const body = (await res.json()) as { data?: { profile?: CloudProfile | null } };
    const cloud = body.data?.profile ?? null;

    if (cloud) {
      const cloudUpdated = Date.parse(cloud.updatedAt) || 0;
      const localUpdated = local?.updatedAt ?? 0;
      if (local && localUpdated > cloudUpdated) {
        await putProfile(local.name, local.avatar);
      } else {
        useProfileStore
          .getState()
          .adoptFromCloud(cloud.name, normalizeAvatar(cloud.avatar), cloudUpdated);
      }
      return;
    }

    // No cloud profile yet: seed it from the local one (if the user has a name).
    if (local && local.name.trim().length > 0) {
      await putProfile(local.name, local.avatar);
    }
  } catch {
    /* best-effort */
  }
}

async function putProfile(name: string, avatar: AvatarConfig): Promise<void> {
  await fetch("/api/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, avatar }),
  }).catch(() => undefined);
}

/** (b) Attach previously-played guest seats to this account. */
async function claimSeats(): Promise<void> {
  const token = useProfileStore.getState().profile?.token;
  if (!token) return;
  await fetch("/api/history/claim", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tokens: [token] }),
  }).catch(() => undefined);
}
