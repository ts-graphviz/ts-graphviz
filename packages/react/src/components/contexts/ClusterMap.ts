import React from 'react';
import { ICluster } from '@ts-graphviz/model';

export const ClusterMap = React.createContext<Map<string, ICluster>>(new Map());
ClusterMap.displayName = 'ClusterMap';
