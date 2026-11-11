import { createElement, type ReactElement } from 'react';
import type { DotObjectModel, FilterableModel } from 'ts-graphviz';
import { isRootGraphModel } from 'ts-graphviz';
import { CurrentGraph } from './contexts/CurrentGraph.js';
import { GraphContainer } from './contexts/GraphContainer.js';
import { GraphMap } from './contexts/GraphMap.js';
import { type Context, GraphvizContext } from './contexts/GraphvizContext.js';
import { ModelCollectorContext } from './contexts/ModelCollector.js';
import { ownOptions } from './own-options.js';
import { createReconciler, type Reconciler } from './reconciler.js';
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
   * Timeout for rendering in milliseconds.
   *
   * Rendering is synchronous, so the timeout does not interrupt it: a render
   * that took longer rejects once its work is done.
   * @default 5000
   */
  timeout?: number;
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
 * Where an error thrown by a user's error callback goes: the renders of the
 * root that have not settled. They share its tree, so each of them fails.
 */
type CallbackErrors = Set<(error: unknown) => void>;

/**
 * Creates a fiber root for rendering.
 */
function createFiberRoot<
  Container extends AnyGraphContainer = AnyGraphContainer,
>(
  reconciler: Reconciler,
  containerInfo: RenderContainer<Container>,
  callbackErrors: CallbackErrors,
  options: CreateRootOptions = {},
) {
  const {
    onUncaughtError = noop,
    onCaughtError = noop,
    onRecoverableError = noop,
  } = options;
  // Adapt React's error information to the public callback interface.
  const forward =
    (callback: (error: Error, errorInfo: ErrorInfo) => void) =>
    (error: unknown, errorInfo: { componentStack?: string | null }) => {
      try {
        callback(error as Error, {
          componentStack: errorInfo?.componentStack ?? undefined,
        });
      } catch (callbackError) {
        // Reject the renders in progress with it, or drop it.
        for (const fail of [...callbackErrors]) {
          fail(callbackError);
        }
      }
    };

  return reconciler.createContainer(
    containerInfo,
    1, // tag - ConcurrentRoot = 1 for concurrent mode (React 19 default)
    null, // hydrationCallbacks
    false, // isStrictMode
    null, // concurrentUpdatesByDefaultOverride
    '@ts-graphviz/react', // identifierPrefix
    forward(onUncaughtError),
    forward(onCaughtError),
    forward(onRecoverableError),
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
      `Multiple top-level graphs detected (${topLevelGraphs.length}). DOT language only supports one graph per file. Consider using a container or rendering graphs separately.`,
    );
  }
}

/**
 * Internal rendering function
 */
async function renderInternal<
  Container extends AnyGraphContainer = AnyGraphContainer,
>(
  reconciler: Reconciler,
  containerInfo: RenderContainer<Container>,
  callbackErrors: CallbackErrors,
  fiberRoot: any,
  wrappedElement: ReactElement,
  originalContainer: Container | undefined,
  options: CreateRootOptions = {},
  onFlushError: (error: unknown) => void = noop,
): Promise<void> {
  const { timeout = 5000, onRenderComplete } = options;

  return new Promise<void>((resolve, reject) => {
    const timeoutError = () =>
      new Error(`Rendering timeout after ${timeout}ms`);
    // Settle once: a commit that comes after the timeout (such as a retry of
    // a suspended tree) must not validate or report a rejected render.
    let settled = false;
    const fail = (error: unknown) => {
      if (!settled) {
        settled = true;
        clearTimeout(timeoutId);
        release();
        reject(error);
      }
    };
    const release = () => {
      callbackErrors.delete(fail);
    };
    callbackErrors.add(fail);
    const timeoutId = setTimeout(() => {
      fail(timeoutError());
    }, timeout);
    const startedAt = performance.now();
    // The commit callback can run inside flushSyncWork, before the rest of
    // the work (such as passive effects) is done: settle only once that work
    // has finished without throwing.
    let flushing = true;
    let committed = false;

    const settle = () => {
      if (settled) {
        return;
      }
      try {
        // The work runs synchronously, so the timer cannot fire while it
        // runs: check the time it took instead.
        if (performance.now() - startedAt > timeout) {
          throw timeoutError();
        }

        // Validate the rendered models
        validateModels(containerInfo.renderedModels, originalContainer);

        // Call completion callback
        if (onRenderComplete) {
          onRenderComplete([...containerInfo.renderedModels]);
        }

        settled = true;
        clearTimeout(timeoutId);
        release();
        resolve();
      } catch (error) {
        fail(error);
      }
    };

    try {
      // Render synchronously, so an error thrown by React's work loop
      // rejects this render.
      reconciler.updateContainerSync(wrappedElement, fiberRoot, null, () => {
        committed = true;
        if (!flushing) {
          settle();
        }
      });
      reconciler.flushSyncWork();
      flushing = false;
      if (committed) {
        settle();
      }
    } catch (error) {
      flushing = false;
      fail(error);
      onFlushError(error);
    }
  });
}

/**
 * Create a Graphviz root for rendering React elements to Graphviz models
 * @param options - Options for creating the root, including optional container
 */
export function createRoot<
  Container extends AnyGraphContainer = AnyGraphContainer,
>(options: CreateRootOptions<Container> = {}): GraphvizRoot {
  // Own properties only: an inherited one is never an option.
  const { container, ...rest } = ownOptions(options);
  const otherOptions = ownOptions(rest);

  const containerInfo: RenderContainer<Container> = {
    renderedModels: [],
  };

  // Use imported type guard for root graph models

  // Counts the fiber roots of this root: a tree left on a replaced one
  // collects nothing.
  let generation = 0;

  // Model collector function, for the trees of one fiber root
  const collectModelFor = (owner: number) => (model: DotObjectModel) => {
    if (owner !== generation) {
      return;
    }
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

  const callbackErrors: CallbackErrors = new Set();
  let reconciler = createReconciler();
  let fiberRoot = createFiberRoot(
    reconciler,
    containerInfo,
    callbackErrors,
    otherOptions,
  );
  // An error thrown out of React's work loop can leave the reconciler in the
  // middle of its work. Reject the other renders in progress with it, and
  // continue with a new reconciler and fiber root.
  const replaceAfterFlushError = (error: unknown) => {
    for (const fail of [...callbackErrors]) {
      fail(error);
    }
    generation++;
    reconciler = createReconciler();
    fiberRoot = createFiberRoot(
      reconciler,
      containerInfo,
      callbackErrors,
      otherOptions,
    );
  };
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
        collectModelFor(generation),
        container,
      );

      return renderInternal(
        reconciler,
        containerInfo,
        callbackErrors,
        fiberRoot,
        wrappedElement,
        container,
        otherOptions,
        replaceAfterFlushError,
      );
    },

    unmount(): void {
      if (isUnmounted) {
        return;
      }

      isUnmounted = true;
      containerInfo.renderedModels = [];
      try {
        reconciler.updateContainerSync(null, fiberRoot, null, noop);
        reconciler.flushSyncWork();
      } catch {
        // The root is discarded with its own reconciler: a failure while
        // tearing it down must not hide the result of the render.
      }
    },

    getTopLevelModels<T extends DotObjectModel>(
      typeGuard?: (model: DotObjectModel) => model is T,
    ) {
      const models = [...containerInfo.renderedModels];
      if (typeGuard) {
        return models.filter(typeGuard);
      }
      return models as T[];
    },
  };
}
