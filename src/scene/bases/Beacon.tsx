"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type BeaconProps = {
  color: THREE.Color;
};

export function Beacon({ color }: BeaconProps) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const mesh = ref.current;
    if (!mesh) return;
    const pulse = 0.35 + Math.sin(state.clock.elapsedTime * 2.2) * 0.2;
    const material = mesh.material as THREE.MeshStandardMaterial;
    material.emissiveIntensity = 0.25 + pulse * 0.35;
  });

  return (
    <mesh ref={ref} position={[0, 0.46, 0]}>
      <sphereGeometry args={[0.018, 12, 12]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.4}
        metalness={0.2}
        roughness={0.45}
      />
    </mesh>
  );
}
