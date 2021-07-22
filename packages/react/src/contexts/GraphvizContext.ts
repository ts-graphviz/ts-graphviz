import React from 'react';
import { ICluster } from 'ts-graphviz';

export interface IContext {
  container?: ICluster;
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const GraphvizContext = React.createContext<IContext>(null!);
GraphvizContext.displayName = 'GraphvizContext';
