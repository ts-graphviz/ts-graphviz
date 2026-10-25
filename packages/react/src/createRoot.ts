import { createElement, type ReactElement } from 'react';
import type {
  AnyDotObjectModel,
  DotObjectModel,
  FilterableModel,
  ModelsContext,
} from 'ts-graphviz';
import { createModelsContext, isRootGraphModel, ownOptions } from 'ts-graphviz';

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
export interface CreateRootOptions<
  Container extends AnyGraphContainer = AnyGraphContainer,
> {
  /**
   * Container graph for rendering components.
   * When provided, components will be rendered into this existing graph model.
   */
  container?: Container;
  /**
   * Model classes used to create graphs, nodes and edges.
   * Defaults to the classes registered in `RootModelsContext`.
   */
  models?: Partial<ModelsContext>;
  /**
   * Called when an error is not caught by any error boundary. `render()`
   * also rejects with it.
   */
  onUncaughtError?: (error: unknown, errorInfo: ErrorInfo) => void;
  /**
   * Called when an error boundary in the rendered tree catches an error.
   */
  onCaughtError?: (error: unknown, errorInfo: ErrorInfo) => void;
  /**
   * Called when React recovers from an error by itself.
   */
  onRecoverableError?: (error: unknown, errorInfo: ErrorInfo) => void;
  /**
   * Called when rendering completes successfully
   */
  onRenderComplete?: (models: AnyDotObjectModel[]) => void;
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
  getTopLevelModels(): AnyDotObjectModel[];
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
  collectModel: (model: AnyDotObjectModel) => void,
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

function toErrorInfo(info: { componentStack?: string | null }): ErrorInfo {
  return info.componentStack == null
    ? {}
    : { componentStack: info.componentStack };
}

/**
 * Creates a fiber root for rendering. An uncaught error is recorded on the
 * container, so that `render()` can reject with it.
 */
function createFiberRoot<
  Container extends AnyGraphContainer = AnyGraphContainer,
>(containerInfo: RenderContainer<Container>, options: CreateRootOptions = {}) {
  const {
    onUncaughtError = noop,
    onCaughtError = noop,
    onRecoverableError = noop,
  } = options;

  // react-reconciler 0.34's createContainer (React 19.3).
  return reconciler.createContainer(
    containerInfo,
    1, // tag: ConcurrentRoot
    null, // hydrationCallbacks
    false, // isStrictMode
    null, // concurrentUpdatesByDefaultOverride
    '@ts-graphviz/react', // identifierPrefix
    (error, info) => {
      containerInfo.uncaughtErrors.push(error);
      onUncaughtError(error, toErrorInfo(info));
    },
    (error, info) => onCaughtError(error, toErrorInfo(info)),
    (error, info) => onRecoverableError(error, toErrorInfo(info)),
    noop, // onDefaultTransitionIndicator
    null, // transitionCallbacks
  );
}

/**
 * Validates the rendered models for constraints
 */
function validateModels(
  models: AnyDotObjectModel[],
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
      `Multiple top-level graphs detected (${topLevelGraphs.length}). DOT language only supports one graph per file. Consider using a container or rendering graphs separately.`,
    );
  }
}

/**
 * Render synchronously (`updateContainerSync` and `flushSyncWork`), then
 * check the result.
 */
function renderInternal<
  Container extends AnyGraphContainer = AnyGraphContainer,
>(
  containerInfo: RenderContainer<Container>,
  fiberRoot: ReturnType<typeof reconciler.createContainer>,
  wrappedElement: ReactElement,
  originalContainer: Container | undefined,
  options: CreateRootOptions = {},
): void {
  const { onRenderComplete } = options;
  containerInfo.uncaughtErrors = [];
  reconciler.updateContainerSync(wrappedElement, fiberRoot, null, null);
  // Updates that effects schedule are synchronous too (see the host config's
  // update priorities), so the tree has settled once sync work is flushed.
  reconciler.flushSyncWork();
  const [error] = containerInfo.uncaughtErrors;
  if (containerInfo.uncaughtErrors.length > 0) {
    throw error;
  }
  validateModels(containerInfo.renderedModels, originalContainer);
  onRenderComplete?.([...containerInfo.renderedModels]);
}

/**
 * Create a Graphviz root for rendering React elements to Graphviz models
 * @param options - Options for creating the root, including optional container
 */
export function createRoot<
  Container extends AnyGraphContainer = AnyGraphContainer,
>(options: CreateRootOptions<Container> = {}): GraphvizRoot {
  // Own properties only: an inherited one is never an option (#1757).
  const { container, models, ...rest } = ownOptions(options);
  const otherOptions = ownOptions(rest);

  const containerInfo: RenderContainer<Container> = {
    renderedModels: [],
    uncaughtErrors: [],
  };

  // Use imported type guard for root graph models

  // Model collector function
  const collectModel = (model: AnyDotObjectModel) => {
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
    models: createModelsContext(models ?? {}),
  };
  containerInfo.context = context;

  const fiberRoot = createFiberRoot(containerInfo, otherOptions);
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

      renderInternal(
        containerInfo,
        fiberRoot,
        wrappedElement,
        container,
        otherOptions,
      );
    },

    unmount(): void {
      if (isUnmounted) {
        return;
      }

      isUnmounted = true;
      reconciler.updateContainerSync(null, fiberRoot, null, null);
      reconciler.flushSyncWork();
      containerInfo.renderedModels = [];
    },

    getTopLevelModels<T extends DotObjectModel>(
      typeGuard?: (model: DotObjectModel) => model is T,
    ) {
      const models = [...containerInfo.renderedModels];
      if (typeGuard) {
        return models.filter(typeGuard);
      }
      return models as DotObjectModel[] as T[];
    },
  };
}
