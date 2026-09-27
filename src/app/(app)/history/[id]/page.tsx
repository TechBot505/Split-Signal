import type { Metadata } from "next";
import { RunDetailScreen } from "@/components/screens/history/RunDetailScreen";

export const metadata: Metadata = { title: "Run — Split Signal" };

export default async function RunDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <RunDetailScreen id={id} />;
}
