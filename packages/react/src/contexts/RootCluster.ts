import React from 'react';
import { IRootCluster } from 'ts-graphviz';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const RootCluster = React.createContext<IRootCluster>(null!);
RootCluster.displayName = 'RootCluster';
