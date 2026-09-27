import type { Role } from "@/game/puzzles/types";
export interface PuzzleViewProps<V, Act> { view: V; role: Role; canAct: boolean; send: (action: Act) => void; disabled?: boolean; }
