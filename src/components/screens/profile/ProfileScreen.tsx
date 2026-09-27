"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Volume2, Vibrate } from "lucide-react";
import { PageTitle } from "@/components/shell";
import { Avatar } from "@/components/avatar";
import { Button, Card, ModalCard, Spinner, Toggle } from "@/components/ui";
import { normalizeAvatar, type AvatarConfig } from "@/lib/avatar";
import { useProfileStore } from "@/lib/store/profile";
import { useHistoryStore } from "@/lib/store/history";
import { usePrefsStore } from "@/lib/store/prefs";
import { useStoreHydrated } from "@/lib/store/useStoreHydrated";
import { EditIdentitySheet } from "./EditIdentitySheet";
import { ProfileStats } from "./ProfileStats";
import { AccountSection } from "./AccountSection";

export function ProfileScreen() {
  const router = useRouter();
  const profile = useProfileStore((s) => s.profile);
  const setIdentity = useProfileStore((s) => s.setIdentity);
  const prefs = usePrefsStore();
  const hydrated = useStoreHydrated();

  const [editing, setEditing] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    if (hydrated && (!profile || profile.name.trim().length === 0)) router.replace("/");
  }, [hydrated, profile, router]);

  if (!hydrated || !profile || profile.name.trim().length === 0) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <Spinner size={26} className="text-accent" />
      </div>
    );
  }

  const avatar: AvatarConfig = normalizeAvatar(profile.avatar);

  const reset = () => {
    useProfileStore.setState({ profile: null });
    useHistoryStore.getState().clear();
    router.replace("/");
  };

  return (
    <>
      <PageTitle eyebrow="Operator" title="Profile" />

      <div className="flex flex-col gap-4">
        <Card className="flex items-center gap-4">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-(--radius-card) bg-surface-2 hairline">
            <Avatar config={avatar} size={52} title="Your avatar" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="label-mono">Call sign</span>
            <p className="truncate text-lg text-display text-fg">{profile.name}</p>
          </div>
          <Button variant="secondary" size="sm" leftIcon={<Pencil size={14} />} onClick={() => setEditing(true)}>
            Edit
          </Button>
        </Card>

        <ProfileStats />

        <section className="flex flex-col gap-2">
          <span className="label-mono px-1">Preferences</span>
          <Card className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-fg">
                <Volume2 size={16} className="text-muted" aria-hidden /> Sound
              </span>
              <Toggle checked={prefs.sound} onChange={prefs.setSound} label="Sound" />
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-fg">
                <Vibrate size={16} className="text-muted" aria-hidden /> Haptics
              </span>
              <Toggle checked={prefs.haptics} onChange={prefs.setHaptics} label="Haptics" />
            </div>
          </Card>
        </section>

        <section className="flex flex-col gap-2">
          <span className="label-mono px-1">Account</span>
          <AccountSection />
        </section>

        <Button variant="danger-outline" fullWidth onClick={() => setConfirmReset(true)}>
          Reset profile
        </Button>
      </div>

      <EditIdentitySheet
        open={editing}
        onClose={() => setEditing(false)}
        initialName={profile.name}
        initialAvatar={avatar}
        onSave={setIdentity}
      />

      <ModalCard
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        tone="fail"
        title="Reset profile?"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setConfirmReset(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={reset}>
              Reset
            </Button>
          </>
        }
      >
        This clears your call-sign, avatar, and local run history on this device. This can&apos;t be
        undone.
      </ModalCard>
    </>
  );
}
