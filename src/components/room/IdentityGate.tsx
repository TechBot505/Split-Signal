"use client";

import { useEffect, useState } from "react";
import { Radio } from "lucide-react";
import { AvatarBuilder } from "@/components/avatar";
import { Button, Card, Input } from "@/components/ui";
import { useProfileStore } from "@/lib/store/profile";
import { normalizeAvatar, randomAvatar, type AvatarConfig } from "@/lib/avatar";

export interface IdentityGateProps {
  /** Called once an identity is committed so the room can (re)connect. */
  onReady: () => void;
}

/**
 * Compact inline call-sign + avatar setup shown when a player reaches a room
 * without a saved profile (e.g. via an invite link). Mirrors the first-run
 * identity screen but stays within the room shell.
 */
export function IdentityGate({ onReady }: IdentityGateProps) {
  const profile = useProfileStore((s) => s.profile);
  const setIdentity = useProfileStore((s) => s.setIdentity);
  const [name, setName] = useState(profile?.name ?? "");
  // Deterministic default for SSR + first client render; a fresh operator gets a
  // random avatar only AFTER mount so server and client markup match (no #418).
  const [avatar, setAvatar] = useState<AvatarConfig>(() => normalizeAvatar(profile?.avatar));
  useEffect(() => {
    if (!profile?.avatar) setAvatar(randomAvatar());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canContinue = name.trim().length > 0;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[420px] flex-col justify-center gap-6 px-4 py-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="label-mono text-accent">Identify yourself</span>
        <h1 className="text-display text-2xl">Set your call sign</h1>
        <p className="text-sm text-muted">Your partner sees this name and avatar in the bunker.</p>
      </div>

      <Card>
        <div className="flex flex-col gap-5">
          <Input
            label="Call sign"
            name="callsign"
            value={name}
            maxLength={16}
            autoComplete="off"
            leftIcon={<Radio size={16} />}
            placeholder="e.g. FOXTROT"
            onChange={(e) => setName(e.target.value)}
          />
          <AvatarBuilder value={avatar} onChange={setAvatar} />
        </div>
      </Card>

      <Button
        size="lg"
        fullWidth
        disabled={!canContinue}
        onClick={() => {
          setIdentity(name.trim(), avatar);
          onReady();
        }}
      >
        Enter the bunker
      </Button>
    </main>
  );
}
