import { useMemo } from "react";
import * as THREE from "three";

import { HellasRelay } from "@/scene/bases/HellasRelay";
import { OlympusBase } from "@/scene/bases/OlympusBase";
import { VallesOutpost } from "@/scene/bases/VallesOutpost";

export type BaseVariant = "olympus" | "valles" | "hellas";

type SurfaceBaseProps = {
  variant: BaseVariant;
  color: string;
  active?: boolean;
};

const BASE_BY_VARIANT = {
  olympus: OlympusBase,
  valles: VallesOutpost,
  hellas: HellasRelay,
} as const;

export function SurfaceBase({
  variant,
  color,
  active = false,
}: SurfaceBaseProps) {
  const warm = useMemo(() => new THREE.Color(color), [color]);
  const Base = BASE_BY_VARIANT[variant];
  return <Base warm={warm} active={active} />;
}
