import * as THREE from "three";

type TintOptions = {
  mixColor?: string;
  mixAmount?: number;
  roughness?: number;
  metalness?: number;
};

export function tintStandardMaterials(
  root: THREE.Object3D,
  {
    mixColor = "#d7d2c7",
    mixAmount = 0.18,
    roughness = 0.34,
    metalness = 0.84,
  }: TintOptions = {},
): void {
  const mix = new THREE.Color(mixColor);
  root.traverse((node) => {
    if (!(node instanceof THREE.Mesh) || !node.material) return;
    const source = Array.isArray(node.material)
      ? node.material
      : [node.material];
    const next = source.map((item) => {
      const material = item.clone();
      if (!(material instanceof THREE.MeshStandardMaterial)) return material;
      material.color = material.color.clone().lerp(mix, mixAmount);
      material.roughness = roughness;
      material.metalness = metalness;
      return material;
    });
    node.material = next.length === 1 ? next[0] : next;
  });
}
