import { createContext } from 'react';
import type { AnyGraphContainer } from '../types/container.js';

export interface Context<
  Container extends AnyGraphContainer = AnyGraphContainer,
> {
  container?: Container;
}

export const GraphvizContext = createContext<Context>(
  null as unknown as Context,
);
GraphvizContext.displayName = 'GraphvizContext';
