import type { Metadata } from "next";
import { PageTitle } from "@/components/shell";
import { DailyScreen } from "@/components/screens/daily/DailyScreen";

export const metadata: Metadata = { title: "Daily Bunker — Split Signal" };

export default function DailyPage() {
  return (
    <>
      <PageTitle eyebrow="Ranked" title="Daily Bunker" />
      <DailyScreen />
    </>
  );
}
