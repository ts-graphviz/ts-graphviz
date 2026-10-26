import type { ReactElement } from 'react';
import { type ModelsContext, ownOptions } from 'ts-graphviz';
import type { AnyGraphContainer } from '../types/container.js';
import type { SubgraphProps } from '../types.js';
import { useHostGraph } from './hostGraph.js';

// Made by the enclosing graph's createSubgraph, so a graph class that
// overrides it still decides, and taken out at once: the commit adds it.
function createSubgraph(
  models: ModelsContext,
  parent: AnyGraphContainer | null,
  id: string | undefined,
): AnyGraphContainer {
  if (parent === null) {
    const subgraph = new models.Subgraph(id);
    subgraph.with(models);
    return subgraph;
  }
  const subgraph = parent.createSubgraph(id);
  parent.removeSubgraph(subgraph);
  return subgraph;
}

const SubgraphComponent = (props: SubgraphProps): ReactElement =>
  useHostGraph(
    props,
    (models, parent) => createSubgraph(models, parent, ownOptions(props).id),
    false,
  );

/**
 * `Subgraph` component. Its `id` picks the attributes it takes, as for
 * `subgraph()`: `<Subgraph id="cluster_a" label="A">` or
 * `<Subgraph id="row" rank="same">`.
 */
// The id-dependent props are a type-level view of the same component, which
// is written against the props of an id not known in advance.
export const Subgraph = SubgraphComponent as {
  <const Id extends string | undefined = undefined>(
    props: SubgraphProps<Id>,
  ): ReactElement;
  displayName?: string;
};

Subgraph.displayName = 'Subgraph';
