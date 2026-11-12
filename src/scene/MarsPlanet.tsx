import { useEffect, useRef } from "react";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";

import { DustShell } from "@/scene/atmosphere/DustShell";
import { MARS_SHELLS } from "@/scene/atmosphere/shells";

type MarsPlanetProps = {
  spinning?: boolean;
};

export function MarsPlanet({ spinning = true }: MarsPlanetProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { gl } = useThree();
  const albedo = useLoader(
    THREE.TextureLoader,
    "/textures/mars-color-nasa.jpg",
  );

  useEffect(() => {
    albedo.colorSpace = THREE.SRGBColorSpace;
    albedo.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
    albedo.wrapS = THREE.RepeatWrapping;
    albedo.wrapT = THREE.ClampToEdgeWrapping;
    albedo.needsUpdate = true;
  }, [albedo, gl]);

  useFrame((_, delta) => {
    if (!spinning || !groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.035;
  });

  return (
    <group ref={groupRef}>
      {MARS_SHELLS.map((shell) => (
        <DustShell key={shell.scale} {...shell} />
      ))}
      <mesh>
        <sphereGeometry args={[2, 128, 128]} />
        <meshStandardMaterial
          map={albedo}
          roughness={0.94}
          metalness={0.03}
          color="#f0d0a8"
          bumpMap={albedo}
          bumpScale={0.04}
        />
      </mesh>
    </group>
  );
}
