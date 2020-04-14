import React from 'react';
import gv from 'ts-graphviz';

export const ClusterContext = React.createContext<gv.ICluster<any>>({} as gv.ICluster<any>);
ClusterContext.displayName = 'ClusterContext';
