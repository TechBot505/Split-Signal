import type { Metadata } from "next";
import { PageTitle } from "@/components/shell";
import { HowToPlayScreen } from "@/components/screens/HowToPlayScreen";

export const metadata: Metadata = { title: "How to play — Split Signal" };

export default function HowToPlayPage() {
  return (
    <>
      <PageTitle eyebrow="Briefing" title="How to play" />
      <HowToPlayScreen />
    </>
  );
}
