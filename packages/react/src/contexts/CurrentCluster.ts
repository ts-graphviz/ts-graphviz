import { createContext } from 'react';
import { GraphBaseModel } from 'ts-graphviz';

export const CurrentCluster = createContext<GraphBaseModel | null>(null);
CurrentCluster.displayName = 'CurrentCluster';
