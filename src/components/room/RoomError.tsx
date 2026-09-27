"use client";

import Link from "next/link";
import { SignalZero } from "lucide-react";
import { Button } from "@/components/ui";

export interface RoomErrorProps {
  code: string;
  message?: string;
}

/** Friendly full-screen error for unrecoverable room states (full/kicked/…). */
const TITLES: Record<string, string> = {
  room_full: "Room is full",
  seat_taken: "Seat already taken",
  not_in_room: "You left this room",
  kicked: "You were disconnected",
};

export function RoomError({ code, message }: RoomErrorProps) {
  const title = TITLES[code] ?? "Signal lost";
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <div className="flex max-w-[360px] flex-col items-center gap-4">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-fail/12 text-fail hairline">
          <SignalZero size={26} aria-hidden />
        </span>
        <span className="label-mono text-fail">Connection error</span>
        <h1 className="text-display text-2xl">{title}</h1>
        <p className="text-sm text-muted">
          {message ?? "This room can't be joined right now. Start a fresh run or head back to base."}
        </p>
        <Link href="/play" className="mt-2">
          <Button variant="secondary">Back to base</Button>
        </Link>
      </div>
    </main>
  );
}
