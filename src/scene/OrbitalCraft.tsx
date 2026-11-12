import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

import { tintStandardMaterials } from "@/scene/tintMaterials";

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
    tintStandardMaterials(clone, {
      mixAmount: 0.22,
      roughness: 0.34,
      metalness: 0.86,
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
