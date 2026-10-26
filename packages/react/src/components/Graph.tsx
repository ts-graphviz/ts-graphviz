import type { FC } from 'react';
import { ownOptions } from 'ts-graphviz';
import type { RootGraphProps } from '../types.js';
import { useHostGraph } from './hostGraph.js';

/**
 * `Graph` component.
 */
export const Graph: FC<RootGraphProps> = (props) => {
  const { id, strict } = ownOptions(props);
  return useHostGraph(
    props,
    (models) => {
      const graph = new models.Graph(id, strict);
      graph.with(models);
      return graph;
    },
    true,
  );
};

Graph.displayName = 'Graph';
