import type React from 'react';
import { useContext } from 'react';
import type { GraphBaseModel } from 'ts-graphviz';
import { type Context, GraphvizContext } from '../contexts/GraphvizContext.js';

export function useGraphvizContext<T extends GraphBaseModel>(): Context<T> {
  // Type assertion is necessary here due to React's context type system limitations
  // GraphvizContext is created as React.Context<Context | null> but we need
  // React.Context<Context<T>> for proper typing
  const context = useContext(
    GraphvizContext as unknown as React.Context<Context<T>>,
  );
  if (context === null) {
    throw Error(
      'Cannot call useGraphvizContext outside GraphvizContext.\nBasically, you need to use the render function provided by @ts-graphviz/react.',
    );
  }
  return context;
}
