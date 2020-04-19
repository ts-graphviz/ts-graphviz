import React from 'react';
import { ICluster } from 'ts-graphviz';

export const ClusterContext = React.createContext<ICluster<string>>({} as ICluster<string>);
ClusterContext.displayName = 'ClusterContext';
