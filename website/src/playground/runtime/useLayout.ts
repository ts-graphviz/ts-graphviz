import type { Engine } from '@hpcc-js/wasm-graphviz';
import { useEffect, useState } from 'react';
import type { LayoutResult } from './protocol';
import { useScriptRunner } from './ScriptRunnerContext';

export type LayoutState =
  | { status: 'idle' }
  | { status: 'rendering' }
  | ({ status: 'done' } & LayoutResult);

/**
 * Lay out `dot` with `engine` in the Playground worker. A newer request
 * replaces an older one still in flight.
 */
export function useLayout(dot: string | null, engine: Engine): LayoutState {
  const runner = useScriptRunner();
  const [state, setState] = useState<LayoutState>({ status: 'idle' });
  useEffect(() => {
    if (dot === null || runner === null) {
      setState({ status: 'idle' });
      return;
    }
    let current = true;
    setState({ status: 'rendering' });
    runner.layout(dot, engine).then((result) => {
      if (current) setState({ status: 'done', ...result });
    });
    return () => {
      current = false;
    };
  }, [runner, dot, engine]);
  return state;
}
