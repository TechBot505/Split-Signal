import type { Metadata } from "next";
import { PageTitle } from "@/components/shell";
import { HistoryScreen } from "@/components/screens/history/HistoryScreen";

export const metadata: Metadata = { title: "History — Split Signal" };

export default function HistoryPage() {
  return (
    <>
      <PageTitle eyebrow="Archive" title="History" />
      <HistoryScreen />
    </>
  );
}
