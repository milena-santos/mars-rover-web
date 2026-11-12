import type { RefObject } from "react";
import * as THREE from "three";

type LandingThrusterFxProps = {
  isProbe: boolean;
  thrusterMat: RefObject<THREE.MeshBasicMaterial | null>;
  glowMat: RefObject<THREE.MeshBasicMaterial | null>;
  lightRef: RefObject<THREE.PointLight | null>;
};

export function LandingThrusterFx({
  isProbe,
  thrusterMat,
  glowMat,
  lightRef,
}: LandingThrusterFxProps) {
  return (
    <>
      <mesh
        position={[0, isProbe ? 0.04 : 0.08, 0]}
        rotation={[Math.PI, 0, 0]}
        scale={isProbe ? 0.55 : 1}
      >
        <cylinderGeometry args={[0.02, 0.11, 0.42, 16]} />
        <meshBasicMaterial
          ref={thrusterMat}
          color="#ff9a57"
          transparent
          opacity={0.5}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, isProbe ? 0.01 : 0.02, 0]} scale={isProbe ? 0.55 : 1}>
        <cylinderGeometry args={[0.09, 0.14, 0.08, 20]} />
        <meshBasicMaterial
          ref={glowMat}
          color="#ffd6b2"
          transparent
          opacity={0.28}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <pointLight
        ref={lightRef}
        color="#ffb77c"
        intensity={isProbe ? 0.55 : 1.2}
        distance={isProbe ? 1.2 : 2.4}
        decay={2}
        position={[0, 0.12, 0]}
      />
    </>
  );
}

type LandingDustFxProps = {
  isProbe: boolean;
  touchdown: THREE.Vector3;
  surfaceQuat: THREE.Quaternion;
  dustOuterMat: RefObject<THREE.MeshBasicMaterial | null>;
  dustInnerMat: RefObject<THREE.MeshBasicMaterial | null>;
  dustOuter: RefObject<THREE.Mesh | null>;
  dustInner: RefObject<THREE.Mesh | null>;
};

export function LandingDustFx({
  isProbe,
  touchdown,
  surfaceQuat,
  dustOuterMat,
  dustInnerMat,
  dustOuter,
  dustInner,
}: LandingDustFxProps) {
  return (
    <group position={touchdown.toArray()} quaternion={surfaceQuat}>
      <mesh
        ref={dustOuter}
        position={[0, 0.008, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={isProbe ? [0.08, 0.16, 40] : [0.2, 0.34, 48]} />
        <meshBasicMaterial
          ref={dustOuterMat}
          color="#b87848"
          transparent
          opacity={0}
          depthWrite={false}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
      <mesh
        ref={dustInner}
        position={[0, 0.01, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={isProbe ? [0.04, 0.09, 36] : [0.08, 0.2, 40]} />
        <meshBasicMaterial
          ref={dustInnerMat}
          color="#c88858"
          transparent
          opacity={0}
          depthWrite={false}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
