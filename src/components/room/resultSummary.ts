import type { ClientRunRecord } from "@/game/types";
import type { RunSummary } from "@/lib/store/types";
import { normalizeAvatar } from "@/lib/avatar";

/**
 * Convert the authoritative end-of-run RunRecord into the local RunSummary
 * shape kept in history. `youSeat` marks which seat is the local player.
 */
export function toSummary(record: ClientRunRecord, youSeat: number): RunSummary {
  return {
    id: record.id,
    code: record.code,
    mode: record.mode,
    dailyKey: record.dailyKey,
    escaped: record.escaped,
    stagesCleared: record.stagesCleared,
    total: record.total,
    timeLeftMs: record.timeLeftMs,
    strikes: record.strikes,
    hintsUsed: record.hintsUsed,
    score: record.score,
    playedAt: record.endedAt,
    players: record.players.map((p) => ({
      seat: p.seat,
      name: p.name,
      avatar: normalizeAvatar(p.avatar),
      isYou: p.seat === youSeat,
    })),
  };
}
