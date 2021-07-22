import { ReactElement, createElement } from 'react';
import { toDot, ICluster } from 'ts-graphviz';

import { reconciler } from './reconciler';
import { IContext, GraphvizContext } from './contexts/GraphvizContext';
import { ClusterMap } from './contexts/ClusterMap';
import { ContainerCluster } from './contexts/ContainerCluster';
import { CurrentCluster } from './contexts/CurrentCluster';
import { NoContainerErrorMessage } from './errors';

const noop = (): void => undefined;

function clusterMap(cluster?: ICluster, map: Map<string, ICluster> = new Map()): Map<string, ICluster> {
  if (cluster) {
    if (cluster.id) {
      map.set(cluster.id, cluster);
    }
    cluster.subgraphs.forEach((s) => clusterMap(s, map));
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
export function render(element: ReactElement, container?: ICluster): ICluster {
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
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          { value: container ?? null! },
          container ? createElement(CurrentCluster.Provider, { value: container }, element) : element,
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
export function renderToDot(element: ReactElement, container?: ICluster): string {
  return toDot(render(element, container));
}
