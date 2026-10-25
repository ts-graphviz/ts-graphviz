import type { Engine, Graphviz } from '@hpcc-js/wasm-graphviz';
import type { LayoutResult } from './protocol';
import { toRunError } from './run-script';

/** The part of `@hpcc-js/wasm-graphviz`'s Graphviz used here. */
export type GraphvizLike = Pick<Graphviz, 'layout' | 'version'>;

/**
 * Lay out DOT as SVG. Never throws: Graphviz's errors (bad DOT, an engine
 * that cannot lay out the graph) come back as `{ ok: false, error }`.
 */
export function layout(
  graphviz: GraphvizLike,
  dot: string,
  engine: Engine,
): LayoutResult {
  try {
    return {
      ok: true,
      svg: graphviz.layout(dot, 'svg', engine),
      version: graphviz.version(),
    };
  } catch (error) {
    return { ok: false, error: toRunError(error) };
  }
}
