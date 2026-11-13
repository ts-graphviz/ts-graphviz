import type { ReactElement } from 'react';
import { ownOptions } from 'ts-graphviz';
import type { SubgraphProps } from '../types.js';
import { useHostGraph } from './hostGraph.js';

const SubgraphComponent = (props: SubgraphProps): ReactElement =>
  useHostGraph(
    props,
    (models) => models.createSubgraph(ownOptions(props).id),
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
