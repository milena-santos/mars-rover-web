"use client";

import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

const ISS_URL = "/models/iss-a.glb";

type OrbitalCraftProps = {
  color: string;
  active: boolean;
};

export function OrbitalCraft({ color, active }: OrbitalCraftProps) {
  const { scene } = useGLTF(ISS_URL);
  const warm = useMemo(() => new THREE.Color(color), [color]);
  const model = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((node) => {
      if (!(node instanceof THREE.Mesh) || !node.material) return;
      const source = Array.isArray(node.material)
        ? node.material
        : [node.material];
      const next = source.map((item) => {
        const material = item.clone();
        if (!(material instanceof THREE.MeshStandardMaterial)) return material;
        material.color = material.color
          .clone()
          .lerp(new THREE.Color("#d7d2c7"), 0.22);
        material.roughness = 0.34;
        material.metalness = 0.86;
        return material;
      });
      node.material = next.length === 1 ? next[0] : next;
    });
    return clone;
  }, [scene]);

  return (
    <group scale={0.018}>
      <primitive object={model} />
      <pointLight
        color={warm}
        intensity={active ? 1.1 : 0.55}
        distance={2.4}
        decay={2}
      />
      <mesh position={[0.32, 0.76, 0.18]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshBasicMaterial
          color={warm}
          transparent
          opacity={0.76}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

useGLTF.preload(ISS_URL);
