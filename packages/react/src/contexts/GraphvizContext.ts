import { createContext } from 'react';
import type { DotObjectModel } from 'ts-graphviz';
import type { AnyGraphContainer } from '../types/container.js';

export interface Context<
  Container extends AnyGraphContainer = AnyGraphContainer,
> {
  container?: Container;
  __collectModel?: (model: DotObjectModel) => void;
}

export const GraphvizContext = createContext<Context>(
  null as unknown as Context,
);
GraphvizContext.displayName = 'GraphvizContext';
