import * as THREE from "three";

import type { DustShellProps } from "@/scene/atmosphere/DustShell";

export const MARS_SHELLS: DustShellProps[] = [
  {
    scale: 1.042,
    color: "#7d3e1f",
    power: 2.1,
    intensity: 0.12,
    minAlpha: 0.012,
    noiseScale: 6.4,
    bandStrength: 0.82,
    bandWidth: 0.72,
    breakup: 0.46,
    altitudeFade: 0.5,
    side: THREE.DoubleSide,
  },
  {
    scale: 1.1,
    color: "#904827",
    power: 1.42,
    intensity: 0.1,
    minAlpha: 0.014,
    noiseScale: 4.2,
    bandStrength: 0.58,
    bandWidth: 0.9,
    breakup: 0.36,
    altitudeFade: 0.28,
  },
  {
    scale: 1.21,
    color: "#64311e",
    power: 0.98,
    intensity: 0.055,
    minAlpha: 0.01,
    noiseScale: 3,
    bandStrength: 0.22,
    bandWidth: 1,
    breakup: 0.28,
    altitudeFade: 0,
  },
];
