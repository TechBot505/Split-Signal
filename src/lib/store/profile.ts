import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import { normalizeAvatar, randomAvatar, type AvatarConfig } from "@/lib/avatar";
import type { Profile } from "./types";

interface ProfileState {
  profile: Profile | null;
  /** Create-or-return the local profile, generating id/token on first use. */
  ensureProfile: () => Profile;
  setName: (name: string) => void;
  setAvatar: (avatar: AvatarConfig) => void;
  /** Set both at once (used by the first-run identity creator). */
  setIdentity: (name: string, avatar: AvatarConfig) => void;
  /** Adopt a cloud profile locally WITHOUT bumping updatedAt (sync, not an edit). */
  adoptFromCloud: (name: string, avatar: AvatarConfig, updatedAt: number) => void;
}

function newProfile(): Profile {
  const now = Date.now();
  return {
    id: nanoid(),
    token: nanoid(21),
    name: "",
    avatar: randomAvatar(),
    createdAt: now,
    updatedAt: now,
  };
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      profile: null,
      ensureProfile: () => {
        const existing = get().profile;
        if (existing) return existing;
        const created = newProfile();
        set({ profile: created });
        return created;
      },
      setName: (name) => {
        const p = get().profile ?? newProfile();
        set({ profile: { ...p, name: name.slice(0, 16), updatedAt: Date.now() } });
      },
      setAvatar: (avatar) => {
        const p = get().profile ?? newProfile();
        set({ profile: { ...p, avatar, updatedAt: Date.now() } });
      },
      setIdentity: (name, avatar) => {
        const p = get().profile ?? newProfile();
        set({ profile: { ...p, name: name.slice(0, 16), avatar, updatedAt: Date.now() } });
      },
      adoptFromCloud: (name, avatar, updatedAt) => {
        const p = get().profile ?? newProfile();
        // Keep local id/token/createdAt; mirror the cloud's updatedAt so a later
        // local edit (newer timestamp) still wins the next sync.
        set({ profile: { ...p, name: name.slice(0, 16), avatar, updatedAt } });
      },
    }),
    {
      name: "ss:profile",
      skipHydration: true,
      // Repair avatar shape on rehydrate so old/partial blobs stay valid.
      merge: (persisted, current) => {
        const p = (persisted as { profile?: Profile } | undefined)?.profile;
        return {
          ...current,
          profile: p ? { ...p, avatar: normalizeAvatar(p.avatar) } : null,
        };
      },
    },
  ),
);
