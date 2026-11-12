"use client";

import type { MissionRegion } from "@/lib/regions";
import {
  orientationFromNormal,
  plateauCellSize,
  plateauToWorld,
} from "@/lib/surfaceMath";
import type { Direction, Plateau, Probe } from "@/lib/types";
import { PlateauPad } from "@/scene/PlateauPad";
import { RoverBody } from "@/scene/RoverBody";

type ProbeMarkersProps = {
  region: MissionRegion;
  plateau: Plateau;
  probes: Probe[];
  selectedId: string | null;
  hiddenId?: string | null;
  onSelect: (id: string) => void;
};

const YAW: Record<Direction, number> = {
  NORTH: 0,
  EAST: Math.PI / 2,
  SOUTH: Math.PI,
  WEST: -Math.PI / 2,
};

export function ProbeMarkers({
  region,
  plateau,
  probes,
  selectedId,
  hiddenId = null,
  onSelect,
}: ProbeMarkersProps) {
  const roverScale = Math.min(
    Math.max(plateauCellSize(plateau) * 2.4, 0.22),
    0.36,
  );

  return (
    <group>
      <PlateauPad region={region} plateau={plateau} />
      {probes.map((probe) => {
        if (probe.id === hiddenId) return null;
        const position = plateauToWorld(region, plateau, probe.x, probe.y);
        const quat = orientationFromNormal(position.clone().normalize());
        const selected = probe.id === selectedId;

        return (
          <group key={probe.id} position={position.toArray()} quaternion={quat}>
            <group
              rotation={[0, YAW[probe.direction], 0]}
              onClick={(event) => {
                event.stopPropagation();
                onSelect(probe.id);
              }}
            >
              <RoverBody
                color={region.color}
                selected={selected}
                scale={roverScale}
              />
            </group>
          </group>
        );
      })}
    </group>
  );
}
