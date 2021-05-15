import React from 'react';
import { ICluster } from 'ts-graphviz';

export const Cluster = React.createContext<ICluster>(null!);
Cluster.displayName = 'Cluster';
