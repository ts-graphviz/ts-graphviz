import { ReactElement, createElement } from 'react';
import { toDot } from 'ts-graphviz';
import { GraphvizContext, Context } from '../components/contexts/GraphvizContext';
import { reconciler } from './reconciler';

const noop = (): void => undefined;

export function render(element: ReactElement, context: Context): number {
  const container = reconciler.createContainer({}, false, false);
  return reconciler.updateContainer(
    createElement(
      GraphvizContext.Provider,
      {
        value: context,
      },
      element,
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
