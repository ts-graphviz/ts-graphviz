import React from 'react';
import { ICluster } from 'ts-graphviz';

export const NoCluster = {} as ICluster<string>;
export const Cluster = React.createContext<ICluster<string>>(NoCluster);
Cluster.displayName = 'Cluster';
