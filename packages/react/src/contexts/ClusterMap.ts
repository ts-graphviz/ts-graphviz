import { createContext } from 'react';
import { GraphBaseModel } from 'ts-graphviz';

export const ClusterMap = createContext<Map<string, GraphBaseModel>>(new Map());
ClusterMap.displayName = 'ClusterMap';
