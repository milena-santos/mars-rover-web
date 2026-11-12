import { cameraFor, type MissionRegion } from "@/lib/regions";

type CameraFocus = {
  position: [number, number, number];
  target: [number, number, number];
};

export const VEILED_CAMERA: CameraFocus = {
  position: [0, 0.55, 9.8],
  target: [0, -0.1, 0],
};

const OPEN_CAMERA: CameraFocus = {
  position: [0, 1.05, 7.6],
  target: [0, 0, 0],
};

export const INTRO_LANDING = {
  lat: 34,
  lon: 78,
  position: [0.42, 2.12, 6.05] as [number, number, number],
  target: cameraFor(34, 78).target,
};

type ResolveFocusArgs = {
  veiled: boolean;
  introLanding: boolean;
  mission: boolean;
  region: MissionRegion | null;
};

export function resolveSceneCamera({
  veiled,
  introLanding,
  mission,
  region,
}: ResolveFocusArgs): CameraFocus {
  if (veiled) return VEILED_CAMERA;
  if (introLanding) return INTRO_LANDING;
  if (region && mission) return cameraFor(region.lat, region.lon, 2 + 2.05);
  if (region) return cameraFor(region.lat, region.lon);
  return OPEN_CAMERA;
}
