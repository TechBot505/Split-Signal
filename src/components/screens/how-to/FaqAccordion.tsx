"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { Faq } from "./data";

/** Single-open FAQ accordion with reduced-motion-aware expand. */
export function FaqAccordion({ items }: { items: Faq[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const reduce = useReducedMotion();

  return (
    <div className="flex flex-col gap-2">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <Card key={item.q} inset className="overflow-hidden p-0">
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex min-h-11 w-full items-center justify-between gap-3 px-3 py-3 text-left text-sm text-fg"
            >
              <span className="font-medium">{item.q}</span>
              <ChevronDown
                size={18}
                className={cn("shrink-0 text-muted transition-transform", isOpen && "rotate-180")}
                aria-hidden
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={reduce ? undefined : { height: 0, opacity: 0 }}
                  animate={reduce ? undefined : { height: "auto", opacity: 1 }}
                  exit={reduce ? undefined : { height: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 380, damping: 40 }}
                  className="overflow-hidden"
                >
                  <p className="px-3 pb-3 text-sm text-muted">{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        );
      })}
    </div>
  );
}
