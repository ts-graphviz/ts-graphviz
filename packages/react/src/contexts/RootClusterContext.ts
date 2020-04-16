import React from 'react';
import gv from 'ts-graphviz';

export const RootClusterContext = React.createContext<gv.IRootCluster>({} as gv.IRootCluster);
RootClusterContext.displayName = 'RootClusterContext';
