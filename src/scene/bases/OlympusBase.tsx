import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { Beacon } from "@/scene/bases/Beacon";

type OlympusBaseProps = {
  warm: THREE.Color;
  active: boolean;
};

export function OlympusBase({ warm, active }: OlympusBaseProps) {
  const antennaRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!antennaRef.current) return;
    antennaRef.current.rotation.y += 0.012;
  });

  return (
    <group>
      <mesh position={[0, 0.012, 0]}>
        <cylinderGeometry args={[0.18, 0.22, 0.025, 6]} />
        <meshStandardMaterial
          color="#2a1810"
          roughness={0.85}
          metalness={0.3}
        />
      </mesh>
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.05, 0.07, 0.13, 8]} />
        <meshStandardMaterial color="#3a2418" roughness={0.7} metalness={0.5} />
      </mesh>
      <mesh position={[0, 0.18, 0]}>
        <sphereGeometry args={[0.08, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial
          color="#d0c8b8"
          emissive={warm}
          emissiveIntensity={active ? 0.18 : 0.06}
          roughness={0.24}
          metalness={0.64}
          clearcoat={0.9}
        />
      </mesh>
      <group ref={antennaRef} position={[0, 0.18, 0]}>
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.006, 0.008, 0.24, 6]} />
          <meshStandardMaterial
            color="#888888"
            roughness={0.5}
            metalness={0.8}
          />
        </mesh>
        <mesh position={[0.04, 0.24, 0]} rotation={[0, 0, -0.5]}>
          <cylinderGeometry args={[0.05, 0.02, 0.005, 16]} />
          <meshStandardMaterial
            color="#b7b3ac"
            roughness={0.26}
            metalness={0.88}
          />
        </mesh>
      </group>
      <Beacon color={warm} />
    </group>
  );
}
