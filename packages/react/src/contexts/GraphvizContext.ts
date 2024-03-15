import { createContext } from 'react';
import { GraphBaseModel } from 'ts-graphviz';

export interface IContext {
  container?: GraphBaseModel;
}

export const GraphvizContext = createContext<IContext>(
  null as unknown as IContext,
);
GraphvizContext.displayName = 'GraphvizContext';
