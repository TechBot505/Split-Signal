"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CodeInput } from "@/components/ui";

/** Inline join-by-code card. Navigates to /room/CODE once 4 letters are entered. */
export function JoinCard({ initialCode = "" }: { initialCode?: string }) {
  const router = useRouter();
  const [code, setCode] = useState(initialCode.toUpperCase().slice(0, 4));

  const join = (value: string) => {
    if (value.length === 4) router.push(`/room/${value}`);
  };

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        <span className="label-mono text-muted">Join with code</span>
        <span className="text-xs text-faint">Enter the 4-letter code your partner shared.</span>
      </div>
      <CodeInput
        value={code}
        onChange={setCode}
        onComplete={join}
        ariaLabel="Room code to join"
        className="justify-center"
      />
    </Card>
  );
}
