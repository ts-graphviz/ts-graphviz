import type { ReactElement } from 'react';
import { ownOptions } from 'ts-graphviz';
import { renderId } from './renderId.js';
import { createInstance, HOST, type Instance } from './shared/tree.js';
import type { ComponentProps, HostContext } from './types/reconciler.js';

const COMPONENT_NAMES: Record<string, string> = {
  [HOST.node]: 'Node',
  [HOST.edge]: 'Edge',
};

const HOST_TYPES: ReadonlySet<string> = new Set(Object.values(HOST));

/**
 * Props for a host element, with React labels rendered to HTML-like
 * values. The components call this during render, so an invalid label
 * throws there, where an error boundary can catch it, not in the commit.
 */
export function hostProps<P extends { label?: unknown; xlabel?: unknown }>(
  props: P,
): P {
  // Own props only: one inherited from Object.prototype is not a prop.
  const rendered = ownOptions(props);
  for (const key of ['label', 'xlabel'] as const) {
    if (rendered[key] !== undefined) {
      (rendered as Record<string, unknown>)[key] = renderId(
        rendered[key] as ReactElement | string,
      );
    }
  }
  return rendered;
}

/**
 * Make the instance of a host element React renders, where React says the
 * element is.
 */
export function createHostInstance(
  type: string,
  props: ComponentProps,
  hostContext: HostContext,
): Instance {
  if ((type === HOST.node || type === HOST.edge) && !hostContext.inGraph) {
    throw new Error(
      `<${COMPONENT_NAMES[type]}> must be rendered inside a Digraph, Graph or Subgraph.`,
    );
  }
  if (!HOST_TYPES.has(type) && !type.startsWith('dot:')) {
    throw new TypeError(`<${type}> is not an element of @ts-graphviz/react.`);
  }
  return createInstance(type, props);
}
