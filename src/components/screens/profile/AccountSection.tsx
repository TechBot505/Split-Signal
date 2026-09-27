"use client";

import { SignInButton, UserButton } from "@clerk/nextjs";
import { Card } from "@/components/ui";
import { isAuthEnabledClient } from "@/lib/env";
import { useAuthStore } from "@/lib/store/auth";

/**
 * Account controls. Clerk components render ONLY when auth is enabled (a
 * ClerkProvider is mounted). In guest mode we explain that runs stay on-device.
 * `isSignedIn` comes from the provider-free AuthBridge store.
 */
export function AccountSection() {
  const isLoaded = useAuthStore((s) => s.isLoaded);
  const isSignedIn = useAuthStore((s) => s.isSignedIn);

  if (!isAuthEnabledClient) {
    return (
      <Card className="text-sm text-muted">
        Accounts aren&apos;t enabled yet — runs are saved on this device.
      </Card>
    );
  }

  return (
    <Card className="flex items-center justify-between gap-3">
      <div className="flex flex-col">
        <span className="text-sm text-fg">{isSignedIn ? "Signed in" : "Not signed in"}</span>
        <span className="text-xs text-muted">
          {isSignedIn ? "Your runs sync across devices." : "Sign in to sync runs across devices."}
        </span>
      </div>
      {!isLoaded ? null : isSignedIn ? (
        <UserButton />
      ) : (
        <SignInButton mode="modal">
          <button
            type="button"
            className="inline-flex min-h-11 items-center rounded-(--radius-input) bg-accent px-4 text-sm font-semibold text-accent-fg glow-accent"
          >
            Sign in
          </button>
        </SignInButton>
      )}
    </Card>
  );
}
