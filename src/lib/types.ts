export type Direction = "NORTH" | "EAST" | "SOUTH" | "WEST";

export type Probe = {
  id: string;
  x: number;
  y: number;
  direction: Direction;
};

export type Plateau = {
  maxX: number;
  maxY: number;
};

export type ApiErrorBody = {
  detail?: string | Record<string, unknown>;
  event?: string;
  x?: number;
  y?: number;
  destroyed?: string[];
};

export type CollisionEvent = {
  event: "collision";
  detail: string;
  x: number;
  y: number;
  destroyed: string[];
};

export type CollisionFxEvent = {
  x: number;
  y: number;
  destroyed: string[];
  source?: "landing" | "move";
};

export type MoveResult =
  | { kind: "moved"; probe: Probe }
  | { kind: "collision"; collision: CollisionEvent };

export type LaunchResult =
  | { kind: "launched"; probe: Probe }
  | { kind: "collision"; collision: CollisionEvent };
