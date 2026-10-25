import type { FC } from 'react';
import type { RootGraphProps } from '../types.js';
import { useHostGraph } from './hostGraph.js';

/**
 * `Graph` component.
 */
export const Graph: FC<RootGraphProps> = (props) =>
  useHostGraph(
    props,
    (models) => {
      const graph = new models.Graph(props.id, props.strict);
      graph.with(models);
      return graph;
    },
    true,
  );

Graph.displayName = 'Graph';
