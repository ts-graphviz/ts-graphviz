import React, { ReactNode } from 'react';
import createReactReconciler from 'react-reconciler';
import { Context } from 'ts-graphviz';
import { GraphvizContext } from '../contexts/GraphvizContext';
// import { GraphvizContainer } from './container';
import { HostConfig } from './host-config';

const hostConfig = new HostConfig();
const reconciler = createReactReconciler(hostConfig);

export function toDot(element: ReactNode, context: Context) {
  const container = reconciler.createContainer({}, false, false);
  reconciler.updateContainer(
    <GraphvizContext.Provider value={context}>{element}</GraphvizContext.Provider>,
    container,
    null,
    () => console.log('callback'),
  );
  reconciler.getPublicRootInstance(container);
  return context.root?.toDot();
}
