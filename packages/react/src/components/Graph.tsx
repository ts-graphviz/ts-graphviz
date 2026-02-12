import { type FC, useImperativeHandle, useLayoutEffect } from 'react';
import { CurrentGraph } from '../contexts/CurrentGraph.js';
import { GraphContainer } from '../contexts/GraphContainer.js';
import { useGraph } from '../hooks/useGraph.js';
import { useGraphContainer } from '../hooks/useGraphContainer.js';
import { useGraphMap } from '../hooks/useGraphMap.js';
import { useModelCollector } from '../hooks/useModelCollector.js';
import { useRenderedID } from '../hooks/useRenderedID.js';
import type { RootGraphProps } from '../types.js';
/**
 * `Graph` component.
 */
export const Graph: FC<RootGraphProps> = ({
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
  const graph = useGraph(options);
  const clusters = useGraphMap();
  const modelCollector = useModelCollector();

  // Register in GraphMap during render phase (before GraphPortal lookup)
  if (graph.id !== undefined) {
    clusters.set(graph.id, graph);
  }

  // Clean up stale GraphMap entry on unmount or id change
  useLayoutEffect(() => {
    const id = graph.id;
    return () => {
      if (id !== undefined) {
        clusters.delete(id);
      }
    };
  }, [graph.id, clusters.delete]);

  // Handle ref as prop
  useImperativeHandle(ref, () => graph, [graph]);

  // Collect model for render result
  useLayoutEffect(() => {
    modelCollector?.collectModel(graph);
  }, [modelCollector, graph]);
  return (
    <GraphContainer.Provider value={graph}>
      <CurrentGraph.Provider value={graph}>{children}</CurrentGraph.Provider>
    </GraphContainer.Provider>
  );
};

Graph.displayName = 'Graph';
