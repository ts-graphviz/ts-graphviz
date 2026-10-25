import {
  type ReactElement,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
} from 'react';
import { CurrentGraph } from '../contexts/CurrentGraph.js';
import { useGraphMap } from '../hooks/useGraphMap.js';
import { useModelCollector } from '../hooks/useModelCollector.js';
import { useRenderedID } from '../hooks/useRenderedID.js';
import { useSubgraph } from '../hooks/useSubgraph.js';
import type { SubgraphProps } from '../types.js';

const SubgraphComponent = ({
  children,
  label,
  ref,
  ...options
}: SubgraphProps): ReactElement => {
  const renderedLabel = useRenderedID(label);
  if (renderedLabel !== undefined)
    Object.assign(options, { label: renderedLabel });
  const subgraph = useSubgraph(options);
  const clusters = useGraphMap();
  const modelCollector = useModelCollector();

  // Handle ref as prop
  useImperativeHandle(ref, () => subgraph, [subgraph]);

  // Collect model for render result
  useLayoutEffect(() => {
    modelCollector?.collectModel(subgraph);
  }, [modelCollector, subgraph]);

  useEffect(() => {
    if (subgraph.id !== undefined) {
      clusters.set(subgraph.id, subgraph);
    }
  }, [subgraph, clusters]);
  return (
    <CurrentGraph.Provider value={subgraph}>{children}</CurrentGraph.Provider>
  );
};

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
