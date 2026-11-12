import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

import {
  animateDelivery,
  animateIntroLanding,
  muteLandingFx,
} from "@/scene/landing/landingAnim";
import {
  buildLandingPath,
  buildLandingPathAt,
  type LandingPath,
} from "@/scene/landing/landingPath";
import { LandingDustFx, LandingThrusterFx } from "@/scene/landing/LandingFx";
import { normalizeLanderScene } from "@/scene/landing/landerModel";
import { ProbeCraft } from "@/scene/ProbeCraft";

const MODEL_URL = "/models/insight-lander.glb";
const INTRO_DURATION = 3.15;
const DELIVERY_DURATION = 5.2;
const CRASH_DURATION = DELIVERY_DURATION * 0.58;

type LandingShipProps = {
  active: boolean;
  parked?: boolean;
  variant?: "insight" | "probe";
  crash?: boolean;
  lat?: number;
  lon?: number;
  touchdown?: THREE.Vector3;
  normal?: THREE.Vector3;
  onDrop?: () => void;
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
  crash = false,
  lat,
  lon,
  touchdown,
  normal,
  onDrop,
  onComplete,
}: LandingShipProps) {
  const isDelivery = variant === "probe";
  const duration = crash
    ? CRASH_DURATION
    : isDelivery
      ? DELIVERY_DURATION
      : INTRO_DURATION;

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
  const droppedRef = useRef(false);
  const onDropRef = useRef(onDrop);
  const onCompleteRef = useRef(onComplete);
  onDropRef.current = onDrop;
  onCompleteRef.current = onComplete;

  const fx = useMemo(
    () => ({
      thrusterMat,
      glowMat,
      lightRef,
      dustOuterMat,
      dustInnerMat,
      dustOuter,
      dustInner,
    }),
    [],
  );

  const pathSeed = useMemo(() => Math.random() * 10_000, []);
  const path = useMemo((): LandingPath => {
    if (touchdown && normal) {
      return buildLandingPathAt(touchdown, normal, variant, pathSeed);
    }
    return buildLandingPath(lat ?? 0, lon ?? 0, variant, pathSeed);
  }, [lat, lon, normal, pathSeed, touchdown, variant]);

  useEffect(() => {
    progressRef.current = parked ? 1 : 0;
    doneRef.current = parked;
    droppedRef.current = false;
  }, [active, parked, path]);

  useFrame((_, delta) => {
    const rig = rigRef.current;
    const ship = shipRef.current;
    if (!rig || !ship) return;

    if (!active && parked) {
      rig.position.copy(path.touchdown);
      rig.quaternion.copy(path.landQuat);
      ship.rotation.set(0, 0, 0);
      ship.scale.setScalar(1);
      muteLandingFx(fx);
      return;
    }

    if (!active) return;

    progressRef.current = Math.min(1, progressRef.current + delta / duration);
    const progress = progressRef.current;

    if (isDelivery) {
      animateDelivery({
        progress,
        path,
        rig,
        ship,
        crash,
        fx,
        droppedRef,
        onDropRef,
      });
    } else {
      animateIntroLanding({ progress, path, rig, ship, fx });
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
          {isDelivery ? <ProbeCraft /> : <InsightModel />}
        </group>
        <LandingThrusterFx
          isProbe={isDelivery}
          thrusterMat={thrusterMat}
          glowMat={glowMat}
          lightRef={lightRef}
        />
      </group>
      <LandingDustFx
        isProbe={isDelivery}
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
