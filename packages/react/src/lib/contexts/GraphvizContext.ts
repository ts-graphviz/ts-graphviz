import { createContext } from 'react';
import type { GraphBaseModel } from 'ts-graphviz';

export interface Context<T extends GraphBaseModel = GraphBaseModel> {
  container?: T;
}

export const GraphvizContext = createContext<Context>(
  null as unknown as Context,
);
GraphvizContext.displayName = 'GraphvizContext';
