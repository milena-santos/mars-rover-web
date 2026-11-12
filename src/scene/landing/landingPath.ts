import * as THREE from "three";

import { surfacePoint } from "@/lib/regions";

const WORLD_UP = new THREE.Vector3(0, 1, 0);

export type LandingPath = {
  normal: THREE.Vector3;
  touchdown: THREE.Vector3;
  start: THREE.Vector3;
  hover: THREE.Vector3;
  approachA: THREE.Vector3;
  approachB: THREE.Vector3;
  descentA: THREE.Vector3;
  descentB: THREE.Vector3;
  surfaceQuat: THREE.Quaternion;
  landQuat: THREE.Quaternion;
  startQuat: THREE.Quaternion;
};

export type CraftOrient = "insight" | "probe";

export function easeOutCubic(value: number) {
  return 1 - (1 - value) ** 3;
}

export function easeInOutCubic(value: number) {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - (-2 * value + 2) ** 3 / 2;
}

export function cubicBezierPoint(
  t: number,
  start: THREE.Vector3,
  controlA: THREE.Vector3,
  controlB: THREE.Vector3,
  end: THREE.Vector3,
) {
  return new THREE.CubicBezierCurve3(start, controlA, controlB, end).getPoint(t);
}

function landOrientation(
  normal: THREE.Vector3,
  craft: CraftOrient,
): { landQuat: THREE.Quaternion; startQuat: THREE.Quaternion } {
  const landQuat = new THREE.Quaternion().setFromUnitVectors(
    WORLD_UP,
    normal.clone().normalize(),
  );
  const entry =
    craft === "probe"
      ? new THREE.Euler(-0.4, 0.35, 0.08)
      : new THREE.Euler(-0.45, 0.8, 0.22);
  const startQuat = landQuat
    .clone()
    .multiply(new THREE.Quaternion().setFromEuler(entry));
  return { landQuat, startQuat };
}

export function buildLandingPathAt(
  touchdown: THREE.Vector3,
  normal: THREE.Vector3,
  craft: CraftOrient = "insight",
): LandingPath {
  const n = normal.clone().normalize();
  const pad = touchdown.clone();
  const forward = WORLD_UP.clone().projectOnPlane(n);
  if (forward.lengthSq() < 1e-6) {
    forward.set(0, 0, 1).projectOnPlane(n);
  }
  forward.normalize();
  const side = new THREE.Vector3().crossVectors(forward, n).normalize();

  const start = pad
    .clone()
    .add(n.clone().multiplyScalar(2.05))
    .add(forward.clone().multiplyScalar(1.46))
    .add(side.clone().multiplyScalar(-0.34));
  const hover = pad
    .clone()
    .add(n.clone().multiplyScalar(0.76))
    .add(forward.clone().multiplyScalar(0.48))
    .add(side.clone().multiplyScalar(-0.04));
  const approachA = start
    .clone()
    .add(n.clone().multiplyScalar(0.34))
    .add(forward.clone().multiplyScalar(-0.28));
  const approachB = hover
    .clone()
    .add(n.clone().multiplyScalar(0.82))
    .add(forward.clone().multiplyScalar(0.22));
  const descentA = hover
    .clone()
    .add(n.clone().multiplyScalar(0.4))
    .add(forward.clone().multiplyScalar(0.14));
  const descentB = pad
    .clone()
    .add(n.clone().multiplyScalar(0.22))
    .add(forward.clone().multiplyScalar(0.08));

  const { landQuat, startQuat } = landOrientation(n, craft);
  const surfaceQuat = new THREE.Quaternion().setFromUnitVectors(WORLD_UP, n);

  return {
    normal: n,
    touchdown: pad,
    start,
    hover,
    approachA,
    approachB,
    descentA,
    descentB,
    surfaceQuat,
    landQuat,
    startQuat,
  };
}

export function buildLandingPath(
  lat: number,
  lon: number,
  craft: CraftOrient = "insight",
): LandingPath {
  const normal = new THREE.Vector3(...surfacePoint(lat, lon, 1)).normalize();
  const touchdown = new THREE.Vector3(...surfacePoint(lat, lon, 2.0008));
  return buildLandingPathAt(touchdown, normal, craft);
}
