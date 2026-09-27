"use client";

import { Shuffle } from "lucide-react";
import { useState } from "react";
import { Avatar } from "./Avatar";
import { Button } from "@/components/ui";
import { cn } from "@/lib/cn";
import {
  AVATAR_ANTENNAE,
  AVATAR_BADGES,
  AVATAR_SHAPES,
  AVATAR_TONES,
  AVATAR_VISORS,
  TONE_COLORS,
  VISOR_COLORS,
  normalizeAvatar,
  randomAvatar,
  type AvatarConfig,
} from "@/lib/avatar";

type Field = keyof AvatarConfig;

const TABS: { field: Field; label: string; options: readonly string[]; swatch?: "tone" | "visor" }[] = [
  { field: "shape", label: "Shape", options: AVATAR_SHAPES },
  { field: "tone", label: "Tone", options: AVATAR_TONES, swatch: "tone" },
  { field: "visor", label: "Visor", options: AVATAR_VISORS, swatch: "visor" },
  { field: "antenna", label: "Antenna", options: AVATAR_ANTENNAE },
  { field: "badge", label: "Badge", options: AVATAR_BADGES },
];

export interface AvatarBuilderProps {
  value: AvatarConfig | unknown;
  onChange: (config: AvatarConfig) => void;
  className?: string;
}

/** Editor for operator avatars: preview, dimension tabs, option tiles, shuffle. */
export function AvatarBuilder({ value, onChange, className }: AvatarBuilderProps) {
  const config = normalizeAvatar(value);
  const [tab, setTab] = useState<Field>("shape");
  const active = TABS.find((t) => t.field === tab)!;

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex items-center gap-4">
        <div className="grid h-20 w-20 place-items-center rounded-(--radius-card) bg-surface-1 hairline">
          <Avatar config={config} size={64} />
        </div>
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<Shuffle size={15} />}
          onClick={() => onChange(randomAvatar())}
        >
          Shuffle
        </Button>
      </div>

      <div role="tablist" className="no-scrollbar flex gap-1.5 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.field}
            role="tab"
            type="button"
            aria-selected={t.field === tab}
            onClick={() => setTab(t.field)}
            className={cn(
              "min-h-9 shrink-0 rounded-full px-3 text-xs font-medium transition-colors",
              t.field === tab ? "bg-accent text-accent-fg" : "bg-surface-2 text-muted hairline"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-2">
        {active.options.map((opt) => {
          const selected = config[active.field] === opt;
          return (
            <button
              key={opt}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange({ ...config, [active.field]: opt })}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-1 rounded-(--radius-input) p-2 text-[11px] capitalize transition-colors",
                selected ? "bg-surface-2 text-fg glow-accent" : "bg-surface-1 text-muted hairline hover:bg-surface-2"
              )}
            >
              {active.swatch && (
                <span
                  className="h-5 w-5 rounded-full"
                  style={{
                    background:
                      active.swatch === "tone"
                        ? TONE_COLORS[opt as keyof typeof TONE_COLORS]
                        : VISOR_COLORS[opt as keyof typeof VISOR_COLORS],
                  }}
                />
              )}
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
