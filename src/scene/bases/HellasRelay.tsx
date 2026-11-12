"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { Beacon } from "@/scene/bases/Beacon";

type HellasRelayProps = {
  warm: THREE.Color;
  active: boolean;
};

export function HellasRelay({ warm, active }: HellasRelayProps) {
  const ringRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!ringRef.current) return;
    ringRef.current.rotation.y += 0.01;
    ringRef.current.rotation.x =
      0.14 + Math.sin(state.clock.elapsedTime * 1.2) * 0.08;
  });

  return (
    <group>
      <mesh position={[0, 0.014, 0]}>
        <cylinderGeometry args={[0.21, 0.24, 0.028, 8]} />
        <meshStandardMaterial color="#22140e" roughness={0.86} metalness={0.24} />
      </mesh>
      <mesh position={[0, 0.19, 0]}>
        <cylinderGeometry args={[0.065, 0.085, 0.16, 8]} />
        <meshPhysicalMaterial
          color="#d6d0c7"
          emissive={warm}
          emissiveIntensity={active ? 0.26 : 0.1}
          roughness={0.2}
          metalness={0.62}
        />
      </mesh>
      <group ref={ringRef} position={[0, 0.28, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.1, 0.122, 36]} />
          <meshBasicMaterial
            color={warm}
            transparent
            opacity={active ? 0.48 : 0.26}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>
      </group>
      <Beacon color={warm} />
    </group>
  );
}
