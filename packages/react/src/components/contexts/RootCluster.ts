import React from 'react';
import { IRootCluster } from '@ts-graphviz/model';

export const NoRootCluster = {} as IRootCluster;
export const RootCluster = React.createContext<IRootCluster>(NoRootCluster);
RootCluster.displayName = 'RootCluster';
