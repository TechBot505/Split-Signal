import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { AuthBridge } from "@/components/auth/AuthBridge";
import { CloudSync } from "@/components/auth/CloudSync";
import { StoreHydrator } from "@/components/shell/StoreHydrator";

/** Treat empty env strings as unset (guest play must work with zero env). */
const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "";

/**
 * Wraps the app in ClerkProvider ONLY when a publishable key is configured.
 * With no auth env the app renders normally for guest play. AuthBridge mirrors the
 * session into a provider-free store and CloudSync reconciles cloud state on
 * sign-in; both live inside the Clerk branch so they never call Clerk hooks
 * without a provider.
 */
export function Providers({ children }: { children: ReactNode }) {
  if (clerkKey) {
    return (
      <ClerkProvider publishableKey={clerkKey}>
        <StoreHydrator />
        <AuthBridge />
        <CloudSync />
        {children}
      </ClerkProvider>
    );
  }
  return (
    <>
      <StoreHydrator />
      {children}
    </>
  );
}
