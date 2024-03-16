import { createContext } from 'react';
import { GraphBaseModel } from 'ts-graphviz';

export const ContainerCluster = createContext<GraphBaseModel | null>(null);
ContainerCluster.displayName = 'ContainerCluster';
