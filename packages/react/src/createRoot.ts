import { createElement, type ReactElement, startTransition } from 'react';
import type { DotObjectModel, FilterableModel } from 'ts-graphviz';
import { isRootGraphModel } from 'ts-graphviz';

import { CurrentGraph } from './contexts/CurrentGraph.js';
import { GraphContainer } from './contexts/GraphContainer.js';
import { GraphMap } from './contexts/GraphMap.js';
import { type Context, GraphvizContext } from './contexts/GraphvizContext.js';
import { ModelCollectorContext } from './contexts/ModelCollector.js';
import { reconciler } from './reconciler.js';
import type { AnyGraphContainer } from './types/container.js';
import type { RenderContainer } from './types/reconciler.js';

/**
 * Error information for React error handling
 */
export interface ErrorInfo {
  componentStack?: string;
}

// Re-export type alias for compatibility
export type TopLevelModel = FilterableModel;

/**
 * Options for creating a Graphviz root
 */
export interface CreateRootOptions {
  /**
   * Called when an error is not caught by any error boundary
   */
  onUncaughtError?: (error: Error, errorInfo: ErrorInfo) => void;
  /**
   * Called when an error is caught by an error boundary
   */
  onCaughtError?: (error: Error, errorInfo: ErrorInfo) => void;
  /**
   * Called when React automatically recovers from errors
   */
  onRecoverableError?: (error: Error, errorInfo: ErrorInfo) => void;
  /**
   * Called when rendering completes successfully
   */
  onRenderComplete?: (models: DotObjectModel[]) => void;
  /**
   * Timeout for async rendering in milliseconds
   * @default 5000
   */
  timeout?: number;
  /**
   * Enable concurrent rendering with startTransition for improved performance
   * @default true
   */
  concurrent?: boolean;
}

/**
 * Graphviz root interface
 */
export interface GraphvizRoot {
  /**
   * Render a React element asynchronously
   */
  render(element: ReactElement): Promise<void>;
  /**
   * Unmount the root and cleanup resources
   */
  unmount(): void;
  /**
   * Get all top-level models that were rendered (no type parameters)
   * @returns Array of rendered models. In container mode, returns all non-container models.
   *          In non-container mode, returns top-level graph models.
   */
  getTopLevelModels(): DotObjectModel[];
  /**
   * Get top-level models with generic type casting or type guard filtering
   *
   * @overload
   * When called with a type guard function, filters models by type using runtime type checking
   * @param typeGuard - Type guard function to filter models
   * @returns Array of models matching the specified type
   *
   * @overload
   * When called with only a generic type parameter, casts all models to the specified type (trusted user assertion)
   * @returns Array of models cast to the specified type T
   *
   * @example
   * ```typescript
   * // Runtime type filtering with type guard
   * const nodes = root.getTopLevelModels(isNodeModel);
   *
   * // Direct type casting (user knows the type)
   * const nodes = root.getTopLevelModels<NodeModel>();
   * ```
   */
  getTopLevelModels<T extends DotObjectModel>(
    typeGuard?: (model: DotObjectModel) => model is T,
  ): T[];
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
  return createElement(
    GraphvizContext.Provider,
    { value: context },
    createElement(
      ModelCollectorContext.Provider,
      { value: { collectModel } },
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
  );
}

/**
 * Creates a fiber root for rendering.
 */
function createFiberRoot<
  Container extends AnyGraphContainer = AnyGraphContainer,
>(containerInfo: RenderContainer<Container>, options: CreateRootOptions = {}) {
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
      ? (error: Error, errorInfo: ErrorInfo = {}) =>
          onUncaughtError(error, errorInfo)
      : noop, // onRecoverableError
    null, // transitionCallbacks
  );
}

/**
 * Validates the rendered models for constraints
 */
function validateModels(
  models: DotObjectModel[],
  container?: AnyGraphContainer,
): void {
  if (container) {
    // With container: no validation needed for top-level graph count
    return;
  }

  // Without container: check for exactly one top-level graph
  const topLevelGraphs = models.filter((model) => model.$$type === 'Graph');

  if (topLevelGraphs.length === 0) {
    throw new Error(
      'No top-level graph found. When not using a container, you must provide exactly one Graph or Digraph component at the top level.',
    );
  }

  if (topLevelGraphs.length > 1) {
    throw new Error(
      `Multiple top-level graphs detected (${topLevelGraphs.length}). ` +
        'DOT language only supports one graph per file. ' +
        'Consider using a container or rendering graphs separately.',
    );
  }
}

/**
 * Internal rendering function
 */
async function renderInternal<
  Container extends AnyGraphContainer = AnyGraphContainer,
>(
  containerInfo: RenderContainer<Container>,
  _context: Context<Container>,
  fiberRoot: any,
  wrappedElement: ReactElement,
  originalContainer: Container | undefined,
  options: CreateRootOptions = {},
): Promise<void> {
  const { timeout = 5000, onRenderComplete } = options;

  return new Promise<void>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Rendering timeout after ${timeout}ms`));
    }, timeout);

    try {
      reconciler.updateContainer(wrappedElement, fiberRoot, null, () => {
        clearTimeout(timeoutId);

        try {
          // Validate the rendered models
          validateModels(containerInfo.renderedModels, originalContainer);

          // Call completion callback
          if (onRenderComplete) {
            onRenderComplete([...containerInfo.renderedModels]);
          }

          resolve();
        } catch (error) {
          reject(error);
        }
      });
    } catch (error) {
      clearTimeout(timeoutId);
      reject(error);
    }
  });
}

/**
 * Create a Graphviz root for rendering React elements to Graphviz models
 */
export function createRoot<
  Container extends AnyGraphContainer = AnyGraphContainer,
>(container?: Container, options: CreateRootOptions = {}): GraphvizRoot {
  const containerInfo: RenderContainer<Container> = {
    renderedModels: [],
  };

  // Use imported type guard for root graph models

  // Model collector function
  const collectModel = (model: DotObjectModel) => {
    if (container) {
      // With container: collect all non-container models at top level only
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
  let isUnmounted = false;

  return {
    async render(element: ReactElement): Promise<void> {
      if (isUnmounted) {
        throw new Error('Cannot render on an unmounted root');
      }

      // Clear previous models for fresh render
      containerInfo.renderedModels = [];

      const wrappedElement = createWrappedElement(
        element,
        context,
        collectModel,
        container,
      );

      const { concurrent = true } = options;

      if (concurrent) {
        return new Promise<void>((resolve, reject) => {
          startTransition(() => {
            renderInternal(
              containerInfo,
              context,
              fiberRoot,
              wrappedElement,
              container,
              options,
            )
              .then(resolve)
              .catch(reject);
          });
        });
      }

      return renderInternal(
        containerInfo,
        context,
        fiberRoot,
        wrappedElement,
        container,
        options,
      );
    },

    unmount(): void {
      if (isUnmounted) {
        return;
      }

      isUnmounted = true;
      reconciler.updateContainer(null, fiberRoot, null, noop);
      containerInfo.renderedModels = [];
    },

    getTopLevelModels<T extends DotObjectModel>(
      typeGuard?: (model: DotObjectModel) => model is T,
    ): any {
      const models = [...containerInfo.renderedModels];
      if (typeGuard) {
        return models.filter(typeGuard);
      }
      return models as T[];
    },
  };
}
