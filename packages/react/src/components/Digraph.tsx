import type { FC } from 'react';
import type { RootGraphProps } from '../types.js';
import { useHostGraph } from './hostGraph.js';

/**
 * `Digraph` component.
 */
export const Digraph: FC<RootGraphProps> = (props) =>
  useHostGraph(
    props,
    (models) => {
      const graph = new models.Digraph(props.id, props.strict);
      graph.with(models);
      return graph;
    },
    true,
  );

Digraph.displayName = 'Digraph';
