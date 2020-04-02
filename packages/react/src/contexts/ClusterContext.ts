import React from 'react';
import gv from 'ts-graphviz';

export const ClusterContext = React.createContext<gv.ICluster<any> | undefined>(undefined);
ClusterContext.displayName = 'ClusterContext';
