type RoverBodyProps = {
  color: string;
  selected: boolean;
  scale?: number;
};

export function RoverBody({ color, selected, scale = 1 }: RoverBodyProps) {
  return (
    <group scale={scale}>
      <mesh position={[0, 0.045, 0]} castShadow>
        <boxGeometry args={[0.22, 0.08, 0.3]} />
        <meshStandardMaterial
          color="#d8d2c6"
          emissive={color}
          emissiveIntensity={selected ? 0.18 : 0.04}
          metalness={0.65}
          roughness={0.35}
        />
      </mesh>
      <mesh position={[0, 0.1, -0.03]}>
        <boxGeometry args={[0.09, 0.06, 0.09]} />
        <meshStandardMaterial
          color="#8f877c"
          metalness={0.55}
          roughness={0.4}
        />
      </mesh>
      <mesh position={[0, 0.17, -0.03]}>
        <cylinderGeometry args={[0.016, 0.016, 0.12, 8]} />
        <meshStandardMaterial
          color="#c5c5c5"
          metalness={0.8}
          roughness={0.28}
        />
      </mesh>
      <mesh position={[0, 0.24, 0.02]}>
        <sphereGeometry args={[0.028, 12, 12]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={selected ? 0.35 : 0.12}
        />
      </mesh>
      {[
        [0.12, 0.09],
        [-0.12, 0.09],
        [0.12, -0.09],
        [-0.12, -0.09],
        [0.12, 0],
        [-0.12, 0],
      ].map(([x, z]) => (
        <mesh
          key={`${x}-${z}`}
          position={[x, 0.02, z]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry args={[0.028, 0.028, 0.034, 12]} />
          <meshStandardMaterial
            color="#2b2b2b"
            metalness={0.4}
            roughness={0.55}
          />
        </mesh>
      ))}
      <pointLight
        color={color}
        intensity={selected ? 0.35 : 0.12}
        distance={0.45}
        decay={2}
        position={[0, 0.1, 0]}
      />
    </group>
  );
}
