import type { ReactNode } from "react";
import { AppShell } from "@/components/shell";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[480px] px-4 pt-6 pb-[max(24px,env(safe-area-inset-bottom))]">
        {children}
      </div>
    </AppShell>
  );
}
