import { createRng } from "../../rng";
import type { Difficulty } from "../types";
import {
  BIT,
  type Cell,
  DC,
  DIRS,
  DR,
  type Landmark,
  type MazeState,
  OPP,
} from "./types";

const SIZES: Record<Difficulty, number> = { 1: 5, 2: 6, 3: 6, 4: 7, 5: 8 };
const GLYPHS = ["star", "moon", "bolt", "leaf", "gear", "drop"] as const;

/** Deterministic perfect maze via seeded recursive-backtracker (DFS). */
export function genMaze(seed: string, d: Difficulty): MazeState {
  const rng = createRng(seed, "maze");
  const size = SIZES[d];
  const open: number[][] = Array.from({ length: size }, () =>
    Array<number>(size).fill(0),
  );
  const visited: boolean[][] = Array.from({ length: size }, () =>
    Array<boolean>(size).fill(false),
  );
  const stack: Cell[] = [{ r: 0, c: 0 }];
  visited[0][0] = true;

  while (stack.length > 0) {
    const cur = stack[stack.length - 1];
    const opts = DIRS.filter((dir) => {
      const nr = cur.r + DR[dir];
      const nc = cur.c + DC[dir];
      return nr >= 0 && nr < size && nc >= 0 && nc < size && !visited[nr][nc];
    });
    if (opts.length === 0) {
      stack.pop();
      continue;
    }
    const dir = rng.pick(opts);
    const nr = cur.r + DR[dir];
    const nc = cur.c + DC[dir];
    open[cur.r][cur.c] |= BIT[dir];
    open[nr][nc] |= BIT[OPP[dir]];
    visited[nr][nc] = true;
    stack.push({ r: nr, c: nc });
  }

  const exit: Cell = { r: size - 1, c: size - 1 };
  const count = d >= 3 ? 2 : 1;
  const interior: Cell[] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const isStart = r === 0 && c === 0;
      const isExit = r === exit.r && c === exit.c;
      if (!isStart && !isExit) interior.push({ r, c });
    }
  }
  const landmarks: Landmark[] = rng
    .sample(interior, count)
    .map((cell, i) => ({ r: cell.r, c: cell.c, glyph: GLYPHS[i] }));

  return { d, size, open, pos: { r: 0, c: 0 }, exit, landmarks, solved: false };
}

/** BFS shortest path from `pos` to `exit`, returned as a list of moves. */
export function bfsMoves(state: MazeState): import("./types").Dir[] {
  const { size, open, pos, exit } = state;
  const prev = new Map<number, { key: number; dir: import("./types").Dir }>();
  const idx = (r: number, c: number): number => r * size + c;
  const start = idx(pos.r, pos.c);
  const goal = idx(exit.r, exit.c);
  const queue: number[] = [start];
  const seen = new Set<number>([start]);
  while (queue.length > 0) {
    const cur = queue.shift() as number;
    if (cur === goal) break;
    const r = Math.floor(cur / size);
    const c = cur % size;
    for (const dir of DIRS) {
      if ((open[r][c] & BIT[dir]) === 0) continue;
      const nr = r + DR[dir];
      const nc = c + DC[dir];
      const nk = idx(nr, nc);
      if (seen.has(nk)) continue;
      seen.add(nk);
      prev.set(nk, { key: cur, dir });
      queue.push(nk);
    }
  }
  const moves: import("./types").Dir[] = [];
  let node = goal;
  while (node !== start) {
    const p = prev.get(node);
    if (!p) break;
    moves.unshift(p.dir);
    node = p.key;
  }
  return moves;
}
