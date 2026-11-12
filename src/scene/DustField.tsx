import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { buildDustBelt, buildDustSprite } from "@/scene/dust/buildDust";

export function DustField() {
  const pointsRef = useRef<THREE.Points>(null);
  const sprite = useMemo(() => buildDustSprite(), []);
  const data = useMemo(() => buildDustBelt(2200), []);

  useFrame((_, delta) => {
    const points = pointsRef.current;
    if (!points) return;
    points.rotation.y += delta * 0.009;
    points.rotation.x += delta * 0.0018;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[data.positions, 3]}
        />
        <bufferAttribute attach="attributes-color" args={[data.colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.032}
        map={sprite}
        vertexColors
        transparent
        opacity={0.07}
        alphaTest={0.02}
        sizeAttenuation
        depthWrite={false}
        fog={false}
      />
    </points>
  );
}
