import React from 'react';
import { ICluster } from 'ts-graphviz';

export const NoCluster = {} as ICluster;
export const Cluster = React.createContext<ICluster>(NoCluster);
Cluster.displayName = 'Cluster';
