import * as THREE from "three";

export function makeSoftDisc(): THREE.CanvasTexture {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const texture = new THREE.CanvasTexture(canvas);
  if (!ctx) return texture;

  const g = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  g.addColorStop(0, "rgba(255, 200, 140, 0.95)");
  g.addColorStop(0.35, "rgba(220, 90, 40, 0.55)");
  g.addColorStop(0.7, "rgba(80, 35, 20, 0.18)");
  g.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  texture.needsUpdate = true;
  return texture;
}
