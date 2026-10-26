import type { FC } from 'react';
import { ownOptions } from 'ts-graphviz';
import type { RootGraphProps } from '../types.js';
import { useHostGraph } from './hostGraph.js';

/**
 * `Digraph` component.
 */
export const Digraph: FC<RootGraphProps> = (props) => {
  const { id, strict } = ownOptions(props);
  return useHostGraph(
    props,
    (models) => {
      const graph = new models.Digraph(id, strict);
      graph.with(models);
      return graph;
    },
    true,
  );
};

Digraph.displayName = 'Digraph';
