import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import {
  fillBurstLayer,
  makeBurstGeometry,
  stepEmbers,
  stepSmoke,
} from "@/scene/collision/burstParticles";
import { makeSoftDisc } from "@/scene/collision/softDisc";

type CollisionBurstProps = {
  position: [number, number, number];
  normal: [number, number, number];
  onDone?: () => void;
};

const EMBERS = 48;
const SMOKE = 36;
const DURATION = 1.55;

export function CollisionBurst({
  position,
  normal,
  onDone,
}: CollisionBurstProps) {
  const flashRef = useRef<THREE.Mesh>(null);
  const flashMat = useRef<THREE.MeshBasicMaterial>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const ringMat = useRef<THREE.MeshBasicMaterial>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const emberRef = useRef<THREE.Points>(null);
  const smokeRef = useRef<THREE.Points>(null);
  const progressRef = useRef(0);
  const doneRef = useRef(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  const nVec = useMemo(
    () => new THREE.Vector3(...normal).normalize(),
    [normal],
  );
  const softMap = useMemo(() => makeSoftDisc(), []);
  const embers = useMemo(
    () => fillBurstLayer(EMBERS, nVec, 0.28, 0.75, 0.15, 0.85),
    [nVec],
  );
  const smoke = useMemo(
    () => fillBurstLayer(SMOKE, nVec, 0.1, 0.35, 0.1, 0.5),
    [nVec],
  );
  const ringQuat = useMemo(
    () =>
      new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 0, 1),
        nVec,
      ),
    [nVec],
  );
  const emberGeo = useMemo(() => makeBurstGeometry(embers), [embers]);
  const smokeGeo = useMemo(() => makeBurstGeometry(smoke), [smoke]);

  useEffect(() => {
    return () => {
      softMap.dispose();
      emberGeo.dispose();
      smokeGeo.dispose();
    };
  }, [emberGeo, softMap, smokeGeo]);

  useFrame((_, delta) => {
    progressRef.current = Math.min(1, progressRef.current + delta / DURATION);
    const t = progressRef.current;
    const punch = Math.min(1, t / 0.12);

    if (flashRef.current && flashMat.current) {
      flashRef.current.scale.setScalar(0.04 + punch * 0.2 * (1 - t * 0.75));
      flashMat.current.opacity = Math.max(0, (1 - t * 2.2) * 0.45);
    }
    if (ringRef.current && ringMat.current) {
      ringRef.current.scale.setScalar(0.18 + t * 1.8);
      ringMat.current.opacity = Math.max(0, (1 - t) * 0.28);
    }
    if (lightRef.current) {
      lightRef.current.intensity = Math.max(0, (1 - t * 1.9) * 3.2);
    }

    stepEmbers(embers, emberRef.current, t, nVec);
    stepSmoke(smoke, smokeRef.current, t, nVec);

    if (emberRef.current) {
      const mat = emberRef.current.material as THREE.PointsMaterial;
      mat.size = 0.1 * (1.05 - t * 0.4);
      mat.opacity = Math.max(0, 0.75 * (1 - t * 0.9));
    }
    if (smokeRef.current) {
      const mat = smokeRef.current.material as THREE.PointsMaterial;
      mat.size = 0.22 + t * 0.4;
      mat.opacity = Math.max(0, 0.38 * (1 - t));
    }

    if (t < 1 || doneRef.current) return;
    doneRef.current = true;
    onDoneRef.current?.();
  });

  return (
    <group position={position}>
      <mesh ref={flashRef}>
        <sphereGeometry args={[1, 20, 20]} />
        <meshBasicMaterial
          ref={flashMat}
          color="#e07030"
          transparent
          opacity={0.4}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={ringRef} quaternion={ringQuat}>
        <ringGeometry args={[0.14, 0.22, 48]} />
        <meshBasicMaterial
          ref={ringMat}
          color="#c45a28"
          transparent
          opacity={0.3}
          depthWrite={false}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>

      <points ref={emberRef} geometry={emberGeo}>
        <pointsMaterial
          map={softMap}
          size={0.1}
          sizeAttenuation
          vertexColors
          transparent
          depthWrite={false}
          blending={THREE.NormalBlending}
          toneMapped={false}
          opacity={0.75}
        />
      </points>
      <points ref={smokeRef} geometry={smokeGeo}>
        <pointsMaterial
          map={softMap}
          size={0.24}
          sizeAttenuation
          vertexColors
          transparent
          depthWrite={false}
          blending={THREE.NormalBlending}
          toneMapped={false}
          opacity={0.35}
        />
      </points>

      <pointLight
        ref={lightRef}
        color="#d45a28"
        intensity={3}
        distance={2.6}
        decay={2}
      />
    </group>
  );
}
