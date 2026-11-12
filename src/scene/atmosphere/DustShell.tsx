import { useMemo } from "react";
import * as THREE from "three";

import { atmosFragment, atmosVertex } from "@/scene/atmosphere/shaders";

export type DustShellProps = {
  scale: number;
  color: string;
  power: number;
  intensity: number;
  minAlpha: number;
  noiseScale: number;
  bandStrength: number;
  bandWidth: number;
  breakup: number;
  altitudeFade: number;
  side?: THREE.Side;
};

export function DustShell({
  scale,
  color,
  power,
  intensity,
  minAlpha,
  noiseScale,
  bandStrength,
  bandWidth,
  breakup,
  altitudeFade,
  side = THREE.BackSide,
}: DustShellProps) {
  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(color) },
      uPower: { value: power },
      uIntensity: { value: intensity },
      uMinAlpha: { value: minAlpha },
      uNoiseScale: { value: noiseScale },
      uBandStrength: { value: bandStrength },
      uBandWidth: { value: bandWidth },
      uBreakup: { value: breakup },
      uAltitudeFade: { value: altitudeFade },
    }),
    [
      altitudeFade,
      bandStrength,
      bandWidth,
      breakup,
      color,
      intensity,
      minAlpha,
      noiseScale,
      power,
    ],
  );

  return (
    <mesh scale={scale}>
      <sphereGeometry args={[2, 96, 96]} />
      <shaderMaterial
        vertexShader={atmosVertex}
        fragmentShader={atmosFragment}
        uniforms={uniforms}
        side={side}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}
