import * as THREE from "three";

import { tintStandardMaterials } from "@/scene/tintMaterials";

export function normalizeLanderScene(scene: THREE.Object3D): THREE.Object3D {
  const clone = scene.clone(true);
  tintStandardMaterials(clone, {
    mixAmount: 0.12,
    roughness: 0.34,
    metalness: 0.82,
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
