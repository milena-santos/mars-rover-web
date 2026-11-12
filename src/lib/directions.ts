import type { Direction } from "@/lib/types";

export const DIRECTIONS: Direction[] = ["NORTH", "EAST", "SOUTH", "WEST"];

export function directionDegrees(direction: Direction): number {
  if (direction === "NORTH") return 0;
  if (direction === "EAST") return 90;
  if (direction === "SOUTH") return 180;
  return 270;
}

export function directionLabel(direction: Direction): string {
  if (direction === "NORTH") return "Norte";
  if (direction === "EAST") return "Leste";
  if (direction === "SOUTH") return "Sul";
  return "Oeste";
}
