"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Dice5, Radio } from "lucide-react";
import { AvatarBuilder } from "@/components/avatar";
import { Wordmark } from "@/components/shell";
import { Button, Input, Spinner } from "@/components/ui";
import { randomAvatar, type AvatarConfig } from "@/lib/avatar";
import { randomCallsign } from "@/lib/callsign";
import { useProfileStore } from "@/lib/store/profile";
import { useStoreHydrated } from "@/lib/store/useStoreHydrated";

function FullScreenSpinner() {
  return (
    <main className="grid min-h-dvh place-items-center">
      <Spinner size={28} label="Loading" className="text-accent" />
    </main>
  );
}

/** Where to go once identity is set: honour ?next, then ?code, else the hub. */
function destination(params: URLSearchParams): string {
  const next = params.get("next");
  if (next && next.startsWith("/")) return next;
  const code = params.get("code");
  return code ? `/play?code=${encodeURIComponent(code)}` : "/play";
}

function IdentityCreator() {
  const router = useRouter();
  const params = useSearchParams();
  const profile = useProfileStore((s) => s.profile);
  const setIdentity = useProfileStore((s) => s.setIdentity);
  const hydrated = useStoreHydrated();

  const [checked, setChecked] = useState(false);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<AvatarConfig>(() => randomAvatar("station"));
  const dest = useMemo(() => destination(new URLSearchParams(params.toString())), [params]);

  // No-flash gate: wait for rehydration, then either send returning operators
  // straight to the hub or reveal the creator (with a freshly random avatar).
  useEffect(() => {
    if (!hydrated) return;
    if (profile && profile.name.trim().length > 0) {
      router.replace(dest);
    } else {
      setAvatar(randomAvatar());
      setChecked(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  if (!checked) return <FullScreenSpinner />;

  const trimmed = name.trim();
  const valid = trimmed.length >= 1 && trimmed.length <= 16;

  const enter = () => {
    if (!valid) return;
    setIdentity(trimmed, avatar);
    router.replace(dest);
  };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col px-5 pt-[max(24px,env(safe-area-inset-top))]">
      <div className="flex flex-1 flex-col gap-6 pb-28">
        <header className="flex flex-col items-center gap-3 pt-4 text-center">
          <Wordmark className="text-2xl" />
          <span className="label-mono text-accent">Choose your call-sign</span>
        </header>

        <AvatarBuilder value={avatar} onChange={setAvatar} />

        <div className="flex flex-col gap-2">
          <Input
            label="Call sign"
            name="callsign"
            value={name}
            maxLength={16}
            leftIcon={<Radio size={16} />}
            placeholder="Echo Fox"
            autoComplete="off"
            onChange={(e) => setName(e.target.value.slice(0, 16))}
            onKeyDown={(e) => e.key === "Enter" && enter()}
            hint={`${trimmed.length}/16`}
          />
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Dice5 size={15} />}
            onClick={() => setName(randomCallsign())}
            className="self-start"
          >
            Surprise me
          </Button>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-hairline bg-canvas/85 backdrop-blur-md">
        <div className="mx-auto w-full max-w-[480px] px-5 pb-[max(16px,env(safe-area-inset-bottom))] pt-3">
          <Button fullWidth size="lg" disabled={!valid} onClick={enter}>
            Enter
          </Button>
        </div>
      </div>
    </main>
  );
}

export default function IdentityPage() {
  return (
    <Suspense fallback={<FullScreenSpinner />}>
      <IdentityCreator />
    </Suspense>
  );
}
