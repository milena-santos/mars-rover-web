"use client";

import { useEffect, useRef, useState } from "react";
import { OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";

type CameraRigProps = {
  position: [number, number, number];
  target: [number, number, number];
  orbitEnabled: boolean;
  fov?: number;
};

export function CameraRig({
  position,
  target,
  orbitEnabled,
  fov = 42,
}: CameraRigProps) {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const desiredPos = useRef(new THREE.Vector3(...position));
  const lookAt = useRef(new THREE.Vector3(...target));
  const [focusing, setFocusing] = useState(false);
  const focusKey = `${position.join(",")}|${target.join(",")}|${fov}`;
  const lastFocusRef = useRef("");

  useEffect(() => {
    desiredPos.current.set(...position);
    lookAt.current.set(...target);
    if ("fov" in camera) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
    if (lastFocusRef.current === focusKey) return;
    lastFocusRef.current = focusKey;
    setFocusing(true);
    const timer = window.setTimeout(() => setFocusing(false), 1400);
    return () => window.clearTimeout(timer);
  }, [camera, focusKey, fov, position, target]);

  useFrame((_, delta) => {
    const controls = controlsRef.current;
    if (focusing) {
      const alpha = 1 - Math.exp(-delta * 2.2);
      camera.position.lerp(desiredPos.current, alpha);
      if (controls) {
        controls.target.lerp(lookAt.current, 0.2);
        controls.update();
      }
      return;
    }
    if (controls) controls.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enabled={orbitEnabled}
      enableRotate={orbitEnabled && !focusing}
      enableZoom
      enablePan={false}
      enableDamping
      dampingFactor={0.08}
      zoomSpeed={0.72}
      rotateSpeed={0.42}
      minDistance={2.7}
      maxDistance={15}
      minPolarAngle={0.25}
      maxPolarAngle={Math.PI - 0.25}
    />
  );
}
