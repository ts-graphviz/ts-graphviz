import { createContext } from 'react';
import type { GraphBaseModel } from 'ts-graphviz';

export const CurrentGraph = createContext<GraphBaseModel | null>(null);
CurrentGraph.displayName = 'CurrentGraph';
