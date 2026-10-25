import type { Engine } from '@hpcc-js/wasm-graphviz';

export interface RunError {
  name: string;
  message: string;
}

/** What a run of a Playground script ended with. */
export type RunResult =
  | { ok: true; dot: string }
  | { ok: false; error: RunError };

/** What laying out DOT with Graphviz ended with. */
export type LayoutResult =
  | { ok: true; svg: string; version: string }
  | { ok: false; error: RunError };

/** Main thread → worker. */
export type WorkerRequest =
  | { id: number; type: 'run'; source: string }
  | { id: number; type: 'layout'; dot: string; engine: Engine };

/** Worker → main thread. */
export type WorkerResponse = (RunResult | LayoutResult) & { id: number };
