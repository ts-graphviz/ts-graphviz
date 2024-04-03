import { createContext } from 'react';
import type { GraphBaseModel } from 'ts-graphviz';

/**
 * A context that holds a map of graph base models.
 * @public
 */
export const GraphMap = createContext<Map<string, GraphBaseModel>>(new Map());
GraphMap.displayName = 'GraphMap';
