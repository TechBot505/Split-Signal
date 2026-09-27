/**
 * Next.js middleware.
 *
 * When BOTH Clerk keys are present (non-empty) we run clerkMiddleware so `auth()`
 * works in route handlers. With auth disabled (the zero-env default) we export a
 * no-op pass-through, so guest play needs no configuration at all.
 *
 * clerkMiddleware here does NOT protect any routes — every page is public and the
 * game works signed-out. Individual API routes enforce auth themselves via
 * getUserId(). Clerk is required only so signed-in requests carry their session.
 */
import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Treat empty strings as unset — guest play must work with zero env.
const authEnabled =
  !!(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "") && !!(process.env.CLERK_SECRET_KEY || "");

export default authEnabled ? clerkMiddleware() : () => NextResponse.next();

export const config = {
  matcher: [
    // Run on everything except Next internals, static assets, and PWA files
    // (service worker, manifest, icons) which must never hit auth.
    "/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.webmanifest|manifest.json|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|json|txt)$).*)",
  ],
};
