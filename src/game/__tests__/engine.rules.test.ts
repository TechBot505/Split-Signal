import { describe, expect, it } from "vitest";
import { apply, createRoom, handleDisconnect, tick } from "@/game/engine";
import type { Effect } from "@/game/engine";
import type { WiresState } from "@/game/puzzles/wires";
import type { RoomState } from "@/game/types";
import { codeFor, P0, P1, TOKEN0, TOKEN1, toStageZero } from "./harness";

const NOW = 1_700_000_000_000;

function hasEvent(effects: Effect[], kind: string): boolean {
  return effects.some((e) => e.t === "event" && e.kind === kind);
}
function hasError(effects: Effect[], code: string): boolean {
  return effects.some((e) => e.t === "error" && e.code === code);
}
/** First code whose quick-mode stage 0 is the wires puzzle (easy wrong move). */
function wiresStart(): RoomState {
  for (let i = 0; i < 500; i++) {
    const s = toStageZero("quick", codeFor(i), NOW);
    if (s.stages[0].type === "wires") return s;
  }
  throw new Error("no wires stage 0 found");
}

describe("strikes and failure", () => {
  it("three wrong moves fail the run", () => {
    let s = wiresStart();
    const ws = s.stages[0].state as WiresState;
    const wrong = (ws.answer + 1) % ws.wires.length;
    const d0 = s.run!.deadline;
    const first = apply(s, P0, { type: "action", stageIndex: 0, payload: { cut: wrong } }, NOW);
    expect(hasEvent(first.effects, "strike")).toBe(true);
    s = first.state;
    expect(s.run!.strikes).toBe(1);
    expect(s.run!.deadline).toBe(d0 - 15_000);
    s = apply(s, P0, { type: "action", stageIndex: 0, payload: { cut: wrong } }, NOW).state;
    const third = apply(s, P0, { type: "action", stageIndex: 0, payload: { cut: wrong } }, NOW);
    s = third.state;
    expect(s.phase).toBe("failed");
    expect(s.result?.escaped).toBe(false);
    expect(s.result?.stagesCleared).toBe(0);
    expect(third.effects.some((e) => e.t === "runOver")).toBe(true);
  });

  it("time running out fails the run via tick", () => {
    const s = toStageZero("quick", codeFor(2), NOW);
    const deadline = s.run!.deadline;
    const out = tick(s, deadline + 1);
    expect(out.state.phase).toBe("failed");
    expect(out.state.result?.escaped).toBe(false);
    expect(out.state.result?.timeLeftMs).toBe(0);
  });
});

describe("pause / resume", () => {
  it("resume shifts the deadline by the paused duration", () => {
    let s = toStageZero("standard", codeFor(5), NOW);
    const d0 = s.run!.deadline;
    s = apply(s, P0, { type: "pause" }, NOW + 1_000).state;
    expect(s.run!.pausedAt).toBe(NOW + 1_000);
    const resumed = apply(s, P1, { type: "resume" }, NOW + 6_000);
    s = resumed.state;
    expect(s.run!.pausedAt).toBeUndefined();
    expect(s.run!.pausedTotalMs).toBe(5_000);
    expect(s.run!.deadline).toBe(d0 + 5_000);
  });
});

describe("disconnect / reconnect", () => {
  it("disconnect auto-pauses; resume needs both, reconnect restores the seat", () => {
    let s = toStageZero("standard", codeFor(6), NOW);
    s = handleDisconnect(s, P1, NOW + 500).state;
    expect(s.players.find((p) => p.id === P1)?.connected).toBe(false);
    expect(s.run!.pausedAt).toBe(NOW + 500);
    expect(hasError(apply(s, P0, { type: "resume" }, NOW + 600).effects, "partner_offline")).toBe(true);
    const wrong = apply(s, P1, { type: "join", playerId: P1, token: "BADTOKEN", name: "Bo", avatar: {} }, NOW + 700);
    expect(hasError(wrong.effects, "seat_taken")).toBe(true);
    s = apply(s, P1, { type: "join", playerId: P1, token: TOKEN1, name: "Bo", avatar: {} }, NOW + 800).state;
    expect(s.players.find((p) => p.id === P1)?.connected).toBe(true);
    expect(s.run!.pausedAt).toBe(NOW + 500); // still paused until an explicit resume
    s = apply(s, P0, { type: "resume" }, NOW + 900).state;
    expect(s.run!.pausedAt).toBeUndefined();
  });
});

describe("seating and hints", () => {
  it("a third distinct player is rejected as room_full", () => {
    let s = createRoom("ABCD", NOW);
    s = apply(s, P0, { type: "join", playerId: P0, token: TOKEN0, name: "Ava", avatar: {} }, NOW).state;
    s = apply(s, P1, { type: "join", playerId: P1, token: TOKEN1, name: "Bo", avatar: {} }, NOW).state;
    const third = apply(s, "p2", { type: "join", playerId: "p2", token: "TX", name: "Cy", avatar: {} }, NOW);
    expect(hasError(third.effects, "room_full")).toBe(true);
  });

  it("a hint reveals text, costs 30s and depletes", () => {
    let s = toStageZero("standard", codeFor(7), NOW);
    const d0 = s.run!.deadline;
    const r = apply(s, P0, { type: "hint" }, NOW);
    expect(hasEvent(r.effects, "hint")).toBe(true);
    s = r.state;
    expect(s.run!.hintsLeft).toBe(1);
    expect(s.run!.hintsUsed).toBe(1);
    expect((s.run!.hintText ?? "").length).toBeGreaterThan(0);
    expect(s.run!.deadline).toBe(d0 - 30_000);
    s = apply(s, P1, { type: "hint" }, NOW).state;
    expect(hasError(apply(s, P0, { type: "hint" }, NOW).effects, "no_hints")).toBe(true);
  });
});
