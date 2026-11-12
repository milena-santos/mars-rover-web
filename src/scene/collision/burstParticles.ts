import * as THREE from "three";

export type BurstLayer = {
  count: number;
  positions: Float32Array;
  velocities: Float32Array;
  heats: Float32Array;
  lives: Float32Array;
};

type StepStyle = {
  drift: number;
  liftScale: number;
  liftAlong: number;
  colorAt: (heat: number, fade: number, out: Float32Array, ix: number) => void;
};

function surfaceBasis(normal: THREE.Vector3) {
  const east = new THREE.Vector3().crossVectors(
    new THREE.Vector3(0, 1, 0),
    normal,
  );
  if (east.lengthSq() < 1e-6) east.set(1, 0, 0).cross(normal);
  east.normalize();
  const north = new THREE.Vector3().crossVectors(normal, east).normalize();
  return { east, north };
}

export function fillBurstLayer(
  count: number,
  normal: THREE.Vector3,
  speedMin: number,
  speedMax: number,
  elevMin: number,
  elevMax: number,
): BurstLayer {
  const { east, north } = surfaceBasis(normal);
  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);
  const heats = new Float32Array(count);
  const lives = new Float32Array(count);

  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const elev = elevMin + Math.random() * (elevMax - elevMin);
    const speed = speedMin + Math.random() * (speedMax - speedMin);
    const spread = 1 - elev * 0.22;
    const dir = normal
      .clone()
      .multiplyScalar(elev)
      .addScaledVector(east, Math.cos(angle) * spread)
      .addScaledVector(north, Math.sin(angle) * spread)
      .normalize()
      .multiplyScalar(speed);
    const ix = i * 3;
    velocities[ix] = dir.x;
    velocities[ix + 1] = dir.y;
    velocities[ix + 2] = dir.z;
    heats[i] = Math.random();
    lives[i] = 0.6 + Math.random() * 0.4;
  }

  return { count, positions, velocities, heats, lives };
}

function stepLayer(
  layer: BurstLayer,
  points: THREE.Points | null,
  t: number,
  normal: THREE.Vector3,
  style: StepStyle,
) {
  if (!points) return;
  const pos = points.geometry.getAttribute("position") as THREE.BufferAttribute;
  const col = points.geometry.getAttribute("color") as THREE.BufferAttribute;
  const lift = normal.clone().multiplyScalar(style.liftAlong);

  for (let i = 0; i < layer.count; i += 1) {
    const age = Math.min(1, t / layer.lives[i]);
    const ix = i * 3;
    const arc = age * age * style.liftScale;
    pos.array[ix] = layer.velocities[ix] * age * style.drift + lift.x * arc;
    pos.array[ix + 1] =
      layer.velocities[ix + 1] * age * style.drift + lift.y * arc;
    pos.array[ix + 2] =
      layer.velocities[ix + 2] * age * style.drift + lift.z * arc;
    style.colorAt(layer.heats[i], 1 - age, col.array as Float32Array, ix);
  }
  pos.needsUpdate = true;
  col.needsUpdate = true;
}

export function stepEmbers(
  layer: BurstLayer,
  points: THREE.Points | null,
  t: number,
  normal: THREE.Vector3,
) {
  stepLayer(layer, points, t, normal, {
    drift: 0.95,
    liftScale: 0.3,
    liftAlong: 0.25,
    colorAt: (heat, fade, out, ix) => {
      out[ix] = (0.55 + heat * 0.35) * fade;
      out[ix + 1] = (0.18 + heat * 0.16) * fade;
      out[ix + 2] = (0.06 + heat * 0.05) * fade;
    },
  });
}

export function stepSmoke(
  layer: BurstLayer,
  points: THREE.Points | null,
  t: number,
  normal: THREE.Vector3,
) {
  stepLayer(layer, points, t, normal, {
    drift: 0.7,
    liftScale: 0.4,
    liftAlong: 0.12,
    colorAt: (heat, fade, out, ix) => {
      const grey = 0.18 + heat * 0.12;
      out[ix] = grey * 1.1 * fade;
      out[ix + 1] = grey * 0.7 * fade;
      out[ix + 2] = grey * 0.5 * fade;
    },
  });
}

export function makeBurstGeometry(layer: BurstLayer) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(layer.positions, 3));
  geo.setAttribute(
    "color",
    new THREE.BufferAttribute(new Float32Array(layer.count * 3), 3),
  );
  return geo;
}
