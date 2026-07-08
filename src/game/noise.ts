// ============================================================
// Noise Functions - Procedural Terrain Generation
// ============================================================

/** Simple noise function */
function sn(x: number, seed: number): number {
  const v = Math.sin(x * 0.37 + seed * 127.1) * 43758.5453;
  return v - Math.floor(v);
}

/** Smooth noise with cubic interpolation */
function sm(x: number, seed: number): number {
  const i = Math.floor(x);
  const f = x - i;
  const t = f * f * (3 - 2 * f);
  return sn(i, seed) * (1 - t) + sn(i + 1, seed) * t;
}

/** Octave noise (fractal Brownian motion) */
export function on(x: number, seed: number): number {
  let v = 0;
  let a = 1;
  let f = 1;
  let m = 0;
  for (let i = 0; i < 4; i++) {
    v += sm(x * f, seed + i * 31.4) * a;
    m += a;
    a *= 0.5;
    f *= 2;
  }
  return v / m;
}

/** Seeded random for deterministic generation */
export function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}
