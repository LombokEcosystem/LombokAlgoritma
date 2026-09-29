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
  const dist = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (__, j) => (i === j ? 0 : Number.POSITIVE_INFINITY)),
  );
  // validateGraph guarantees integer endpoints in [0, n); the explicit bounds check keeps the
  // write to real array indices only (never a property like "__proto__").
  for (const e of g.edges) {
    const { from, to } = e;
    if (!(from >= 0 && from < n && to >= 0 && to < n)) continue;
    const row = dist[from] as number[];
    row[to] = Math.min(row[to] as number, e.weight);
  }
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
