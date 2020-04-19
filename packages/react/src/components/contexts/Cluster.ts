import React from 'react';
import { ICluster } from 'ts-graphviz';

export const Cluster = React.createContext<ICluster<string>>({} as ICluster<string>);
Cluster.displayName = 'Cluster';
