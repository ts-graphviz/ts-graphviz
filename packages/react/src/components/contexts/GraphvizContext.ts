import React from 'react';
import { IRootCluster } from 'ts-graphviz';

export type Context = {
  root?: IRootCluster;
};

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const GraphvizContext = React.createContext<Context>(null!);
GraphvizContext.displayName = 'GraphvizContext';
