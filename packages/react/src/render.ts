import { createElement, type ReactElement } from 'react';
import { type GraphBaseModel, type RootGraphModel, toDot } from 'ts-graphviz';

import { CurrentGraph } from './contexts/CurrentGraph.js';
import { GraphContainer } from './contexts/GraphContainer.js';
import { GraphMap } from './contexts/GraphMap.js';
import { type Context, GraphvizContext } from './contexts/GraphvizContext.js';
import { reconciler } from './reconciler.js';

const noop = (): void => undefined;

function clusterMap(
  graph?: GraphBaseModel,
  map: Map<string, GraphBaseModel> = new Map(),
): Map<string, GraphBaseModel> {
  if (graph) {
    if (graph.id) {
      map.set(graph.id, graph);
    }
    for (const s of graph.subgraphs) {
      clusterMap(s, map);
    }
  }
  return map;
}

/**
 * Convert the given element to Graphviz model.
 *
 * @example Example of giving a cluster as a container with the second argument.
 *
 * ```tsx
 * import React, { FC } from 'react';
 * import { digraph, toDot } from 'ts-graphviz';
 * import { Node, Subgraph, render, Edge } from '@ts-graphviz/react';
 *
 * const Example: FC = () => (
 *   <>
 *     <Node id="a" />
 *
 *     <Subgraph id="my_cluster">
 *       <Node id="b" />
 *     </Subgraph>
 *     <Edge targets={['b', 'a']} />
 *   </>
 * );
 *
 * const G = digraph((g) => render(<Example />, g));
 * console.log(toDot(G));
 * // digraph {
 * //   "a";
 * //   subgraph "my_cluster" {
 * //     "b";
 * //   }
 * //   "b" -> "a";
 * // }
 * ```
 */
export function render<T extends GraphBaseModel>(
  element: ReactElement,
  container?: T,
): T {
  const context: Context<T> = { container };
  reconciler.updateContainer(
    createElement(
      GraphvizContext.Provider,
      { value: context },
      createElement(
        GraphMap.Provider,
        { value: clusterMap(container) },
        createElement(
          GraphContainer.Provider,
          { value: container ?? null },
          container
            ? createElement(
                CurrentGraph.Provider,
                { value: container },
                element,
              )
            : element,
        ),
      ),
    ),
    reconciler.createContainer(
      {},
      0,
      null,
      true,
      null,
      '@ts-graphviz/react',
      noop,
      null,
    ),
    null,
    noop,
  );
  if (!context.container) {
    throw Error(
      'There are no clusters of container(Subgraph, Digraph, Graph).',
    );
  }
  return context.container;
}

/**
 * Converts the given element to DOT language and returns it.
 *
 * @example
 *
 * ```tsx
 * import React, { FC } from 'react';
 * import { Digraph, Node, Subgraph, renderToDot, Edge } from '@ts-graphviz/react';
 *
 * const Example: FC = () => (
 *   <Digraph>
 *     <Node id="a" />
 *     <Subgraph id="my_cluster">
 *       <Node id="b" />
 *     </Subgraph>
 *     <Edge targets={['b', 'a']} />
 *   </Digraph>
 * );
 *
 * const dot = renderToDot(<Example />);
 * console.log(dot);
 * // digraph {
 * //   "a";
 * //   subgraph "my_cluster" {
 * //     "b";
 * //   }
 * //   "b" -> "a";
 * // }
 * ```
 *
 * @returns Rendered dot string
 */
export function renderToDot(
  element: ReactElement,
  container?: RootGraphModel,
): string {
  return toDot(render(element, container));
}
