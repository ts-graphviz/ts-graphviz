import { type Engine, Graphviz } from '@hpcc-js/wasm-graphviz';
import {
  type FC,
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const GraphVizContext = createContext<Graphviz | null>(null);

type GraphvizAPI = {
  status: 'loading' | 'ready';
  version: string;
  renderToSVG: (dot: string, engine: Engine) => string;
};

export const GraphvizProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [graphviz, setGraphviz] = useState<Graphviz>(null);
  useEffect(() => {
    Graphviz.load().then((instance) => {
      console.log('Graphviz loaded', instance.version());
      setGraphviz(instance);
    });
    return () => {
      Graphviz.unload();
    };
  }, [setGraphviz]);
  return (
    <GraphVizContext.Provider value={graphviz}>
      {children}
    </GraphVizContext.Provider>
  );
};

export const useGraphviz = () => {
  const wasm = useContext(GraphVizContext);

  const api = useMemo<GraphvizAPI>(
    () => ({
      status: wasm ? 'ready' : 'loading',
      version: wasm?.version(),
      renderToSVG: (dot: string, engine: Engine) =>
        wasm?.layout(dot, 'svg', engine),
    }),
    [wasm],
  );
  return api;
};
