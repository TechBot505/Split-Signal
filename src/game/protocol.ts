/**
 * Wire protocol (zod) for both sides of the socket. Client messages are parsed
 * with `parseClientMessage`; server messages carry a per-player RoomView.
 * See SPEC.md "Protocol".
 */
import { z } from "zod";
import type { EventKind, Mode, RoomView, SignalKind } from "./types";

const modeSchema: z.ZodType<Mode> = z.enum(["quick", "standard", "hard", "daily"]);
const signalKindSchema: z.ZodType<SignalKind> = z.enum([
  "wait",
  "yes",
  "no",
  "repeat",
  "gotit",
  "help",
]);

/** Arbitrary JSON-object avatar config (validated in depth by the app layer). */
const avatarSchema = z.record(z.string(), z.unknown());

// ---- client -> server ------------------------------------------------------

export const clientMessageSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("join"),
    playerId: z.string().min(1),
    token: z.string().min(1),
    name: z.string().min(1).max(16),
    avatar: avatarSchema,
  }),
  z.object({ type: z.literal("create"), mode: modeSchema }),
  z.object({ type: z.literal("ready") }),
  z.object({ type: z.literal("start") }),
  z.object({ type: z.literal("action"), stageIndex: z.number().int().min(0), payload: z.unknown() }),
  z.object({ type: z.literal("hint") }),
  z.object({ type: z.literal("signal"), kind: signalKindSchema }),
  z.object({ type: z.literal("pause") }),
  z.object({ type: z.literal("resume") }),
  z.object({ type: z.literal("playAgain") }),
  z.object({ type: z.literal("leave") }),
  z.object({ type: z.literal("ping") }),
]);

export type ClientMessage = z.infer<typeof clientMessageSchema>;

/** Result type of parsing a client message (success or zod error). */
export type ClientParseResult = ReturnType<typeof clientMessageSchema.safeParse>;

/** Parse an untrusted client payload. Never throws. */
export function parseClientMessage(raw: unknown): ClientParseResult {
  return clientMessageSchema.safeParse(raw);
}

// ---- server -> client ------------------------------------------------------

/** Server messages. `view` is typed as RoomView via the exported union below. */
export type ServerMessage =
  | { type: "state"; view: RoomView }
  | { type: "error"; code: string; message: string }
  | { type: "signal"; from: string; kind: SignalKind }
  | { type: "event"; kind: EventKind; stageIndex?: number; message?: string }
  | { type: "pong"; now: number };

/** Loose schema for validating server messages on the client (view stays opaque). */
export const serverMessageSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("state"), view: z.unknown() }),
  z.object({ type: z.literal("error"), code: z.string(), message: z.string() }),
  z.object({ type: z.literal("signal"), from: z.string(), kind: signalKindSchema }),
  z.object({
    type: z.literal("event"),
    kind: z.enum(["solved", "strike", "hint", "escaped", "failed", "stageStart"]),
    stageIndex: z.number().int().optional(),
    message: z.string().optional(),
  }),
  z.object({ type: z.literal("pong"), now: z.number() }),
]);
