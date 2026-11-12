import type { Direction, Plateau, Probe } from "@/lib/types";

const ORDER: Direction[] = ["NORTH", "EAST", "SOUTH", "WEST"];

const STEP: Record<Direction, { dx: number; dy: number }> = {
  NORTH: { dx: 0, dy: 1 },
  EAST: { dx: 1, dy: 0 },
  SOUTH: { dx: 0, dy: -1 },
  WEST: { dx: -1, dy: 0 },
};

const TURN_BY_STEPS = ["", "R", "RR", "L"] as const;

const KEY_TO_CARDINAL: Record<string, Direction> = {
  w: "NORTH",
  W: "NORTH",
  ArrowUp: "NORTH",
  d: "EAST",
  D: "EAST",
  ArrowRight: "EAST",
  s: "SOUTH",
  S: "SOUTH",
  ArrowDown: "SOUTH",
  a: "WEST",
  A: "WEST",
  ArrowLeft: "WEST",
};

const KEY_TO_TURN: Record<string, "L" | "R"> = {
  q: "L",
  Q: "L",
  e: "R",
  E: "R",
};

export type PilotAction =
  { type: "step"; cardinal: Direction } | { type: "turn"; command: "L" | "R" };

function turnsToFace(from: Direction, to: Direction): string {
  const fromIdx = ORDER.indexOf(from);
  const toIdx = ORDER.indexOf(to);
  const steps = (toIdx - fromIdx + ORDER.length) % ORDER.length;
  return TURN_BY_STEPS[steps] ?? "";
}

function commandsToStep(from: Direction, to: Direction): string {
  return `${turnsToFace(from, to)}M`;
}

export function actionToCommands(probe: Probe, action: PilotAction): string {
  if (action.type === "turn") return action.command;
  return commandsToStep(probe.direction, action.cardinal);
}

export function stepTarget(
  probe: Probe,
  cardinal: Direction,
): { x: number; y: number } {
  const step = STEP[cardinal];
  return { x: probe.x + step.dx, y: probe.y + step.dy };
}

export function isInsidePlateau(
  x: number,
  y: number,
  plateau: Plateau,
): boolean {
  return x >= 0 && y >= 0 && x <= plateau.maxX && y <= plateau.maxY;
}

export function actionStaysInside(
  probe: Probe,
  action: PilotAction,
  plateau: Plateau,
): boolean {
  if (action.type === "turn") return true;
  const next = stepTarget(probe, action.cardinal);
  return isInsidePlateau(next.x, next.y, plateau);
}

export function keyToCardinal(key: string): Direction | null {
  return KEY_TO_CARDINAL[key] ?? null;
}

export function keyToTurn(key: string): "L" | "R" | null {
  return KEY_TO_TURN[key] ?? null;
}
