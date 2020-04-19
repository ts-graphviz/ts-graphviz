import { ReactElement, createElement } from 'react';
import { Context } from 'ts-graphviz';
import { GraphvizContext } from '../components/contexts/GraphvizContext';
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
  const context = new Context();
  render(element, context);
  return context.root?.toDot() || '';
}
