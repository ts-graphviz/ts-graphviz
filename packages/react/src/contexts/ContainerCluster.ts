import React from 'react';
import { ICluster } from 'ts-graphviz';

export const ContainerCluster = React.createContext<ICluster | null>(null);
ContainerCluster.displayName = 'ContainerCluster';
