import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

import {
  buildLandingPath,
  buildLandingPathAt,
  cubicBezierPoint,
  easeInOutCubic,
  easeOutCubic,
  type LandingPath,
} from "@/scene/landing/landingPath";
import { LandingDustFx, LandingThrusterFx } from "@/scene/landing/LandingFx";
import { normalizeLanderScene } from "@/scene/landing/landerModel";
import { ProbeCraft } from "@/scene/ProbeCraft";

const MODEL_URL = "/models/insight-lander.glb";
const DURATION = 3.15;

type LandingShipProps = {
  active: boolean;
  parked?: boolean;
  variant?: "insight" | "probe";
  lat?: number;
  lon?: number;
  touchdown?: THREE.Vector3;
  normal?: THREE.Vector3;
  onComplete?: () => void;
};

function InsightModel() {
  const { scene } = useGLTF(MODEL_URL);
  const model = useMemo(() => normalizeLanderScene(scene), [scene]);
  return <primitive object={model} position={[0, -0.012, 0]} />;
}

export function LandingShip({
  active,
  parked = false,
  variant = "insight",
  lat,
  lon,
  touchdown,
  normal,
  onComplete,
}: LandingShipProps) {
  const isProbe = variant === "probe";
  const rigRef = useRef<THREE.Group>(null);
  const shipRef = useRef<THREE.Group>(null);
  const thrusterMat = useRef<THREE.MeshBasicMaterial>(null);
  const glowMat = useRef<THREE.MeshBasicMaterial>(null);
  const dustOuterMat = useRef<THREE.MeshBasicMaterial>(null);
  const dustInnerMat = useRef<THREE.MeshBasicMaterial>(null);
  const dustOuter = useRef<THREE.Mesh>(null);
  const dustInner = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const progressRef = useRef(0);
  const doneRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const path = useMemo((): LandingPath => {
    if (touchdown && normal) {
      return buildLandingPathAt(touchdown, normal, variant);
    }
    return buildLandingPath(lat ?? 0, lon ?? 0, variant);
  }, [lat, lon, normal, touchdown, variant]);

  useEffect(() => {
    progressRef.current = parked ? 1 : 0;
    doneRef.current = parked;
  }, [active, parked, path]);

  useFrame((_, delta) => {
    const rig = rigRef.current;
    const ship = shipRef.current;
    if (!rig || !ship) return;

    if (!active && parked) {
      rig.position.copy(path.touchdown);
      rig.quaternion.copy(path.landQuat);
      ship.rotation.set(0, 0, 0);
      if (thrusterMat.current) thrusterMat.current.opacity = 0;
      if (glowMat.current) glowMat.current.opacity = 0;
      if (dustOuterMat.current) dustOuterMat.current.opacity = 0;
      if (dustInnerMat.current) dustInnerMat.current.opacity = 0;
      if (lightRef.current) lightRef.current.intensity = 0;
      return;
    }

    if (!active) return;

    progressRef.current = Math.min(1, progressRef.current + delta / DURATION);
    const progress = progressRef.current;
    const approach = Math.min(progress / 0.58, 1);
    const descent =
      progress <= 0.58 ? 0 : Math.min((progress - 0.58) / 0.24, 1);
    const fade = progress <= 0.82 ? 0 : Math.min((progress - 0.82) / 0.18, 1);
    const approachEase = easeOutCubic(approach);
    const descentEase = easeInOutCubic(descent);
    const fadeEase = easeInOutCubic(fade);

    if (progress < 0.58) {
      rig.position.copy(
        cubicBezierPoint(
          approachEase,
          path.start,
          path.approachA,
          path.approachB,
          path.hover,
        ),
      );
    } else {
      rig.position.copy(
        cubicBezierPoint(
          descentEase,
          path.hover,
          path.descentA,
          path.descentB,
          path.touchdown,
        ),
      );
    }

    if (isProbe && progress >= 0.78) {
      rig.quaternion.copy(path.landQuat);
      ship.rotation.set(0, 0, 0);
    } else {
      const align = Math.min(1, progress * (isProbe ? 1.45 : 1.15));
      rig.quaternion.slerpQuaternions(path.startQuat, path.landQuat, align);
      const settle = progress < 0.72 ? 1 : 1 - (progress - 0.72) / 0.28;
      ship.rotation.y = isProbe
        ? Math.sin(progress * Math.PI * 1.6) * 0.018 * settle
        : -Math.PI * 0.08 + Math.sin(progress * Math.PI * 2.4) * 0.04;
      ship.rotation.z =
        Math.cos(progress * Math.PI * 1.8) * (isProbe ? 0.01 : 0.028) * settle;
      ship.rotation.x = isProbe
        ? Math.sin(progress * Math.PI * 1.2) * 0.008 * settle
        : 0;
    }

    const thrust =
      progress < 0.58
        ? 1
        : progress < 0.82
          ? 1 - descentEase * 0.55
          : 1 - fadeEase;
    const thrustMul = isProbe ? 0.45 : 1;
    if (thrusterMat.current) {
      thrusterMat.current.opacity = (0.08 + thrust * 0.38) * thrustMul;
    }
    if (glowMat.current) {
      glowMat.current.opacity = (0.06 + thrust * 0.22) * thrustMul;
    }
    if (lightRef.current) {
      lightRef.current.intensity = (0.35 + thrust * 0.55) * thrustMul;
    }

    const dust =
      progress < 0.58
        ? 0
        : progress < 0.9
          ? easeInOutCubic((progress - 0.58) / 0.32)
          : 1 - fadeEase;
    const dustMul = isProbe ? 0.4 : 1;
    if (dustOuterMat.current) {
      dustOuterMat.current.opacity = dust * 0.1 * dustMul;
    }
    if (dustInnerMat.current) {
      dustInnerMat.current.opacity = dust * 0.16 * dustMul;
    }
    if (dustOuter.current) {
      dustOuter.current.scale.setScalar(1 + dust * (isProbe ? 1.4 : 2.8));
    }
    if (dustInner.current) {
      dustInner.current.scale.setScalar(0.85 + dust * (isProbe ? 0.9 : 1.7));
    }

    if (progress < 1 || doneRef.current) return;
    doneRef.current = true;
    onCompleteRef.current?.();
  });

  if (!active && !parked) return null;

  return (
    <group>
      <group ref={rigRef}>
        <group ref={shipRef}>
          {isProbe ? <ProbeCraft /> : <InsightModel />}
        </group>
        <LandingThrusterFx
          isProbe={isProbe}
          thrusterMat={thrusterMat}
          glowMat={glowMat}
          lightRef={lightRef}
        />
      </group>
      <LandingDustFx
        isProbe={isProbe}
        touchdown={path.touchdown}
        surfaceQuat={path.surfaceQuat}
        dustOuterMat={dustOuterMat}
        dustInnerMat={dustInnerMat}
        dustOuter={dustOuter}
        dustInner={dustInner}
      />
    </group>
  );
}

useGLTF.preload(MODEL_URL);
