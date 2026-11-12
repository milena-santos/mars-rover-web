import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type CollisionBurstProps = {
  position: [number, number, number];
  normal: [number, number, number];
  onDone?: () => void;
};

const COUNT = 48;
const DURATION = 1.9;

export function CollisionBurst({
  position,
  normal,
  onDone,
}: CollisionBurstProps) {
  const flashRef = useRef<THREE.Mesh>(null);
  const flashMat = useRef<THREE.MeshBasicMaterial>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const ringMat = useRef<THREE.MeshBasicMaterial>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const progressRef = useRef(0);
  const doneRef = useRef(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  const nVec = useMemo(
    () => new THREE.Vector3(...normal).normalize(),
    [normal],
  );

  const ringQuat = useMemo(
    () =>
      new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 0, 1),
        nVec,
      ),
    [nVec],
  );

  const { positions, velocities, colors } = useMemo(() => {
    const east = new THREE.Vector3().crossVectors(
      new THREE.Vector3(0, 1, 0),
      nVec,
    );
    if (east.lengthSq() < 1e-6) east.set(1, 0, 0).cross(nVec);
    east.normalize();
    const north = new THREE.Vector3().crossVectors(nVec, east).normalize();

    const positions = new Float32Array(COUNT * 3);
    const velocities = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const elev = 0.2 + Math.random() * 0.8;
      const speed = 0.4 + Math.random() * 1.05;
      const dir = nVec
        .clone()
        .multiplyScalar(elev)
        .add(east.clone().multiplyScalar(Math.cos(angle) * (1 - elev * 0.3)))
        .add(north.clone().multiplyScalar(Math.sin(angle) * (1 - elev * 0.3)))
        .normalize()
        .multiplyScalar(speed);
      velocities[i * 3] = dir.x;
      velocities[i * 3 + 1] = dir.y;
      velocities[i * 3 + 2] = dir.z;
      const hot = Math.random();
      colors[i * 3] = 1;
      colors[i * 3 + 1] = 0.32 + hot * 0.5;
      colors[i * 3 + 2] = 0.1 + hot * 0.2;
    }
    return { positions, velocities, colors };
  }, [nVec]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [colors, positions]);

  useFrame((_, delta) => {
    progressRef.current = Math.min(1, progressRef.current + delta / DURATION);
    const t = progressRef.current;
    const burst = Math.min(1, t / 0.18);
    const fade = t < 0.4 ? 1 : 1 - (t - 0.4) / 0.6;

    if (flashRef.current && flashMat.current) {
      flashRef.current.scale.setScalar(0.06 + burst * 0.62);
      flashMat.current.opacity = Math.max(0, (1 - t * 1.7) * 0.9);
    }
    if (ringRef.current && ringMat.current) {
      ringRef.current.scale.setScalar(0.25 + t * 2.2);
      ringMat.current.opacity = Math.max(0, (1 - t) * 0.42);
    }
    if (lightRef.current) {
      lightRef.current.intensity = Math.max(0, (1 - t * 1.35) * 5.2);
    }

    const pts = pointsRef.current;
    if (pts) {
      const attr = pts.geometry.getAttribute(
        "position",
      ) as THREE.BufferAttribute;
      for (let i = 0; i < COUNT; i += 1) {
        const ix = i * 3;
        attr.array[ix] = velocities[ix] * t * 1.2;
        attr.array[ix + 1] = velocities[ix + 1] * t * 1.2;
        attr.array[ix + 2] = velocities[ix + 2] * t * 1.2;
      }
      attr.needsUpdate = true;
      const mat = pts.material as THREE.PointsMaterial;
      mat.opacity = Math.max(0, fade);
      mat.size = 0.05 + (1 - t) * 0.05;
    }

    if (t < 1 || doneRef.current) return;
    doneRef.current = true;
    onDoneRef.current?.();
  });

  return (
    <group position={position}>
      <mesh ref={flashRef}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          ref={flashMat}
          color="#ffc090"
          transparent
          opacity={0.85}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={ringRef} quaternion={ringQuat}>
        <ringGeometry args={[0.1, 0.18, 48]} />
        <meshBasicMaterial
          ref={ringMat}
          color="#e55838"
          transparent
          opacity={0.35}
          depthWrite={false}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
      <points ref={pointsRef} geometry={geometry}>
        <pointsMaterial
          size={0.07}
          vertexColors
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </points>
      <pointLight
        ref={lightRef}
        color="#ff6a30"
        intensity={4.5}
        distance={2.8}
        decay={2}
      />
    </group>
  );
}
