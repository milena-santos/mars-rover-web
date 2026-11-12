"use client";

import { useMemo } from "react";
import * as THREE from "three";

import type { MissionRegion } from "@/lib/regions";
import { plateauToWorld } from "@/lib/surfaceMath";
import type { Plateau } from "@/lib/types";

type PlateauPadProps = {
  region: MissionRegion;
  plateau: Plateau;
};

const FILL_LIFT = 0.0014;
const LINE_LIFT = 0.0018;

function buildFillGeometry(
  region: MissionRegion,
  plateau: Plateau,
): THREE.BufferGeometry {
  const positions: number[] = [];
  const indices: number[] = [];

  for (let y = 0; y < plateau.maxY; y += 1) {
    for (let x = 0; x < plateau.maxX; x += 1) {
      const a = plateauToWorld(region, plateau, x, y, FILL_LIFT);
      const b = plateauToWorld(region, plateau, x + 1, y, FILL_LIFT);
      const c = plateauToWorld(region, plateau, x + 1, y + 1, FILL_LIFT);
      const d = plateauToWorld(region, plateau, x, y + 1, FILL_LIFT);
      const base = positions.length / 3;
      for (const point of [a, b, c, d]) {
        positions.push(point.x, point.y, point.z);
      }
      indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function buildGridGeometry(
  region: MissionRegion,
  plateau: Plateau,
): THREE.BufferGeometry {
  const points: THREE.Vector3[] = [];
  for (let x = 0; x <= plateau.maxX; x += 1) {
    points.push(plateauToWorld(region, plateau, x, 0, LINE_LIFT));
    points.push(plateauToWorld(region, plateau, x, plateau.maxY, LINE_LIFT));
  }
  for (let y = 0; y <= plateau.maxY; y += 1) {
    points.push(plateauToWorld(region, plateau, 0, y, LINE_LIFT));
    points.push(plateauToWorld(region, plateau, plateau.maxX, y, LINE_LIFT));
  }
  return new THREE.BufferGeometry().setFromPoints(points);
}

export function PlateauPad({ region, plateau }: PlateauPadProps) {
  const fill = useMemo(
    () => buildFillGeometry(region, plateau),
    [plateau, region],
  );
  const grid = useMemo(
    () => buildGridGeometry(region, plateau),
    [plateau, region],
  );
  const dust = useMemo(
    () => new THREE.Color("#5f3b2a").lerp(new THREE.Color(region.color), 0.12),
    [region.color],
  );
  const lineColor = useMemo(
    () => new THREE.Color("#3a2419").lerp(new THREE.Color(region.color), 0.12),
    [region.color],
  );

  return (
    <group>
      <mesh geometry={fill} receiveShadow>
        <meshStandardMaterial
          color={dust}
          roughness={0.98}
          metalness={0.02}
          transparent
          opacity={0.42}
          depthWrite={false}
          side={THREE.DoubleSide}
          polygonOffset
          polygonOffsetFactor={-2}
        />
      </mesh>
      <lineSegments geometry={grid}>
        <lineBasicMaterial
          color={lineColor}
          transparent
          opacity={0.4}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  );
}
