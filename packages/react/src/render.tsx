import { createElement, type ReactElement, startTransition } from 'react';
import { type GraphBaseModel, toDot } from 'ts-graphviz';

import { CurrentGraph } from './contexts/CurrentGraph.js';
import { GraphContainer } from './contexts/GraphContainer.js';
import { GraphMap } from './contexts/GraphMap.js';
import { type Context, GraphvizContext } from './contexts/GraphvizContext.js';
import { reconciler } from './reconciler.js';

/**
 * Rendering result containing the graph and any metadata
 */
export interface RenderResult<T extends GraphBaseModel> {
  graph: T;
  cleanup?: () => void;
}

/**
 * Rendering options for controlling the rendering behavior
 */
export interface RenderOptions<T extends GraphBaseModel = GraphBaseModel> {
  /**
   * Container graph to render into. When provided, the element will be rendered
   * as children of this container.
   */
  container?: T;
  /**
   * Enable concurrent rendering with startTransition for improved performance
   * @default true
   */
  concurrent?: boolean;
  /**
   * Timeout for async rendering in milliseconds
   * @default 5000
   */
  timeout?: number;
  /**
   * Called when an error is not caught by any error boundary
   * React 19 error handling pattern
   */
  onUncaughtError?: (
    error: Error,
    errorInfo: { componentStack?: string },
  ) => void;
  /**
   * Called when an error is caught by an error boundary
   * React 19 error handling pattern
   */
  onCaughtError?: (
    error: Error,
    errorInfo: { componentStack?: string },
  ) => void;
}

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
 * Creates the wrapped React element with all necessary context providers
 */
function createWrappedElement<T extends GraphBaseModel>(
  element: ReactElement,
  context: Context<T>,
  container?: T,
): ReactElement {
  return (
    <GraphvizContext value={context}>
      <GraphMap value={clusterMap(container)}>
        <GraphContainer value={container ?? null}>
          {container ? (
            <CurrentGraph value={container}>{element}</CurrentGraph>
          ) : (
            element
          )}
        </GraphContainer>
      </GraphMap>
    </GraphvizContext>
  );
}

/**
 * Creates a fiber root for rendering with React 19 error handling
 */
function createFiberRoot(containerInfo: any = {}, options: RenderOptions = {}) {
  const { onUncaughtError = noop } = options;

  return reconciler.createContainer(
    containerInfo,
    1, // tag - ConcurrentRoot = 1 for concurrent mode (React 19 default)
    null, // hydrationCallbacks
    false, // isStrictMode
    null, // concurrentUpdatesByDefaultOverride
    '@ts-graphviz/react', // identifierPrefix
    onUncaughtError ? (error: Error) => onUncaughtError(error, {}) : () => {}, // onRecoverableError - simplified for React reconciler compatibility
    null, // transitionCallbacks
  );
}

/**
 * Convert the given element to Graphviz model.
 *
 * @example Example of giving a cluster as a container in options.
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
 * const G = digraph(async (g) => {
 *   const result = await render(<Example />, { container: g });
 *   return result.graph;
 * });
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

/**
 * Internal rendering function without concurrent wrapper
 */
async function renderInternal<T extends GraphBaseModel>(
  element: ReactElement,
  options: RenderOptions<T> = {},
): Promise<RenderResult<T>> {
  const { container, timeout = 5000 } = options;
  const context: Context<T> = { container };
  const containerInfo: any = { context };
  const fiberRoot = createFiberRoot(containerInfo, options);
  const wrappedElement = createWrappedElement(element, context, container);

  return new Promise<RenderResult<T>>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Rendering timeout after ${timeout}ms`));
    }, timeout);

    try {
      reconciler.updateContainer(wrappedElement, fiberRoot, null, () => {
        clearTimeout(timeoutId);

        // Check both places for the container
        const finalContainer =
          containerInfo.context?.container || context.container;

        if (finalContainer) {
          resolve({
            graph: finalContainer,
            cleanup: () => {
              // Cleanup resources if needed
              reconciler.updateContainer(null, fiberRoot, null, noop);
            },
          });
        } else {
          reject(
            new Error(
              'There are no clusters of container(Subgraph, Digraph, Graph).',
            ),
          );
        }
      });
    } catch (error) {
      clearTimeout(timeoutId);
      reject(error);
    }
  });
}

/**
 * Renders a React element asynchronously.
 * This is the primary rendering method with optional concurrent features.
 */
export async function render<T extends GraphBaseModel>(
  element: ReactElement,
  options: RenderOptions<T> = {},
): Promise<RenderResult<T>> {
  const { concurrent = true } = options;

  if (concurrent) {
    return new Promise<RenderResult<T>>((resolve, reject) => {
      startTransition(() => {
        renderInternal(element, options).then(resolve).catch(reject);
      });
    });
  }
  return renderInternal(element, options);
}

/**
 * Converts the given element to DOT language asynchronously.
 * This is the primary DOT rendering method.
 *
 * @example
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
 * const dot = await renderToDot(<Example />);
 * console.log(dot);
 * ```
 */
export async function renderToDot(
  element: ReactElement,
  options: RenderOptions = {},
): Promise<string> {
  const result = await render(element, options);
  try {
    return toDot(result.graph as any);
  } finally {
    // Cleanup resources
    result.cleanup?.();
  }
}
