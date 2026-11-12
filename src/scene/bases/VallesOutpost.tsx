"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { Beacon } from "@/scene/bases/Beacon";

type VallesOutpostProps = {
  warm: THREE.Color;
  active: boolean;
};

export function VallesOutpost({ warm, active }: VallesOutpostProps) {
  const mastRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!mastRef.current) return;
    mastRef.current.rotation.y += 0.006;
  });

  return (
    <group>
      <mesh position={[0, 0.012, 0]}>
        <cylinderGeometry args={[0.2, 0.24, 0.024, 8]} />
        <meshStandardMaterial
          color="#24150f"
          roughness={0.86}
          metalness={0.26}
        />
      </mesh>
      <mesh position={[0, 0.13, 0]}>
        <boxGeometry args={[0.16, 0.1, 0.12]} />
        <meshPhysicalMaterial
          color="#c8c3b8"
          emissive={warm}
          emissiveIntensity={active ? 0.24 : 0.08}
          roughness={0.28}
          metalness={0.56}
        />
      </mesh>
      <group ref={mastRef} position={[0.02, 0.14, -0.01]}>
        <mesh position={[0, 0.16, 0]}>
          <cylinderGeometry args={[0.008, 0.01, 0.32, 6]} />
          <meshStandardMaterial
            color="#8d918f"
            roughness={0.42}
            metalness={0.84}
          />
        </mesh>
      </group>
      <Beacon color={warm} />
    </group>
  );
}
