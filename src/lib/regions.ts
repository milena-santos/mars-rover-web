export type MissionRegion = {
  id: string;
  name: string;
  code: string;
  blurb: string;
  color: string;
  lat: number;
  lon: number;
  defaultMaxX: number;
  defaultMaxY: number;
};

const R = 2;

export function surfacePoint(latDeg: number, lonDeg: number, radius = R): [number, number, number] {
  const lat = (latDeg * Math.PI) / 180;
  const lon = (lonDeg * Math.PI) / 180;
  return [
    radius * Math.cos(lat) * Math.cos(lon),
    radius * Math.sin(lat),
    radius * Math.cos(lat) * Math.sin(lon),
  ];
}

export function cameraFor(
  latDeg: number,
  lonDeg: number,
  camDist = R + 1.45,
): {
  position: [number, number, number];
  target: [number, number, number];
} {
  const [nx, ny, nz] = surfacePoint(latDeg, lonDeg, 1);
  const upBias = camDist < R + 1.1 ? 0.42 : 0.22;
  return {
    position: [nx * camDist, ny * camDist + upBias, nz * camDist],
    target: surfacePoint(latDeg, lonDeg, R + 0.08),
  };
}

export const MISSION_REGIONS: MissionRegion[] = [
  {
    id: "olympus",
    name: "Olympus Mons",
    code: "01 / OLYMPUS BASE",
    blurb: "Planície alta — malha ampla para patrulha.",
    color: "#e55838",
    lat: 18,
    lon: -133,
    defaultMaxX: 5,
    defaultMaxY: 5,
  },
  {
    id: "valles",
    name: "Valles Marineris",
    code: "02 / VALLES OUTPOST",
    blurb: "Cânion estreito — malha alongada no eixo X.",
    color: "#f0a050",
    lat: -14,
    lon: -59,
    defaultMaxX: 8,
    defaultMaxY: 3,
  },
  {
    id: "hellas",
    name: "Hellas Planitia",
    code: "03 / HELLAS RELAY",
    blurb: "Bacia profunda — malha compacta e tática.",
    color: "#ffb070",
    lat: -42,
    lon: 70,
    defaultMaxX: 4,
    defaultMaxY: 4,
  },
];

export function getRegion(id: string | null): MissionRegion | null {
  if (!id) return null;
  return MISSION_REGIONS.find((region) => region.id === id) ?? null;
}

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
