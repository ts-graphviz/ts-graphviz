import { type ReactElement, startTransition } from 'react';
import { type DotObjectModel, type RootGraphModel, toDot } from 'ts-graphviz';

import { CurrentGraph } from './contexts/CurrentGraph.js';
import { GraphContainer } from './contexts/GraphContainer.js';
import { GraphMap } from './contexts/GraphMap.js';
import { type Context, GraphvizContext } from './contexts/GraphvizContext.js';
import { ModelCollectorContext } from './contexts/ModelCollector.js';
import { reconciler } from './reconciler.js';
import type { AnyGraphContainer } from './types/container.js';
import type { RenderContainer } from './types/reconciler.js';

/**
 * Rendering result containing the graph and any metadata
 */
export interface RenderResult<Model extends DotObjectModel> {
  models: Model[];
  cleanup?: () => void;
}

/**
 * Rendering options for controlling the rendering behavior
 */
export interface RenderOptions<
  Container extends AnyGraphContainer = AnyGraphContainer,
> {
  /**
   * Container graph to render into. When provided, the element will be rendered
   * as children of this container.
   */
  container?: Container;
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
   */
  onUncaughtError?: (
    error: Error,
    errorInfo: { componentStack?: string },
  ) => void;
  /**
   * Called when an error is caught by an error boundary
   */
  onCaughtError?: (
    error: Error,
    errorInfo: { componentStack?: string },
  ) => void;
}

const noop = (): void => undefined;

function clusterMap(
  graph?: AnyGraphContainer,
  map: Map<string, AnyGraphContainer> = new Map(),
): Map<string, AnyGraphContainer> {
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
function createWrappedElement<Container extends AnyGraphContainer>(
  element: ReactElement,
  context: Context<Container>,
  collectModel: (model: DotObjectModel) => void,
  container?: Container,
): ReactElement {
  return (
    <GraphvizContext value={context}>
      <ModelCollectorContext value={{ collectModel }}>
        <GraphMap value={clusterMap(container)}>
          <GraphContainer value={container ?? null}>
            {container ? (
              <CurrentGraph value={container}>{element}</CurrentGraph>
            ) : (
              element
            )}
          </GraphContainer>
        </GraphMap>
      </ModelCollectorContext>
    </GraphvizContext>
  );
}

/**
 * Creates a fiber root for rendering.
 */
function createFiberRoot<
  Container extends AnyGraphContainer = AnyGraphContainer,
>(
  containerInfo: RenderContainer<Container> = { renderedModels: [] },
  options: RenderOptions = {},
) {
  const { onUncaughtError = noop } = options;

  return reconciler.createContainer(
    containerInfo,
    1, // tag - ConcurrentRoot = 1 for concurrent mode (React 19 default)
    null, // hydrationCallbacks
    false, // isStrictMode
    null, // concurrentUpdatesByDefaultOverride
    '@ts-graphviz/react', // identifierPrefix
    // Enhance onRecoverableError to forward componentStack for better diagnostics
    onUncaughtError
      ? (error: Error, errorInfo: { componentStack?: string } = {}) =>
          onUncaughtError(error, errorInfo)
      : () => {}, // onRecoverableError
    null, // transitZionCallbacks
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
async function renderInternal<
  Model extends DotObjectModel = RootGraphModel,
  Container extends AnyGraphContainer = AnyGraphContainer,
>(
  element: ReactElement,
  options: RenderOptions<Container> = {},
): Promise<RenderResult<Model>> {
  const { container, timeout = 5000 } = options;
  const containerInfo: RenderContainer<Container> = {
    renderedModels: [],
  };

  // Type guard for root graph models (Graph/Digraph)
  const isRootGraphModel = (model: DotObjectModel): boolean => {
    return model.$$type === 'Graph';
  };

  // Model collector function - collect all models
  const collectModel = (model: DotObjectModel) => {
    if (container) {
      // With container: collect all non-container models
      if (model !== container) {
        containerInfo.renderedModels.push(model);
      }
    } else {
      // Without container: collect all root graph models (Graph/Digraph)
      if (isRootGraphModel(model)) {
        containerInfo.renderedModels.push(model);
      }
    }
  };

  const context: Context<Container> = {
    container,
  };
  containerInfo.context = context;
  const fiberRoot = createFiberRoot(containerInfo, options);
  const wrappedElement = createWrappedElement(
    element,
    context,
    collectModel,
    container,
  );

  return new Promise<RenderResult<Model>>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Rendering timeout after ${timeout}ms`));
    }, timeout);

    try {
      reconciler.updateContainer(wrappedElement, fiberRoot, null, () => {
        clearTimeout(timeoutId);

        if (containerInfo.renderedModels.length > 0 || container) {
          resolve({
            models: containerInfo.renderedModels as Model[],
            cleanup: () => {
              // Cleanup resources if needed
              reconciler.updateContainer(null, fiberRoot, null, noop);
            },
          });
        } else {
          reject(
            new Error(
              'No model was rendered. Ensure your React component creates at least one Graphviz element.',
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
export async function render<
  Model extends DotObjectModel = RootGraphModel,
  Container extends AnyGraphContainer = AnyGraphContainer,
>(
  element: ReactElement,
  options: RenderOptions<Container> = {},
): Promise<RenderResult<Model>> {
  const { concurrent = true } = options;

  if (concurrent) {
    return new Promise<RenderResult<Model>>((resolve, reject) => {
      startTransition(() => {
        renderInternal<Model, Container>(element, options)
          .then(resolve)
          .catch(reject);
      });
    });
  }
  return renderInternal<Model, Container>(element, options);
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
export async function renderToDot<
  Model extends DotObjectModel = RootGraphModel,
  Container extends AnyGraphContainer = AnyGraphContainer,
>(
  element: ReactElement,
  options: RenderOptions<Container> = {},
): Promise<string> {
  const result = await render<Model, Container>(element, options);
  try {
    // Convert the first model or container to DOT
    const modelToRender = result.models[0] || options.container;
    if (!modelToRender) {
      throw new Error('No model to render');
    }
    return toDot(modelToRender);
  } finally {
    // Cleanup resources
    result.cleanup?.();
  }
}
