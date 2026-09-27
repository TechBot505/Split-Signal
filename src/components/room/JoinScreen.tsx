"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProfileStore } from "@/lib/store/profile";
import { IdentityGate } from "./IdentityGate";

export interface JoinScreenProps {
  code: string;
}

/**
 * Invite-link landing. With a saved identity we redirect straight into the
 * room; otherwise we collect a call-sign first, then continue.
 */
export function JoinScreen({ code }: JoinScreenProps) {
  const router = useRouter();
  const profile = useProfileStore((s) => s.profile);
  const hasIdentity = !!profile && profile.name.trim().length > 0;

  useEffect(() => {
    if (hasIdentity) router.replace(`/room/${code}`);
  }, [hasIdentity, code, router]);

  if (hasIdentity) return null;
  return <IdentityGate onReady={() => router.replace(`/room/${code}`)} />;
}
