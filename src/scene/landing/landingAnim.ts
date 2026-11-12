import type { MutableRefObject, RefObject } from "react";
import * as THREE from "three";

import {
  cubicBezierPoint,
  easeInOutCubic,
  easeOutCubic,
  type LandingPath,
} from "@/scene/landing/landingPath";

export type LandingFxRefs = {
  thrusterMat: RefObject<THREE.MeshBasicMaterial | null>;
  glowMat: RefObject<THREE.MeshBasicMaterial | null>;
  lightRef: RefObject<THREE.PointLight | null>;
  dustOuterMat: RefObject<THREE.MeshBasicMaterial | null>;
  dustInnerMat: RefObject<THREE.MeshBasicMaterial | null>;
  dustOuter: RefObject<THREE.Mesh | null>;
  dustInner: RefObject<THREE.Mesh | null>;
};

type PoseArgs = {
  progress: number;
  path: LandingPath;
  rig: THREE.Group;
  ship: THREE.Group;
};

function segment(progress: number, start: number, length: number) {
  if (progress <= start) return 0;
  return Math.min((progress - start) / length, 1);
}

function placeOnCurve(
  rig: THREE.Group,
  t: number,
  a: THREE.Vector3,
  ca: THREE.Vector3,
  cb: THREE.Vector3,
  b: THREE.Vector3,
) {
  rig.position.copy(cubicBezierPoint(t, a, ca, cb, b));
}

export function muteLandingFx(fx: LandingFxRefs) {
  if (fx.thrusterMat.current) fx.thrusterMat.current.opacity = 0;
  if (fx.glowMat.current) fx.glowMat.current.opacity = 0;
  if (fx.dustOuterMat.current) fx.dustOuterMat.current.opacity = 0;
  if (fx.dustInnerMat.current) fx.dustInnerMat.current.opacity = 0;
  if (fx.lightRef.current) fx.lightRef.current.intensity = 0;
}

export function applyThrusters(fx: LandingFxRefs, thrust: number) {
  if (fx.thrusterMat.current) {
    fx.thrusterMat.current.opacity = 0.08 + thrust * 0.38;
  }
  if (fx.glowMat.current) fx.glowMat.current.opacity = 0.06 + thrust * 0.22;
  if (fx.lightRef.current) fx.lightRef.current.intensity = 0.35 + thrust * 0.55;
}

export function applyDust(
  fx: LandingFxRefs,
  progress: number,
  start: number,
  fadeEase: number,
  dustMul: number,
) {
  const dust =
    progress < start
      ? 0
      : progress < start + 0.28
        ? easeInOutCubic((progress - start) / 0.28)
        : Math.max(0, 1 - fadeEase);
  if (fx.dustOuterMat.current) {
    fx.dustOuterMat.current.opacity = dust * 0.1 * dustMul;
  }
  if (fx.dustInnerMat.current) {
    fx.dustInnerMat.current.opacity = dust * 0.16 * dustMul;
  }
  if (fx.dustOuter.current) {
    fx.dustOuter.current.scale.setScalar(1 + dust * (2.8 * dustMul + 0.4));
  }
  if (fx.dustInner.current) {
    fx.dustInner.current.scale.setScalar(0.85 + dust * (1.7 * dustMul + 0.3));
  }
}

export function animateIntroLanding({
  progress,
  path,
  rig,
  ship,
  fx,
}: PoseArgs & { fx: LandingFxRefs }) {
  const approachEase = easeOutCubic(segment(progress, 0, 0.58));
  const descentEase = easeInOutCubic(segment(progress, 0.58, 0.24));
  const fadeEase = easeInOutCubic(segment(progress, 0.82, 0.18));

  if (progress < 0.58) {
    placeOnCurve(
      rig,
      approachEase,
      path.start,
      path.approachA,
      path.approachB,
      path.hover,
    );
  } else {
    placeOnCurve(
      rig,
      descentEase,
      path.hover,
      path.descentA,
      path.descentB,
      path.touchdown,
    );
  }

  rig.quaternion.slerpQuaternions(
    path.startQuat,
    path.landQuat,
    Math.min(1, progress * 1.15),
  );
  const settle = progress < 0.72 ? 1 : 1 - (progress - 0.72) / 0.28;
  ship.rotation.y = -Math.PI * 0.08 + Math.sin(progress * Math.PI * 2.4) * 0.04;
  ship.rotation.z = Math.cos(progress * Math.PI * 1.8) * 0.028 * settle;
  ship.rotation.x = 0;
  ship.scale.setScalar(1);

  const thrust =
    progress < 0.58
      ? 1
      : progress < 0.82
        ? 1 - descentEase * 0.55
        : 1 - fadeEase;
  applyThrusters(fx, thrust);
  applyDust(fx, progress, 0.58, fadeEase, 1);
}

export function animateDelivery({
  progress,
  path,
  rig,
  ship,
  crash,
  fx,
  droppedRef,
  onDropRef,
}: PoseArgs & {
  crash: boolean;
  fx: LandingFxRefs;
  droppedRef: MutableRefObject<boolean>;
  onDropRef: MutableRefObject<(() => void) | undefined>;
}) {
  const impactAt = 0.54;
  const departAt = 0.6;
  const approachEase = easeOutCubic(segment(progress, 0, 0.34));
  const descentEase = easeInOutCubic(segment(progress, 0.34, 0.16));
  const departEase = crash
    ? 0
    : easeInOutCubic(segment(progress, departAt, 0.4));

  if (progress < 0.34) {
    placeOnCurve(
      rig,
      approachEase,
      path.start,
      path.approachA,
      path.approachB,
      path.hover,
    );
  }
  if (progress >= 0.34 && (crash || progress < departAt)) {
    placeOnCurve(
      rig,
      descentEase,
      path.hover,
      path.descentA,
      path.descentB,
      path.touchdown,
    );
  }
  if (!crash && progress >= departAt) {
    placeOnCurve(
      rig,
      departEase,
      path.touchdown,
      path.departA,
      path.departB,
      path.depart,
    );
  }

  if (crash || progress < departAt) {
    const align = Math.min(1, progress * (crash ? 1.15 : 1.4));
    rig.quaternion.slerpQuaternions(path.startQuat, path.landQuat, align);
  } else {
    rig.quaternion.slerpQuaternions(
      path.landQuat,
      path.startQuat,
      departEase * 0.9,
    );
  }

  const rock = progress < 0.5 ? 1 : progress < departAt ? 0.15 : 0.85;
  ship.rotation.y =
    -Math.PI * 0.06 + Math.sin(progress * Math.PI * 2.1) * 0.03 * rock;
  ship.rotation.z = Math.cos(progress * Math.PI * 1.7) * 0.02 * rock;
  ship.rotation.x =
    !crash && progress >= departAt
      ? -departEase * 0.55
      : Math.sin(progress * Math.PI) * 0.01;
  ship.scale.setScalar(
    !crash && progress >= departAt ? 1 - departEase * 0.55 : 1,
  );

  if (progress >= impactAt && !droppedRef.current) {
    droppedRef.current = true;
    onDropRef.current?.();
  }

  const thrust =
    progress < 0.34
      ? 1
      : progress < 0.5
        ? 1 - descentEase * 0.45
        : crash
          ? 0.4 + progress * 0.35
          : progress < departAt
            ? 0.28
            : 0.7 + departEase * 0.3;
  applyThrusters(fx, thrust * 0.55);
  applyDust(
    fx,
    progress,
    0.34,
    crash || progress < departAt ? 0 : Math.min(1, departEase * 1.4),
    crash ? 0.7 : 0.45,
  );
}
