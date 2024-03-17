import type React from 'react';
import { useContext } from 'react';
import type { GraphBaseModel } from 'ts-graphviz';
import { type Context, GraphvizContext } from '../contexts/GraphvizContext.js';

export function useGraphvizContext<T extends GraphBaseModel>(): Context<T> {
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
