/**
 * Client-side validation of server→client frames. The server authors these, but
 * we still `safeParse` with the shared protocol schema and drop anything
 * malformed so a bad frame can never crash the room. The RoomView stays opaque
 * in the schema (`z.unknown()`), so we cast it to the typed shape here.
 */
import { serverMessageSchema, type ServerMessage } from "@/game/protocol";
import type { RoomView } from "@/game/types";

/** Parse a raw socket frame into a typed ServerMessage, or null when invalid. */
export function parseServerMessage(raw: string): ServerMessage | null {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  const result = serverMessageSchema.safeParse(data);
  if (!result.success) return null;
  const msg = result.data;
  if (msg.type === "state") {
    return { type: "state", view: msg.view as RoomView };
  }
  return msg;
}

/** Build the `join` frame from the local profile. Sent on every (re)connect. */
export function buildJoin(profile: {
  id: string;
  token: string;
  name: string;
  avatar: Record<string, unknown>;
}) {
  return {
    type: "join" as const,
    playerId: profile.id,
    token: profile.token,
    name: profile.name || "Operator",
    avatar: profile.avatar,
  };
}
