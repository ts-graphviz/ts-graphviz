import { type FC, useEffect, useImperativeHandle, useLayoutEffect } from 'react';
import { CurrentGraph } from '../contexts/CurrentGraph.js';
import { useGraphMap } from '../hooks/useGraphMap.js';
import { useGraphvizContext } from '../hooks/useGraphvizContext.js';
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
  const context = useGraphvizContext();

  // Handle ref as prop
  useImperativeHandle(ref, () => subgraph, [subgraph]);

  // Collect model for render result
  useLayoutEffect(() => {
    context.__collectModel?.(subgraph);
  }, [context, subgraph]);

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
