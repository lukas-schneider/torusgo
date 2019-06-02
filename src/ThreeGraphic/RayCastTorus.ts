import {Vector2, Vector3, Vector4} from 'three';

// this implements the same raycasting as in the TorusMaterialBoarayDirection shader

const iTorus = (
    rayStart: Vector4,
    rayDirection: Vector4,
    torus: Vector2,
): number => {

  const Ra2 = torus.x * torus.x;
  const ra2 = torus.y * torus.y;

  const m = rayStart.x * rayStart.x + rayStart.y * rayStart.y + rayStart.z * rayStart.z;
  const n = rayStart.x * rayDirection.x + rayStart.y * rayDirection.y + rayStart.z * rayDirection.z;

  const k = (m - ra2 - Ra2) / 2.0;
  const a = n;
  const b = n * n + Ra2 * rayDirection.z * rayDirection.z + k;
  const c = k * n + Ra2 * rayStart.z * rayDirection.z;
  const d = k * k + Ra2 * rayStart.z * rayStart.z - Ra2 * ra2;

  // ----------------------------------

  let p = -3.0 * a * a + 2.0 * b;
  const q = 2.0 * a * a * a - 2.0 * a * b + 2.0 * c;
  let r = -3.0 * a * a * a * a + 4.0 * a * a * b - 8.0 * a * c + 4.0 * d;
  p /= 3.0;
  r /= 3.0;
  const Q = p * p + r;
  const R = 3.0 * r * p - p * p * p - q * q;

  let h = R * R - Q * Q * Q;
  let z = 0.0;
  if (h < 0.0) {
    const sQ = Math.sqrt(Q);
    z = 2.0 * sQ * Math.cos(Math.acos(R / (sQ * Q)) / 3.0);
  } else {
    const sQ = Math.pow(Math.sqrt(h) + Math.abs(R), 1.0 / 3.0);
    z = Math.sign(R) * Math.abs(sQ + Q / sQ);

  }

  z = p - z;

  // ----------------------------------

  let d1 = z - 3.0 * p;
  let d2 = z * z - 3.0 * r;

  if (Math.abs(d1) < 1.0e-4) {
    if (d2 < 0.0) {
      return -1.0;
    }
    d2 = Math.sqrt(d2);
  } else {
    if (d1 < 0.0) {
      return -1.0;
    }
    d1 = Math.sqrt(d1 / 2.0);
    d2 = q / d1;
  }

  // ----------------------------------

  let result = 1e20;

  h = d1 * d1 - z + d2;
  if (h > 0.0) {
    h = Math.sqrt(h);
    const t1 = -d1 - h - a;
    const t2 = -d1 + h - a;
    if (t1 > 0.0) {
      result = t1;
    } else if (t2 > 0.0) {
      result = t2;
    }
  }

  h = d1 * d1 - z - d2;
  if (h > 0.0) {
    h = Math.sqrt(h);
    const t1 = d1 - h - a;
    const t2 = d1 + h - a;
    if (t1 > 0.0) {
      result = Math.min(result, t1);
    } else if (t2 > 0.0) {
      result = Math.min(result, t2);
    }
  }


  return result;
};

const sdTorus = (pos: Vector4, torus: Vector2): number => {
  const q = new Vector2(
      Math.sqrt(pos.x * pos.x + pos.y * pos.y) - torus.x,
      pos.z,
  );
  return q.length() - torus.y;
};

const nTorus = (pos: Vector4, torus: Vector2): Vector4 => {
  const magicValue = pos.dot(pos) - torus.y * torus.y - torus.x * torus.x;
  const magicVector = new Vector3(1, 1, -1).multiplyScalar(magicValue);
  // there is no component wise multiplication for Vector4 :D
  return new Vector4(
      pos.x * magicVector.x,
      pos.y * magicVector.y,
      pos.z * magicVector.z,
      0,
  );
};

export default function (
    rayStart: Vector4,
    rayDirection: Vector4,
    torus: Vector2,
    polishIters = 10,
): number {

  let t = iTorus(rayStart, rayDirection, torus);

  if (t < 0.0 || t > 100.0) {
    return -1;
  }

  for (let i = 0; i < polishIters; i++) {
    const pos = rayStart.clone();
    pos.addScaledVector(rayDirection, t);
    const nor = nTorus(pos, torus);
    const dist = sdTorus(pos, torus);
    t -= rayDirection.dot(nor) * dist;
  }

  return t;
};
