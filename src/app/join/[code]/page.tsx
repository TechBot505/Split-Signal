import { notFound } from "next/navigation";
import { isValid } from "@/game/codes";
import { JoinScreen } from "@/components/room/JoinScreen";

/** Invite-link route: sets identity if needed, then forwards into the room. */
export default async function JoinPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const upper = code.toUpperCase();
  if (!isValid(upper)) notFound();
  return <JoinScreen code={upper} />;
}
