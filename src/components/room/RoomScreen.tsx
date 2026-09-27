"use client";

import { useProfileStore } from "@/lib/store/profile";
import { IdentityGate } from "./IdentityGate";
import { RoomConnected } from "./RoomConnected";

export interface RoomScreenProps {
  code: string;
}

/**
 * Entry point for /room/[code]. Gates on a local identity: without a saved
 * call-sign we show the inline setup first, then connect. Splitting the
 * connected room into its own component keeps the `useRoom` hook order stable.
 */
export function RoomScreen({ code }: RoomScreenProps) {
  const profile = useProfileStore((s) => s.profile);
  const hasIdentity = !!profile && profile.name.trim().length > 0;

  // `IdentityGate` writes the profile; the store update re-renders us into the room.
  if (!hasIdentity) return <IdentityGate onReady={() => undefined} />;
  return <RoomConnected code={code} />;
}
