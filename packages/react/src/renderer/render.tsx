import React, { ReactNode } from 'react';
import createReactReconciler from 'react-reconciler';
import { Context } from 'ts-graphviz';
import { GraphvizContext } from '../contexts/GraphvizContext';
import { HostConfig } from './host-config';

const hostConfig = new HostConfig();
const reconciler = createReactReconciler(hostConfig);

export function renderToDot(element: ReactNode, context: Context): string | undefined {
  const container = reconciler.createContainer({}, false, false);
  reconciler.updateContainer(
    <GraphvizContext.Provider value={context}>{element}</GraphvizContext.Provider>,
    container,
    null,
    () => undefined,
  );
  let dot: string | undefined;
  reconciler.getPublicRootInstance(container);
  reconciler.deferredUpdates(() => {
    dot = context.root?.toDot();
  });
  return dot;
}
