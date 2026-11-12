import { getRegion } from "@/lib/regions";

const REGION_STORAGE_KEY = "mars-rover.region";

export function readStoredRegionId(): string | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(REGION_STORAGE_KEY);
  if (!raw) return null;
  return getRegion(raw) ? raw : null;
}

export function storeRegionId(id: string): void {
  window.sessionStorage.setItem(REGION_STORAGE_KEY, id);
}

export function clearStoredRegionId(): void {
  window.sessionStorage.removeItem(REGION_STORAGE_KEY);
}
