import type { Engine } from '@hpcc-js/wasm-graphviz';
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

/** The part of `@hpcc-js/wasm-graphviz`'s Graphviz the site uses. */
export interface GraphvizInstance {
  version(): string;
  layout(dot: string, format: 'svg', engine: Engine): string;
}

export type GraphvizState =
  | { status: 'loading' }
  | {
      status: 'ready';
      version: string;
      renderToSVG: (dot: string, engine: Engine) => string;
    }
  | { status: 'error'; error: Error };

const GraphvizContext = createContext<GraphvizState>({ status: 'loading' });

async function loadGraphviz(): Promise<GraphvizInstance> {
  // Imported here so the WASM is fetched only by pages that render graphs.
  const { Graphviz } = await import('@hpcc-js/wasm-graphviz');
  return Graphviz.load();
}

export function GraphvizProvider({
  children,
  load = loadGraphviz,
}: {
  children: ReactNode;
  /** Loads Graphviz; tests pass a stand-in. */
  load?: () => Promise<GraphvizInstance>;
}) {
  const [state, setState] = useState<GraphvizState>({ status: 'loading' });
  useEffect(() => {
    let active = true;
    load().then(
      (instance) => {
        if (!active) return;
        setState({
          status: 'ready',
          version: instance.version(),
          renderToSVG: (dot, engine) => instance.layout(dot, 'svg', engine),
        });
      },
      (error: unknown) => {
        if (!active) return;
        setState({
          status: 'error',
          error: error instanceof Error ? error : new Error(String(error)),
        });
      },
    );
    return () => {
      active = false;
    };
  }, [load]);
  return (
    <GraphvizContext.Provider value={state}>
      {children}
    </GraphvizContext.Provider>
  );
}

export function useGraphviz(): GraphvizState {
  return useContext(GraphvizContext);
}

export function useGraphvizSVG(
  dot: string | null,
  engine: Engine,
): { svg: string | null; error: Error | null } {
  const graphviz = useGraphviz();
  return useMemo(() => {
    if (dot === null || graphviz.status !== 'ready') {
      return { svg: null, error: null };
    }
    try {
      return { svg: graphviz.renderToSVG(dot, engine), error: null };
    } catch (error) {
      return {
        svg: null,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }, [graphviz, dot, engine]);
}
