import { type FC, useContext, useMemo } from 'react';
import { CurrentGraph } from '../contexts/CurrentGraph.js';
import { GraphMap } from '../contexts/GraphMap.js';
import { useGraphContainer } from '../hooks/useGraphContainer.js';
import type { GraphPortalProps } from '../types.js';

/**
 * GraphPortal component.
 */
export const GraphPortal: FC<GraphPortalProps> = ({ children, id }) => {
  const container = useGraphContainer();
  const map = useContext(GraphMap);
  const cluster = useMemo(
    () => (id ? (map.get(id) ?? container) : container),
    [container, map, id],
  );
  return (
    <CurrentGraph.Provider value={cluster}>{children}</CurrentGraph.Provider>
  );
};

GraphPortal.displayName = 'GraphPortal';
