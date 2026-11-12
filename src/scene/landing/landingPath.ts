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
  depart: THREE.Vector3;
  departA: THREE.Vector3;
  departB: THREE.Vector3;
  surfaceQuat: THREE.Quaternion;
  landQuat: THREE.Quaternion;
  startQuat: THREE.Quaternion;
};

type CraftOrient = "insight" | "probe";

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
  p0: THREE.Vector3,
  p1: THREE.Vector3,
  p2: THREE.Vector3,
  p3: THREE.Vector3,
) {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  return new THREE.Vector3()
    .addScaledVector(p0, uu * u)
    .addScaledVector(p1, 3 * uu * t)
    .addScaledVector(p2, 3 * u * tt)
    .addScaledVector(p3, tt * t);
}

/** Stable 0..1 from seed + salt (deterministic per landing). */
export function pathUnit(seed: number, salt: number) {
  const x = Math.sin(seed * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function surfaceBasis(normal: THREE.Vector3) {
  const n = normal.clone().normalize();
  const forward = WORLD_UP.clone().projectOnPlane(n);
  if (forward.lengthSq() < 1e-6) {
    forward.set(0, 0, 1).projectOnPlane(n);
  }
  forward.normalize();
  const side = new THREE.Vector3().crossVectors(forward, n).normalize();
  return { n, forward, side };
}

function bearingOnSurface(
  forward: THREE.Vector3,
  side: THREE.Vector3,
  yaw: number,
) {
  return forward
    .clone()
    .multiplyScalar(Math.cos(yaw))
    .add(side.clone().multiplyScalar(Math.sin(yaw)))
    .normalize();
}

function padOffset(
  pad: THREE.Vector3,
  n: THREE.Vector3,
  along: THREE.Vector3,
  lateral: THREE.Vector3,
  lift: number,
  forward: number,
  side: number,
) {
  return pad
    .clone()
    .add(n.clone().multiplyScalar(lift))
    .add(along.clone().multiplyScalar(forward))
    .add(lateral.clone().multiplyScalar(side));
}

function landOrientation(
  normal: THREE.Vector3,
  craft: CraftOrient,
  seed: number,
): { landQuat: THREE.Quaternion; startQuat: THREE.Quaternion } {
  const landQuat = new THREE.Quaternion().setFromUnitVectors(
    WORLD_UP,
    normal.clone().normalize(),
  );
  const tip =
    craft === "probe"
      ? -0.32 - pathUnit(seed, 11) * 0.22
      : -0.4 - pathUnit(seed, 11) * 0.18;
  const yaw =
    craft === "probe"
      ? (pathUnit(seed, 12) - 0.5) * 1.1
      : 0.55 + (pathUnit(seed, 12) - 0.5) * 0.7;
  const roll = (pathUnit(seed, 13) - 0.5) * 0.22;
  const startQuat = landQuat
    .clone()
    .multiply(
      new THREE.Quaternion().setFromEuler(new THREE.Euler(tip, yaw, roll)),
    );
  return { landQuat, startQuat };
}

export function buildLandingPathAt(
  touchdown: THREE.Vector3,
  normal: THREE.Vector3,
  craft: CraftOrient = "insight",
  seed = 0,
): LandingPath {
  const { n, forward, side } = surfaceBasis(normal);
  const pad = touchdown.clone();

  const approachYaw = pathUnit(seed, 1) * Math.PI * 2;
  const departYaw =
    approachYaw + Math.PI + (pathUnit(seed, 2) - 0.5) * Math.PI * 1.05;
  const approachDir = bearingOnSurface(forward, side, approachYaw);
  const departDir = bearingOnSurface(forward, side, departYaw);
  const approachSide = new THREE.Vector3()
    .crossVectors(approachDir, n)
    .normalize();
  const departSide = new THREE.Vector3().crossVectors(departDir, n).normalize();

  const approachSpan =
    (craft === "probe" ? 1.2 : 1.46) + pathUnit(seed, 3) * 0.55;
  const approachBias = (pathUnit(seed, 4) - 0.5) * 0.55;
  const hoverSpan = 0.38 + pathUnit(seed, 5) * 0.28;
  const hoverBias = (pathUnit(seed, 6) - 0.5) * 0.18;
  const departSpan =
    (craft === "probe" ? 2.15 : 2.0) + pathUnit(seed, 7) * 0.85;
  const departBias = (pathUnit(seed, 8) - 0.5) * 0.7;
  const startLift =
    (craft === "probe" ? 1.95 : 2.05) + pathUnit(seed, 9) * 0.35;
  const departLift = 3.05 + pathUnit(seed, 10) * 0.7;

  const start = padOffset(
    pad,
    n,
    approachDir,
    approachSide,
    startLift,
    approachSpan,
    approachBias,
  );
  const hover = padOffset(
    pad,
    n,
    approachDir,
    approachSide,
    0.68 + pathUnit(seed, 14) * 0.2,
    hoverSpan,
    hoverBias,
  );
  const approachA = padOffset(
    start,
    n,
    approachDir,
    approachSide,
    0.28 + pathUnit(seed, 15) * 0.16,
    -0.22,
    (pathUnit(seed, 16) - 0.5) * 0.2,
  );
  const approachB = padOffset(
    hover,
    n,
    approachDir,
    approachSide,
    0.7 + pathUnit(seed, 17) * 0.25,
    0.18,
    (pathUnit(seed, 18) - 0.5) * 0.16,
  );
  const descentA = padOffset(hover, n, approachDir, approachSide, 0.35, 0.1, 0);
  const descentB = padOffset(pad, n, approachDir, approachSide, 0.2, 0.06, 0);
  const depart = padOffset(
    pad,
    n,
    departDir,
    departSide,
    departLift,
    departSpan,
    departBias,
  );
  const departA = padOffset(
    pad,
    n,
    departDir,
    departSide,
    0.65 + pathUnit(seed, 19) * 0.2,
    0.35,
    departBias * 0.25,
  );
  const departB = padOffset(
    pad,
    n,
    departDir,
    departSide,
    1.7 + pathUnit(seed, 20) * 0.4,
    departSpan * 0.55,
    departBias * 0.55,
  );

  const { landQuat, startQuat } = landOrientation(n, craft, seed);
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
    depart,
    departA,
    departB,
    surfaceQuat,
    landQuat,
    startQuat,
  };
}

export function buildLandingPath(
  lat: number,
  lon: number,
  craft: CraftOrient = "insight",
  seed = 0,
): LandingPath {
  const normal = new THREE.Vector3(...surfacePoint(lat, lon, 1)).normalize();
  const touchdown = new THREE.Vector3(...surfacePoint(lat, lon, 2.0008));
  return buildLandingPathAt(touchdown, normal, craft, seed);
}
