import {
  createElement,
  type ReactElement,
  type ReactNode,
  useContext,
  useMemo,
} from 'react';
import { type ModelsContext, ownOptions } from 'ts-graphviz';
import { CurrentGraph } from '../contexts/CurrentGraph.js';
import { GraphContainer } from '../contexts/GraphContainer.js';
import { useGraphContainer } from '../hooks/useGraphContainer.js';
import { useGraphvizContext } from '../hooks/useGraphvizContext.js';
import { HOST, hostProps, identityKey } from '../host.js';
import type { AnyGraphContainer } from '../types/container.js';

/**
 * Render a graph as a host element. The model is made here, without adding
 * it anywhere (the commit does that), so that the children can get it from
 * `useCurrentGraph`. A new id makes a new model.
 */
export function useHostGraph(
  props: {
    id?: string;
    strict?: boolean;
    label?: unknown;
    children?: ReactNode;
  },
  create: (
    models: ModelsContext,
    parent: AnyGraphContainer | null,
  ) => AnyGraphContainer,
  root: boolean,
): ReactElement {
  const container = useGraphContainer();
  if (root && container !== null) {
    throw Error(
      'RootCluster is duplicated.\nUse only one of Digraph and Graph.',
    );
  }
  const { models } = useGraphvizContext();
  const parent = useContext(CurrentGraph);
  const { id, strict, children } = ownOptions(props);
  // biome-ignore lint/correctness/useExhaustiveDependencies: the model is made from the id and strict
  const model = useMemo(
    () => create(models, parent),
    [models, parent, id, strict],
  );
  let content = (
    <CurrentGraph.Provider value={model}>{children}</CurrentGraph.Provider>
  );
  if (root) {
    content = (
      <GraphContainer.Provider value={model}>{content}</GraphContainer.Provider>
    );
  }
  return createElement(
    HOST.graph,
    // A new model, a new host element (and a ref set again).
    { ...hostProps(props), model, key: identityKey(model) },
    content,
  );
}
