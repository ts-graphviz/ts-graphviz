import { createContext } from 'react';
import type { GraphBaseModel } from 'ts-graphviz';

export const GraphMap = createContext<Map<string, GraphBaseModel>>(new Map());
GraphMap.displayName = 'GraphMap';
