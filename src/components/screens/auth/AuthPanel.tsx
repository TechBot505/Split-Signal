"use client";

import Link from "next/link";
import { SignIn, SignUp } from "@clerk/nextjs";
import { Wordmark } from "@/components/shell";
import { Card } from "@/components/ui";
import { isAuthEnabledClient } from "@/lib/env";

/** Clerk appearance mapped to the Split Signal design tokens. */
const appearance = {
  variables: {
    colorPrimary: "#3CF2D6",
    colorBackground: "#0E1217",
    colorText: "#EAF2F7",
    borderRadius: "10px",
    fontFamily: "var(--font-space-grotesk), ui-sans-serif, system-ui, sans-serif",
  },
} as const;

export interface AuthPanelProps {
  mode: "sign-in" | "sign-up";
}

/** Centered auth screen. Renders Clerk when enabled, else a guest-friendly note. */
export function AuthPanel({ mode }: AuthPanelProps) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col items-center justify-center gap-6 px-5 pt-[env(safe-area-inset-top)]">
      <Link href="/play" aria-label="Split Signal home">
        <Wordmark className="text-2xl" />
      </Link>

      {isAuthEnabledClient ? (
        mode === "sign-in" ? (
          <SignIn appearance={appearance} signUpUrl="/sign-up" fallbackRedirectUrl="/play" />
        ) : (
          <SignUp appearance={appearance} signInUrl="/sign-in" fallbackRedirectUrl="/play" />
        )
      ) : (
        <Card className="w-full text-center">
          <p className="text-sm text-fg">Accounts aren&apos;t enabled yet.</p>
          <p className="mt-1 text-xs text-muted">
            You can play as a guest — runs are saved on this device.
          </p>
          <Link
            href="/play"
            className="mt-4 inline-flex min-h-11 items-center rounded-(--radius-input) bg-accent px-4 text-sm font-semibold text-accent-fg glow-accent"
          >
            Continue as guest
          </Link>
        </Card>
      )}
    </main>
  );
}
