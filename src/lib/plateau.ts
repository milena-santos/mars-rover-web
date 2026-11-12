import type { Plateau, Probe } from "@/lib/types";

const PLATEAU_STORAGE_KEY = "mars-rover.plateau";

/** Mirrors API `MAX_PLATEAU_DIMENSION`. */
export const MAX_MESH_SIZE = 10;

export function readStoredPlateau(): Plateau | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(PLATEAU_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Plateau;
    const valid =
      typeof parsed.maxX === "number" &&
      typeof parsed.maxY === "number" &&
      parsed.maxX >= 0 &&
      parsed.maxY >= 0 &&
      parsed.maxX <= MAX_MESH_SIZE &&
      parsed.maxY <= MAX_MESH_SIZE;
    return valid ? parsed : null;
  } catch {
    return null;
  }
}

export function storePlateau(plateau: Plateau): void {
  window.sessionStorage.setItem(PLATEAU_STORAGE_KEY, JSON.stringify(plateau));
}

export function clearStoredPlateau(): void {
  window.sessionStorage.removeItem(PLATEAU_STORAGE_KEY);
}

export function inferPlateau(
  probes: Probe[],
  current: Plateau | null,
): Plateau | null {
  if (current) return current;
  if (probes.length === 0) return null;

  let maxX = 0;
  let maxY = 0;
  for (const probe of probes) {
    if (probe.x > maxX) maxX = probe.x;
    if (probe.y > maxY) maxY = probe.y;
  }

  return { maxX, maxY };
}

export function parseMeshSize(value: string): number | null {
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const size = Number(trimmed);
  if (size > MAX_MESH_SIZE) return null;
  return size;
}
