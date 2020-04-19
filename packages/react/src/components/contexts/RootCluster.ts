import React from 'react';
import { IRootCluster } from 'ts-graphviz';

export const RootCluster = React.createContext<IRootCluster>({} as IRootCluster);
RootCluster.displayName = 'RootCluster';
