import { ReactElement, createElement } from 'react';
import { GraphBaseModel, toDot } from 'ts-graphviz';

import { ClusterMap } from './contexts/ClusterMap.js';
import { ContainerCluster } from './contexts/ContainerCluster.js';
import { CurrentCluster } from './contexts/CurrentCluster.js';
import { GraphvizContext, IContext } from './contexts/GraphvizContext.js';
import { NoContainerErrorMessage } from './errors.js';
import { reconciler } from './reconciler.js';

const noop = (): void => undefined;

function clusterMap(
  cluster?: GraphBaseModel,
  map: Map<string, GraphBaseModel> = new Map(),
): Map<string, GraphBaseModel> {
  if (cluster) {
    if (cluster.id) {
      map.set(cluster.id, cluster);
    }
    for (const s of cluster.subgraphs) {
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
export function render(
  element: ReactElement,
  container?: GraphBaseModel,
): GraphBaseModel {
  const context: IContext = { container };
  reconciler.updateContainer(
    createElement(
      GraphvizContext.Provider,
      { value: context },
      createElement(
        ClusterMap.Provider,
        { value: clusterMap(container) },
        createElement(
          ContainerCluster.Provider,
          { value: container ?? null },
          container
            ? createElement(
                CurrentCluster.Provider,
                { value: container },
                element,
              )
            : element,
        ),
      ),
    ),
    reconciler.createContainer({}, 0, false, null),
    null,
    noop,
  );
  if (!context.container) {
    throw Error(NoContainerErrorMessage);
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
  container?: GraphBaseModel,
): string {
  return toDot(render(element, container));
}
