import { notFound } from "next/navigation";
import { isValid } from "@/game/codes";
import { RoomScreen } from "@/components/room";

/** Live room route. Validates the code up-front (404 otherwise), then connects. */
export default async function RoomPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const upper = code.toUpperCase();
  if (!isValid(upper)) notFound();
  return <RoomScreen code={upper} />;
}
