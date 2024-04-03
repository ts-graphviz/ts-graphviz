import { createContext } from 'react';
import type { GraphBaseModel } from 'ts-graphviz';

/**
 * Context for the current graph.
 * @remarks
 * This context provides access to the current graph in the application.
 * @public
 */
export const CurrentGraph = createContext<GraphBaseModel | null>(null);
CurrentGraph.displayName = 'CurrentGraph';
