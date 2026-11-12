"use client";

import { useRef, useState } from "react";
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import {
  ORBITAL_STATIONS,
  ORBITAL_TILT,
  type OrbitalStationDef,
} from "@/lib/stations";
import { OrbitalCraft } from "@/scene/OrbitalCraft";

function OrbitRing({ radius }: { radius: number }) {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[radius - 0.01, radius + 0.01, 128]} />
      <meshBasicMaterial
        color="#c96a46"
        opacity={0.07}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

function OrbitalNode({
  station,
  dimmed,
}: {
  station: OrbitalStationDef;
  dimmed: boolean;
}) {
  const orbitRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    if (!orbitRef.current) return;
    const factor = hovered ? 0.2 : 1;
    orbitRef.current.rotation.y += delta * station.orbitSpeed * factor;
  });

  return (
    <group rotation={[station.orbitTilt, 0, 0]}>
      <OrbitRing radius={station.orbitRadius} />
      <group ref={orbitRef} rotation={[0, station.phase, 0]}>
        <group position={[station.orbitRadius, 0, 0]} scale={station.size}>
          <group visible={!dimmed}>
            <OrbitalCraft color={station.color} active={hovered} />
          </group>
          <Html center style={{ pointerEvents: "none" }} zIndexRange={[15, 0]}>
            <button
              type="button"
              className={`orbit-marker ${hovered ? "is-hovered" : ""}`}
              style={{
                opacity: dimmed ? 0 : 1,
                pointerEvents: dimmed ? "none" : "auto",
                ["--orbit-color" as string]: station.color,
              }}
              onPointerEnter={() => setHovered(true)}
              onPointerLeave={() => setHovered(false)}
            >
              <span className="orbit-marker-line" aria-hidden />
              <span className="orbit-marker-card">
                <span>{station.code}</span>
                <strong>{station.label}</strong>
              </span>
            </button>
          </Html>
        </group>
      </group>
    </group>
  );
}

type OrbitalFleetProps = {
  dimmed?: boolean;
};

export function OrbitalFleet({ dimmed = false }: OrbitalFleetProps) {
  return (
    <group rotation={[ORBITAL_TILT, 0, 0]}>
      {ORBITAL_STATIONS.map((station) => (
        <OrbitalNode key={station.id} station={station} dimmed={dimmed} />
      ))}
    </group>
  );
}
