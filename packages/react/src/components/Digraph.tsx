import {
  type FC,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
} from 'react';
import { CurrentGraph } from '../contexts/CurrentGraph.js';
import { GraphContainer } from '../contexts/GraphContainer.js';
import { useDigraph } from '../hooks/useDigraph.js';
import { useGraphContainer } from '../hooks/useGraphContainer.js';
import { useGraphMap } from '../hooks/useGraphMap.js';
import { useModelCollector } from '../hooks/useModelCollector.js';
import { useRenderedID } from '../hooks/useRenderedID.js';
import type { RootGraphProps } from '../types.js';

/**
 * `Digraph` component.
 */
export const Digraph: FC<RootGraphProps> = ({
  children,
  label,
  ref,
  ...options
}) => {
  const container = useGraphContainer();
  if (container !== null) {
    throw Error(
      'RootCluster is duplicated.\nUse only one of Digraph and Graph.',
    );
  }
  const renderedLabel = useRenderedID(label);
  if (renderedLabel !== undefined)
    Object.assign(options, { label: renderedLabel });
  const digraph = useDigraph(options);
  const clusters = useGraphMap();
  const modelCollector = useModelCollector();

  // Handle ref as prop
  useImperativeHandle(ref, () => digraph, [digraph]);

  // Collect model for render result
  useLayoutEffect(() => {
    modelCollector?.collectModel(digraph);
  }, [modelCollector, digraph]);

  useEffect(() => {
    if (digraph.id !== undefined) {
      clusters.set(digraph.id, digraph);
    }
  }, [clusters, digraph]);
  return (
    <GraphContainer.Provider value={digraph}>
      <CurrentGraph.Provider value={digraph}>{children}</CurrentGraph.Provider>
    </GraphContainer.Provider>
  );
};

Digraph.displayName = 'Digraph';
