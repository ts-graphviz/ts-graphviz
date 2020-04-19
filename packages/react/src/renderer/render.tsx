import React, { ReactNode } from 'react';
import { Context } from 'ts-graphviz';
import { GraphvizContext } from '../components/contexts/GraphvizContext';
import { reconciler } from './reconciler';

export function renderToDot(element: ReactNode, context: Context): string {
  const container = reconciler.createContainer({}, false, false);
  reconciler.updateContainer(
    <GraphvizContext.Provider value={context}>{element}</GraphvizContext.Provider>,
    container,
    null,
    () => undefined,
  );
  return reconciler.flushSync(() => context.root?.toDot() || '');
}
