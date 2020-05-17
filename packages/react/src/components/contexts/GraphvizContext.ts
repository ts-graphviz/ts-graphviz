import React from 'react';
import { IRootCluster } from 'ts-graphviz';

export type Context = {
  root?: IRootCluster;
};

export const NoContext = {};

export const GraphvizContext = React.createContext<Context>(NoContext);
GraphvizContext.displayName = 'GraphvizContext';
