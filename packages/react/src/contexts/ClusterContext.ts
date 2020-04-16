import React from 'react';
import gv from 'ts-graphviz';

export const ClusterContext = React.createContext<gv.ICluster<string>>({} as gv.ICluster<string>);
ClusterContext.displayName = 'ClusterContext';
