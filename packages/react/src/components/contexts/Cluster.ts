import React from 'react';
import { ICluster } from 'ts-graphviz';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const Cluster = React.createContext<ICluster>(null!);
Cluster.displayName = 'Cluster';
