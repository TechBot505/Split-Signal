"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HelpCircle, History, Play, Radar, User } from "lucide-react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import { Wordmark } from "./Wordmark";

const NAV = [
  { href: "/play", label: "Play", Icon: Play },
  { href: "/daily", label: "Daily Bunker", Icon: Radar },
  { href: "/how-to-play", label: "How to play", Icon: HelpCircle },
  { href: "/history", label: "History", Icon: History },
  { href: "/profile", label: "Profile", Icon: User },
] as const;

export interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

/** Left navigation drawer. Closes on Esc, backdrop, and route change; traps focus. */
export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const lastPath = useRef(pathname);

  useEffect(() => {
    if (open && pathname !== lastPath.current) onClose();
    lastPath.current = pathname;
  }, [pathname, open, onClose]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return onClose();
      if (e.key !== "Tab") return;
      const nodes = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href],button:not([disabled])'
      );
      if (!nodes || nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    panelRef.current?.querySelector<HTMLElement>("a[href]")?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 40 }}
            className="absolute inset-y-0 left-0 flex w-[80%] max-w-[300px] flex-col bg-surface-1 hairline pt-[max(16px,env(safe-area-inset-top))]"
          >
            <div className="px-5 pb-4">
              <Wordmark />
            </div>
            <nav className="flex flex-col gap-1 px-3">
              {NAV.map(({ href, label, Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "relative flex min-h-11 items-center gap-3 rounded-(--radius-input) px-3 text-sm transition-colors",
                      active ? "bg-surface-2 text-fg" : "text-muted hover:bg-surface-2 hover:text-fg"
                    )}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-accent" />
                    )}
                    <Icon size={18} aria-hidden />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
