// LombokAlgoritma — Floyd–Warshall all-pairs shortest paths
// SPDX-License-Identifier: Apache-2.0 OR MIT — @codinglombok
import { type Graph, validateGraph } from './types.js';

/**
 * All-pairs distances, `Infinity` when unreachable. Parallel edges keep the minimum weight.
 * Loop order k → i → j with a strict `<` update. O(V³). SPEC §6.7.
 */
export function floydWarshall(g: Graph): number[][] {
  validateGraph(g);
  const n = g.nodes;
  // Minimum weight per (from, to). A Map keeps caller-supplied endpoints out of property writes.
  const minWeight = new Map<number, number>();
  for (const e of g.edges) {
    const key = e.from * n + e.to;
    minWeight.set(key, Math.min(minWeight.get(key) ?? Number.POSITIVE_INFINITY, e.weight));
  }
  // Cells are written by loop counters only, never by input-derived keys.
  const dist = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (__, j) =>
      Math.min(
        i === j ? 0 : Number.POSITIVE_INFINITY,
        minWeight.get(i * n + j) ?? Number.POSITIVE_INFINITY,
      ),
    ),
  );
  for (let k = 0; k < n; k++) {
    const dk = dist[k] as number[];
    for (let i = 0; i < n; i++) {
      const di = dist[i] as number[];
      const dik = di[k] as number;
      if (dik === Number.POSITIVE_INFINITY) continue;
      for (let j = 0; j < n; j++) {
        const cand = dik + (dk[j] as number);
        if (cand < (di[j] as number)) di[j] = cand;
      }
    }
  }
  return dist;
}
