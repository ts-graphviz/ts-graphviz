import React from 'react';
import { ICluster } from 'ts-graphviz';

export const CurrentCluster = React.createContext<ICluster | null>(null);
CurrentCluster.displayName = 'CurrentCluster';
