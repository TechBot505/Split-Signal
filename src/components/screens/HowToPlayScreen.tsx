"use client";

import { BookOpen, Lightbulb, Timer, Wrench, Zap } from "lucide-react";
import { Card, Chip, Divider } from "@/components/ui";
import { FaqAccordion } from "./how-to/FaqAccordion";
import { FAQS, PUZZLES, STEPS, TIPS } from "./how-to/data";

function SectionLabel({ children }: { children: string }) {
  return <h2 className="label-mono mb-3 mt-2 text-muted">{children}</h2>;
}

/** The full "how to play" explainer. Rendered under a PageTitle by the route. */
export function HowToPlayScreen() {
  return (
    <div className="flex flex-col gap-6">
      <Card className="scanline overflow-hidden">
        <p className="text-xl text-display leading-snug">
          Two phones. <span className="text-accent">One escape.</span>
        </p>
        <p className="mt-2 text-sm text-muted">
          Split Signal is a co-op escape game. Each phone sees half of every puzzle — the
          only way out is to talk.
        </p>
      </Card>

      <section>
        <SectionLabel>The loop</SectionLabel>
        <ol className="grid grid-cols-2 gap-3">
          {STEPS.map(({ Icon, title, body }, i) => (
            <Card key={title} inset className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-(--radius-input) bg-surface-2 text-accent">
                  <span className="h-5 w-5">
                    <Icon />
                  </span>
                </span>
                <span className="label-mono">Step {i + 1}</span>
              </div>
              <span className="text-sm font-medium text-fg">{title}</span>
              <span className="text-xs text-muted">{body}</span>
            </Card>
          ))}
        </ol>
      </section>

      <section>
        <SectionLabel>Roles swap every stage</SectionLabel>
        <div className="grid grid-cols-2 gap-3">
          <Card inset className="flex flex-col gap-1.5">
            <Wrench size={18} className="text-accent" aria-hidden />
            <span className="text-sm font-medium text-fg">Operator</span>
            <span className="text-xs text-muted">Acts on the device — cuts, presses, tunes.</span>
          </Card>
          <Card inset className="flex flex-col gap-1.5">
            <BookOpen size={18} className="text-accent" aria-hidden />
            <span className="text-sm font-medium text-fg">Advisor</span>
            <span className="text-xs text-muted">Reads the manual and calls the moves.</span>
          </Card>
        </div>
      </section>

      <section>
        <SectionLabel>Reading the HUD</SectionLabel>
        <Card className="flex flex-col gap-3">
          <LegendRow icon={<Timer size={16} />} label="Timer" value="Shared countdown for the whole run" />
          <Divider />
          <LegendRow icon={<Zap size={16} />} label="3 strikes" value="Wrong answer = strike, −15s" tone="fail" />
          <Divider />
          <LegendRow icon={<Lightbulb size={16} />} label="2 hints" value="Reveals a clue to both, −30s" tone="warn" />
        </Card>
      </section>

      <section>
        <SectionLabel>The 12 puzzles</SectionLabel>
        <div className="flex flex-col gap-2">
          {PUZZLES.map((p) => (
            <Card key={p.name} inset className="flex flex-col gap-1">
              <span className="text-sm font-medium text-fg">{p.name}</span>
              <p className="text-xs text-muted">
                <span className="text-accent">A</span> {p.a}
              </p>
              <p className="text-xs text-muted">
                <span className="text-accent">B</span> {p.b}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <SectionLabel>Field tips</SectionLabel>
        <div className="flex flex-col gap-2">
          {TIPS.map((tip) => (
            <div key={tip} className="flex items-start gap-2 text-sm text-muted">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
              {tip}
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionLabel>FAQ</SectionLabel>
        <FaqAccordion items={FAQS} />
      </section>
    </div>
  );
}

function LegendRow({
  icon,
  label,
  value,
  tone = "neutral",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: "neutral" | "warn" | "fail";
}) {
  return (
    <div className="flex items-center gap-3">
      <Chip tone={tone} size="sm" icon={icon}>
        {label}
      </Chip>
      <span className="text-xs text-muted">{value}</span>
    </div>
  );
}
