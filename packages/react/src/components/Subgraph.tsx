import { type FC, useEffect, useImperativeHandle } from 'react';
import { CurrentGraph } from '../contexts/CurrentGraph.js';
import { useGraphMap } from '../hooks/useGraphMap.js';
import { useRenderedID } from '../hooks/useRenderedID.js';
import { useSubgraph } from '../hooks/useSubgraph.js';
import type { SubgraphProps } from '../types.js';
/**
 * `Subgraph` component.
 */
export const Subgraph: FC<SubgraphProps> = ({
  children,
  label,
  ref,
  ...options
}) => {
  const renderedLabel = useRenderedID(label);
  if (renderedLabel !== undefined)
    Object.assign(options, { label: renderedLabel });
  const subgraph = useSubgraph(options);
  const clusters = useGraphMap();

  // Handle ref as prop (React 19 pattern)
  useImperativeHandle(ref, () => subgraph, [subgraph]);
  useEffect(() => {
    if (subgraph.id !== undefined) {
      clusters.set(subgraph.id, subgraph);
    }
  }, [subgraph, clusters]);
  return (
    <CurrentGraph.Provider value={subgraph}>{children}</CurrentGraph.Provider>
  );
};

Subgraph.displayName = 'Subgraph';
