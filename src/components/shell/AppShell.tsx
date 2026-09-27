"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { useState, type ReactNode } from "react";
import { IconButton } from "@/components/ui";
import { Toaster } from "@/components/ui/Toast";
import { Avatar } from "@/components/avatar/Avatar";
import { normalizeAvatar, type AvatarConfig } from "@/lib/avatar";
import { Sidebar } from "./Sidebar";
import { Wordmark } from "./Wordmark";

export interface AppShellProps {
  children: ReactNode;
  /** Player avatar shown top-right (links to /profile). */
  avatar?: AvatarConfig | unknown;
}

/** App chrome for non-room pages: sticky top bar + slide-in sidebar. */
export function AppShell({ children, avatar }: AppShellProps) {
  const [navOpen, setNavOpen] = useState(false);
  const config = normalizeAvatar(avatar);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 pt-[env(safe-area-inset-top)] bg-canvas/80 backdrop-blur-md hairline border-x-0 border-t-0">
        <div className="flex h-14 items-center justify-between px-2">
          <IconButton label="Open menu" tone="ghost" onClick={() => setNavOpen(true)}>
            <Menu size={20} />
          </IconButton>
          <Link href="/play" aria-label="Split Signal home">
            <Wordmark />
          </Link>
          <Link
            href="/profile"
            aria-label="Your profile"
            className="grid h-10 w-10 place-items-center rounded-full hairline bg-surface-1"
          >
            <Avatar config={config} size={30} title="Your avatar" />
          </Link>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />
      <Toaster />
    </div>
  );
}
