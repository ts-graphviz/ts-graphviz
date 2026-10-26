import { createElement, type FC, useContext, useMemo } from 'react';
import { CurrentGraph } from '../contexts/CurrentGraph.js';
import { GraphMap } from '../contexts/GraphMap.js';
import { useGraphContainer } from '../hooks/useGraphContainer.js';
import { HOST } from '../host.js';
import type { GraphPortalProps } from '../types.js';

/**
 * GraphPortal component: its children go to the graph with the given id,
 * after that graph's own children; without an id, or when no graph has it,
 * to the root graph. The graph is a graph of the container or a rendered
 * graph outside any portal, found when React commits, so it may come later
 * in the tree. `useCurrentGraph` in the children knows only the graphs of
 * the container: for a rendered target it returns the root graph.
 */
export const GraphPortal: FC<GraphPortalProps> = ({ children, id }) => {
  const container = useGraphContainer();
  const map = useContext(GraphMap);
  const cluster = useMemo(
    () => (id && map ? (map.get(id) ?? container) : container),
    [container, map, id],
  );
  // The target is found at commit, among the graphs rendered by then; the
  // context only knows those of the container.
  return createElement(
    HOST.portal,
    { id },
    <CurrentGraph.Provider value={cluster}>{children}</CurrentGraph.Provider>,
  );
};

GraphPortal.displayName = 'GraphPortal';
