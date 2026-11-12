import { useState } from "react";
import { Html } from "@react-three/drei";
import * as THREE from "three";

import {
  MISSION_REGIONS,
  surfacePoint,
  type MissionRegion,
} from "@/lib/regions";
import { orientationFromNormal, surfaceNormal } from "@/lib/surfaceMath";
import { SurfaceBase, type BaseVariant } from "@/scene/SurfaceBase";

type RegionMarkersProps = {
  selectedId: string | null;
  locked: boolean;
  showLabels?: boolean;
  onSelect: (region: MissionRegion) => void;
};

const VARIANT_BY_REGION: Record<string, BaseVariant> = {
  olympus: "olympus",
  valles: "valles",
  hellas: "hellas",
};

export function RegionMarkers({
  selectedId,
  locked,
  showLabels = true,
  onSelect,
}: RegionMarkersProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <group>
      {MISSION_REGIONS.map((region) => {
        const normal = surfaceNormal(region.lat, region.lon);
        const position = new THREE.Vector3(
          ...surfacePoint(region.lat, region.lon, 2.001),
        );
        const active = region.id === selectedId;
        const hovered = hoveredId === region.id;
        const dimmed = Boolean(selectedId) && !active;
        const variant = VARIANT_BY_REGION[region.id] ?? "olympus";
        const showName = showLabels && (active || hovered) && !dimmed;

        return (
          <group
            key={region.id}
            position={position.toArray()}
            quaternion={orientationFromNormal(normal)}
            onClick={(event) => {
              event.stopPropagation();
              if (!locked) onSelect(region);
            }}
            onPointerOver={(event) => {
              event.stopPropagation();
              if (!locked && !dimmed) setHoveredId(region.id);
            }}
            onPointerOut={() => {
              setHoveredId((current) =>
                current === region.id ? null : current,
              );
            }}
          >
            <group visible={!dimmed} scale={active ? 0.62 : 0.55}>
              <SurfaceBase
                variant={variant}
                color={region.color}
                active={active || hovered}
              />
            </group>
            {showLabels ? (
              <Html
                center
                position={[0, 0.22, 0]}
                zIndexRange={[20, 0]}
                style={{ pointerEvents: "none" }}
              >
                <button
                  type="button"
                  className={`region-pin ${showName ? "is-open" : ""} ${active ? "is-active" : ""}`}
                  aria-label={region.name}
                  style={{
                    opacity: dimmed ? 0 : 1,
                    pointerEvents: locked || dimmed ? "none" : "auto",
                    ["--pin-color" as string]: region.color,
                  }}
                  onClick={(event) => {
                    event.stopPropagation();
                    if (!locked) onSelect(region);
                  }}
                  onPointerEnter={() => {
                    if (!locked && !dimmed) setHoveredId(region.id);
                  }}
                  onPointerLeave={() => {
                    setHoveredId((current) =>
                      current === region.id ? null : current,
                    );
                  }}
                >
                  <span className="region-pin-name">{region.name}</span>
                </button>
              </Html>
            ) : null}
          </group>
        );
      })}
    </group>
  );
}
