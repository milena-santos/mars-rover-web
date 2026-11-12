import * as THREE from "three";

import { surfacePoint, type MissionRegion } from "@/lib/regions";
import type { Plateau } from "@/lib/types";

const MARS_R = 2;
const SURFACE_LIFT = 0.001;
const PLATEAU_EAST = 0.52;
const PLATEAU_NORTH = 0.18;

export function surfaceNormal(lat: number, lon: number): THREE.Vector3 {
  return new THREE.Vector3(...surfacePoint(lat, lon, 1)).normalize();
}

export function orientationFromNormal(normal: THREE.Vector3): THREE.Quaternion {
  return new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    normal.clone().normalize(),
  );
}

function tangentFrame(
  lat: number,
  lon: number,
): {
  origin: THREE.Vector3;
  normal: THREE.Vector3;
  east: THREE.Vector3;
  north: THREE.Vector3;
} {
  const normal = surfaceNormal(lat, lon);
  const origin = new THREE.Vector3(
    ...surfacePoint(lat, lon, MARS_R + SURFACE_LIFT),
  );
  const east = new THREE.Vector3()
    .crossVectors(new THREE.Vector3(0, 1, 0), normal)
    .normalize();
  if (east.lengthSq() < 0.0001) {
    east.set(1, 0, 0).cross(normal).normalize();
  }
  const north = new THREE.Vector3().crossVectors(normal, east).normalize();
  return { origin, normal, east, north };
}

function projectToSurface(
  point: THREE.Vector3,
  lift = SURFACE_LIFT,
): THREE.Vector3 {
  return point
    .clone()
    .normalize()
    .multiplyScalar(MARS_R + lift);
}

function plateauFrame(region: MissionRegion): {
  origin: THREE.Vector3;
  normal: THREE.Vector3;
  east: THREE.Vector3;
  north: THREE.Vector3;
} {
  const frame = tangentFrame(region.lat, region.lon);
  const shifted = frame.origin
    .clone()
    .add(frame.east.clone().multiplyScalar(PLATEAU_EAST))
    .add(frame.north.clone().multiplyScalar(PLATEAU_NORTH));
  const origin = projectToSurface(shifted, SURFACE_LIFT);
  const normal = origin.clone().normalize();
  const east = new THREE.Vector3()
    .crossVectors(new THREE.Vector3(0, 1, 0), normal)
    .normalize();
  if (east.lengthSq() < 0.0001) {
    east.set(1, 0, 0).cross(normal).normalize();
  }
  const north = new THREE.Vector3().crossVectors(normal, east).normalize();
  return { origin, normal, east, north };
}

export function plateauCellSize(plateau: Plateau): number {
  const span = Math.max(plateau.maxX, plateau.maxY, 1);
  return 0.58 / span;
}

export function plateauToWorld(
  region: MissionRegion,
  plateau: Plateau,
  x: number,
  y: number,
  lift = SURFACE_LIFT,
): THREE.Vector3 {
  const { origin, east, north } = plateauFrame(region);
  const cell = plateauCellSize(plateau);
  const tangential = origin
    .clone()
    .add(east.multiplyScalar(x * cell))
    .add(north.multiplyScalar(y * cell));
  return projectToSurface(tangential, lift);
}
