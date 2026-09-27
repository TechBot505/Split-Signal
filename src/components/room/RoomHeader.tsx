"use client";

import { useRouter } from "next/navigation";
import { LogOut, Volume2, VolumeX } from "lucide-react";
import { useEffect, useState } from "react";
import { Button, IconButton, ModalCard } from "@/components/ui";
import { usePrefs } from "@/lib/prefs";

export interface RoomHeaderProps {
  code: string;
  /** Called before navigating away so the socket can send `leave`. */
  onLeave?: () => void;
}

/** Room top bar: leave (with confirm) · mono room code · mute toggle. */
export function RoomHeader({ code, onLeave }: RoomHeaderProps) {
  const router = useRouter();
  const soundPref = usePrefs((s) => s.sound);
  // Persisted prefs rehydrate on the client; render the default (on) until mounted
  // so the server HTML and first client render match (no hydration warning).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const sound = mounted ? soundPref : true;
  const toggleSound = usePrefs((s) => s.toggleSound);
  const [confirm, setConfirm] = useState(false);

  const leave = () => {
    onLeave?.();
    router.push("/play");
  };

  return (
    <header className="shrink-0 pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex h-14 w-full max-w-[480px] items-center justify-between px-2">
        <IconButton label="Leave room" tone="ghost" onClick={() => setConfirm(true)}>
          <LogOut size={20} />
        </IconButton>
        <span className="font-mono text-lg font-semibold tracking-[0.3em] text-fg" aria-label={`Room code ${code}`}>
          {code}
        </span>
        <IconButton
          label={sound ? "Mute sound" : "Unmute sound"}
          tone="ghost"
          aria-pressed={!sound}
          onClick={toggleSound}
        >
          {sound ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </IconButton>
      </div>

      <ModalCard
        open={confirm}
        onClose={() => setConfirm(false)}
        tone="warn"
        title="Leave the room?"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setConfirm(false)}>
              Stay
            </Button>
            <Button variant="danger" size="sm" onClick={leave}>
              Leave
            </Button>
          </>
        }
      >
        Your partner will be left waiting. You can rejoin with the same code while the room is open.
      </ModalCard>
    </header>
  );
}
