"use client";

export function ProbeCraft() {
  return (
    <group scale={0.72}>
      <mesh position={[0, 0.1, 0]} castShadow>
        <capsuleGeometry args={[0.065, 0.14, 8, 16]} />
        <meshStandardMaterial
          color="#c9c2b4"
          metalness={0.72}
          roughness={0.32}
        />
      </mesh>
      <mesh position={[0, 0.19, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.05, 0.05, 8]} />
        <meshStandardMaterial
          color="#e55838"
          metalness={0.55}
          roughness={0.4}
        />
      </mesh>
      <mesh position={[0, 0.24, 0]}>
        <sphereGeometry args={[0.024, 12, 12]} />
        <meshStandardMaterial
          color="#ffb070"
          emissive="#e55838"
          emissiveIntensity={0.28}
          metalness={0.3}
          roughness={0.35}
        />
      </mesh>
      {[
        [0.1, 0.07, 0.09],
        [-0.1, 0.07, 0.09],
        [0.1, 0.07, -0.09],
        [-0.1, 0.07, -0.09],
      ].map(([x, y, z]) => (
        <group key={`${x}-${z}`} position={[x, y, z]}>
          <mesh rotation={[0.35 * Math.sign(z || 1), 0, 0.4 * Math.sign(x)]}>
            <boxGeometry args={[0.016, 0.11, 0.016]} />
            <meshStandardMaterial
              color="#8a8378"
              metalness={0.6}
              roughness={0.4}
            />
          </mesh>
          <mesh position={[0, -0.065, 0]}>
            <sphereGeometry args={[0.018, 10, 10]} />
            <meshStandardMaterial
              color="#2f2f2f"
              metalness={0.4}
              roughness={0.55}
            />
          </mesh>
        </group>
      ))}
      <mesh position={[0.11, 0.12, 0]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.01, 0.08, 0.04]} />
        <meshStandardMaterial
          color="#9a9388"
          metalness={0.5}
          roughness={0.45}
        />
      </mesh>
      <mesh position={[-0.11, 0.12, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <boxGeometry args={[0.01, 0.08, 0.04]} />
        <meshStandardMaterial
          color="#9a9388"
          metalness={0.5}
          roughness={0.45}
        />
      </mesh>
    </group>
  );
}
