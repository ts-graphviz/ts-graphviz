import type { ReactElement } from 'react';
import { toDot } from 'ts-graphviz';

import { type CreateRootOptions, createRoot } from './createRoot.js';
import type { AnyGraphContainer } from './types/container.js';

/**
 * Rendering options for renderToDot
 */
export interface RenderToDotOptions<
  Container extends AnyGraphContainer = AnyGraphContainer,
> extends CreateRootOptions {
  /**
   * Container graph to render into. When provided, the element will be rendered
   * as children of this container and the container's DOT will be returned.
   */
  container?: Container;
}

/**
 * Converts the given React element to DOT language asynchronously.
 *
 * This function creates a Graphviz root, renders the element, and returns the DOT representation.
 *
 * @example Single top-level graph
 * ```tsx
 * const dot = await renderToDot(
 *   <Digraph id="example">
 *     <Node id="a" />
 *     <Node id="b" />
 *     <Edge targets={['a', 'b']} />
 *   </Digraph>
 * );
 * console.log(dot);
 * // digraph "example" {
 * //   "a";
 * //   "b";
 * //   "a" -> "b";
 * // }
 * ```
 *
 * @example With container
 * ```tsx
 * const container = new DigraphModel('main');
 * const dot = await renderToDot(
 *   <>
 *     <Node id="a" />
 *     <Subgraph id="cluster_sub">
 *       <Node id="b" />
 *     </Subgraph>
 *     <Edge targets={['a', 'b']} />
 *   </>,
 *   { container }
 * );
 * console.log(dot);
 * // digraph "main" {
 * //   "a";
 * //   subgraph "cluster_sub" {
 * //     "b";
 * //   }
 * //   "a" -> "b";
 * // }
 * ```
 */
export async function renderToDot<
  Container extends AnyGraphContainer = AnyGraphContainer,
>(
  element: ReactElement,
  options: RenderToDotOptions<Container> = {},
): Promise<string> {
  const { container, ...rootOptions } = options;

  if (container) {
    // Container mode: render elements into container and return container's DOT
    const root = createRoot({ container, ...rootOptions });

    try {
      await root.render(element);
      return toDot(container);
    } finally {
      root.unmount();
    }
  } else {
    // Non-container mode: render single top-level graph and return its DOT
    const root = createRoot(rootOptions);

    try {
      await root.render(element);
      const models = root.getTopLevelModels();

      if (models.length !== 1) {
        throw new Error(
          `Expected exactly one top-level graph, but got ${models.length}. ` +
            'Use a container or ensure only one Graph/Digraph component is at the top level.',
        );
      }

      return toDot(models[0]);
    } finally {
      root.unmount();
    }
  }
}
