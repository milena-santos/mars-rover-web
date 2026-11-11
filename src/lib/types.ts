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
};
