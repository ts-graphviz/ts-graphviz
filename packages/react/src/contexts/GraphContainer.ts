import { createContext } from 'react';
import type { GraphBaseModel } from 'ts-graphviz';

export const GraphContainer = createContext<GraphBaseModel | null>(null);
GraphContainer.displayName = 'GraphContainer';
