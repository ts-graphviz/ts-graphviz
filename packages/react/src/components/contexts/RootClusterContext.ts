import React from 'react';
import { IRootCluster } from 'ts-graphviz';

export const RootClusterContext = React.createContext<IRootCluster>({} as IRootCluster);
RootClusterContext.displayName = 'RootClusterContext';
