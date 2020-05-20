import { ReactElement, createElement } from 'react';
import { toDot } from 'ts-graphviz';
import { GraphvizContext, Context } from '../components/contexts/GraphvizContext';
import { reconciler } from './reconciler';
import { ClusterMap } from '../components/contexts/ClusterMap';

const noop = (): void => undefined;

export function render(element: ReactElement, context: Context): number {
  const container = reconciler.createContainer({}, false, false);
  // Clusters
  return reconciler.updateContainer(
    createElement(
      ClusterMap.Provider,
      {
        value: new Map(),
      },
      createElement(
        GraphvizContext.Provider,
        {
          value: context,
        },
        element,
      ),
    ),
    container,
    null,
    noop,
  );
}

export function renderToDot(element: ReactElement): string {
  const context: Context = {};
  render(element, context);
  return context.root ? toDot(context.root) : '';
}
