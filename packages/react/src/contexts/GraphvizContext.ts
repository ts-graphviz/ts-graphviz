import { createContext } from 'react';
import type { GraphBaseModel } from 'ts-graphviz';

/**
 * Represents the context for the Graphviz component.
 *
 * @typePatam T - The type of the container.
 * @public
 */
export interface Context<T extends GraphBaseModel = GraphBaseModel> {
  container?: T;
}

/**
 * The context for the Graphviz component.
 * @public
 */
export const GraphvizContext = createContext<Context>(
  null as unknown as Context,
);
GraphvizContext.displayName = 'GraphvizContext';
