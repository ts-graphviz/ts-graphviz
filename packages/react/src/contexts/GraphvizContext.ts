import type { ModelsContext } from '@ts-graphviz/common';
import { createContext, type Context as ReactContext } from 'react';
import type { AnyGraphContainer } from '../types/container.js';

export interface Context<
  Container extends AnyGraphContainer = AnyGraphContainer,
> {
  container?: Container;
  /** Model classes used to create root graphs, nodes and edges. */
  models: ModelsContext;
}

export const GraphvizContext: ReactContext<Context | null> =
  createContext<Context | null>(null);
GraphvizContext.displayName = 'GraphvizContext';
