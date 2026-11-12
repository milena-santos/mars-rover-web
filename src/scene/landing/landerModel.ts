import * as THREE from "three";

export function normalizeLanderScene(scene: THREE.Object3D): THREE.Object3D {
  const clone = scene.clone(true);
  clone.traverse((node) => {
    if (!(node instanceof THREE.Mesh) || !node.material) return;
    const source = Array.isArray(node.material)
      ? node.material
      : [node.material];
    const next = source.map((item) => {
      const material = item.clone();
      if (!(material instanceof THREE.MeshStandardMaterial)) return material;
      material.color = material.color
        .clone()
        .lerp(new THREE.Color("#d7d2c7"), 0.12);
      material.roughness = 0.34;
      material.metalness = 0.82;
      return material;
    });
    node.material = next.length === 1 ? next[0] : next;
  });

  const box = new THREE.Box3().setFromObject(clone);
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  clone.scale.setScalar(0.5 / maxDim);

  const centered = new THREE.Box3().setFromObject(clone);
  clone.position.sub(centered.getCenter(new THREE.Vector3()));
  const grounded = new THREE.Box3().setFromObject(clone);
  clone.position.y -= grounded.min.y;
  return clone;
}
