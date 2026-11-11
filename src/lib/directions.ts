import type { Direction } from "@/lib/types";

export const DIRECTIONS: Direction[] = ["NORTH", "EAST", "SOUTH", "WEST"];

export function directionGlyph(direction: Direction): string {
  if (direction === "NORTH") return "▲";
  if (direction === "EAST") return "▶";
  if (direction === "SOUTH") return "▼";
  return "◀";
}

export function directionLabel(direction: Direction): string {
  if (direction === "NORTH") return "Norte";
  if (direction === "EAST") return "Leste";
  if (direction === "SOUTH") return "Sul";
  return "Oeste";
}

export function shortId(id: string): string {
  return id.slice(0, 8);
}
