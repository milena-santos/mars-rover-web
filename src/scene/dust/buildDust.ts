import * as THREE from "three";

export function buildDustSprite(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext("2d");
  if (!context) return new THREE.CanvasTexture(canvas);
  const gradient = context.createRadialGradient(64, 64, 4, 64, 64, 64);
  gradient.addColorStop(0, "rgba(255,228,204,0.7)");
  gradient.addColorStop(0.08, "rgba(210,126,76,0.34)");
  gradient.addColorStop(0.26, "rgba(140,72,40,0.12)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function buildDustBelt(count: number) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const color = new THREE.Color();
  let i = 0;
  while (i < count) {
    const angle = Math.random() * Math.PI * 2;
    const radius = THREE.MathUtils.lerp(
      2.08,
      2.95,
      Math.pow(Math.random(), 0.72),
    );
    const y = Math.sin(angle * 2.45) * 0.28 + (Math.random() - 0.5) * 0.35;
    positions[i * 3] = Math.cos(angle) * radius + (Math.random() - 0.5) * 0.24;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] =
      Math.sin(angle) * radius + (Math.random() - 0.5) * 0.24;
    color.setHSL(
      0.046 + Math.random() * 0.02,
      0.44,
      0.28 + Math.random() * 0.22,
    );
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
    i += 1;
  }
  return { positions, colors };
}
