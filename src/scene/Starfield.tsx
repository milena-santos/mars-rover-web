"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type StarLayer = {
  count: number;
  radiusMin: number;
  radiusSpan: number;
  size: number;
  opacity: number;
  twinkle: number;
  spin: number;
};

const LAYERS: StarLayer[] = [
  {
    count: 7200,
    radiusMin: 14,
    radiusSpan: 16,
    size: 0.035,
    opacity: 0.85,
    twinkle: 0.04,
    spin: 0.00007,
  },
  {
    count: 2800,
    radiusMin: 12,
    radiusSpan: 14,
    size: 0.06,
    opacity: 0.98,
    twinkle: 0.09,
    spin: 0.00012,
  },
  {
    count: 520,
    radiusMin: 11,
    radiusSpan: 12,
    size: 0.11,
    opacity: 1,
    twinkle: 0.14,
    spin: 0.00018,
  },
];

function paintStarColor(tmp: THREE.Color, roll: number): void {
  if (roll < 0.74) {
    tmp.setHSL(0.0, 0.0, 0.88 + Math.random() * 0.12);
    return;
  }
  if (roll < 0.88) {
    tmp.setHSL(0.08, 0.4, 0.74 + Math.random() * 0.1);
    return;
  }
  tmp.setHSL(0.58, 0.36, 0.8 + Math.random() * 0.1);
}

function buildLayer(layer: StarLayer) {
  const positions = new Float32Array(layer.count * 3);
  const colors = new Float32Array(layer.count * 3);
  const tmp = new THREE.Color();
  let i = 0;
  while (i < layer.count) {
    const r = layer.radiusMin + Math.random() * layer.radiusSpan;
    const theta = Math.acos(2 * Math.random() - 1);
    const phi = Math.random() * Math.PI * 2;
    positions[i * 3] = r * Math.sin(theta) * Math.cos(phi);
    positions[i * 3 + 1] = r * Math.cos(theta);
    positions[i * 3 + 2] = r * Math.sin(theta) * Math.sin(phi);

    paintStarColor(tmp, Math.random());
    colors[i * 3] = tmp.r;
    colors[i * 3 + 1] = tmp.g;
    colors[i * 3 + 2] = tmp.b;
    i += 1;
  }
  return { positions, colors };
}

function StarLayerPoints({ layer }: { layer: StarLayer }) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);
  const data = useMemo(() => buildLayer(layer), [layer]);

  useFrame(({ clock }) => {
    const points = pointsRef.current;
    const material = materialRef.current;
    if (!points || !material) return;
    points.rotation.y += layer.spin;
    material.opacity =
      layer.opacity +
      Math.sin(clock.elapsedTime * (0.65 + layer.twinkle * 3.5)) *
        layer.twinkle;
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
        ref={materialRef}
        size={layer.size}
        vertexColors
        sizeAttenuation
        transparent
        opacity={layer.opacity}
        depthWrite={false}
        fog={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function MilkyBand() {
  const pointsRef = useRef<THREE.Points>(null);
  const data = useMemo(() => {
    const count = 2200;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const tmp = new THREE.Color();
    let i = 0;
    while (i < count) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const band = (Math.random() - 0.5) * 0.7;
      const r = 16 + Math.random() * 12;
      positions[i * 3] = Math.cos(angle) * r;
      positions[i * 3 + 1] = Math.sin(band) * (3.2 + Math.random() * 4);
      positions[i * 3 + 2] = Math.sin(angle) * r;
      tmp.setHSL(0.62, 0.2 + Math.random() * 0.22, 0.58 + Math.random() * 0.28);
      colors[i * 3] = tmp.r;
      colors[i * 3 + 1] = tmp.g;
      colors[i * 3 + 2] = tmp.b;
      i += 1;
    }
    return { positions, colors };
  }, []);

  useFrame(() => {
    const points = pointsRef.current;
    if (!points) return;
    points.rotation.z += 0.00005;
    points.rotation.y += 0.00004;
  });

  return (
    <points ref={pointsRef} rotation={[0.35, 0.2, 0.15]}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[data.positions, 3]}
        />
        <bufferAttribute attach="attributes-color" args={[data.colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.048}
        vertexColors
        sizeAttenuation
        transparent
        opacity={0.58}
        depthWrite={false}
        fog={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export function Starfield() {
  return (
    <group>
      <MilkyBand />
      {LAYERS.map((layer) => (
        <StarLayerPoints key={`${layer.count}-${layer.size}`} layer={layer} />
      ))}
    </group>
  );
}
