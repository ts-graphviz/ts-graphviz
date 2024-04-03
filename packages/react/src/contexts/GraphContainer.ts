import { createContext } from 'react';
import type { GraphBaseModel } from 'ts-graphviz';

/**
 * A context that provides the graph container for the React component.
 * The graph container holds the graph model used by the component.
 * @public
 */
export const GraphContainer = createContext<GraphBaseModel | null>(null);
GraphContainer.displayName = 'GraphContainer';
