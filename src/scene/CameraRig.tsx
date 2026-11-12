"use client";

import { useEffect, useRef, useState } from "react";
import { OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";

const MARS_R = 2;
const MIN_CAMERA_RADIUS = MARS_R + 0.55;
const MIN_SURFACE_HEIGHT = 0.28;

type CameraRigProps = {
  position: [number, number, number];
  target: [number, number, number];
  orbitEnabled: boolean;
  fov?: number;
};

function keepOutsidePlanet(camera: THREE.Camera) {
  if (camera.position.length() < MIN_CAMERA_RADIUS) {
    camera.position.setLength(MIN_CAMERA_RADIUS);
  }
}

function keepAboveSurface(
  camera: THREE.Camera,
  target: THREE.Vector3,
  scratch: {
    normal: THREE.Vector3;
    offset: THREE.Vector3;
    tangential: THREE.Vector3;
    side: THREE.Vector3;
  },
) {
  if (target.lengthSq() < (MARS_R * 0.5) ** 2) return;

  const { normal, offset, tangential, side } = scratch;
  normal.copy(target).normalize();
  offset.copy(camera.position).sub(target);
  const height = offset.dot(normal);
  if (height >= MIN_SURFACE_HEIGHT) return;

  tangential.copy(offset).addScaledVector(normal, -height);
  if (tangential.lengthSq() < 1e-8) {
    side.set(0, 1, 0).cross(normal);
    if (side.lengthSq() < 1e-8) side.set(1, 0, 0).cross(normal);
    tangential.copy(side).normalize().multiplyScalar(0.85);
  }

  camera.position
    .copy(target)
    .add(tangential)
    .addScaledVector(normal, MIN_SURFACE_HEIGHT);
  keepOutsidePlanet(camera);
}

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
  const scratch = useRef({
    normal: new THREE.Vector3(),
    offset: new THREE.Vector3(),
    tangential: new THREE.Vector3(),
    side: new THREE.Vector3(),
  });
  const [focusing, setFocusing] = useState(false);
  const focusKey = `${position.join(",")}|${target.join(",")}|${fov}`;
  const lastFocusRef = useRef("");
  const surfaceFocus =
    Math.hypot(target[0], target[1], target[2]) > MARS_R * 0.5;

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
      keepOutsidePlanet(camera);
      keepAboveSurface(
        camera,
        controls?.target ?? lookAt.current,
        scratch.current,
      );
      return;
    }

    if (controls) controls.update();
    keepOutsidePlanet(camera);
    keepAboveSurface(
      camera,
      controls?.target ?? lookAt.current,
      scratch.current,
    );
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
      minDistance={surfaceFocus ? 0.65 : 2.7}
      maxDistance={surfaceFocus ? 4.8 : 15}
      minPolarAngle={0.35}
      maxPolarAngle={Math.PI - 0.45}
    />
  );
}
