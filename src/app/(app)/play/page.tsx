import type { Metadata } from "next";
import { Suspense } from "react";
import { Spinner } from "@/components/ui";
import { PlayScreen } from "@/components/screens/play/PlayScreen";

export const metadata: Metadata = { title: "Play — Split Signal" };

export default function PlayPage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-[60vh] place-items-center">
          <Spinner size={26} className="text-accent" />
        </div>
      }
    >
      <PlayScreen />
    </Suspense>
  );
}
