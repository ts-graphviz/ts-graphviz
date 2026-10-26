import { createElement, type ReactElement } from 'react';
import type {
  AnyDotObjectModel,
  DotObjectModel,
  FilterableModel,
  ModelsContext,
} from 'ts-graphviz';
import { createModelsContext, ownOptions } from 'ts-graphviz';

import { CurrentGraph } from './contexts/CurrentGraph.js';
import { GraphContainer } from './contexts/GraphContainer.js';
import { GraphMap } from './contexts/GraphMap.js';
import { type Context, GraphvizContext } from './contexts/GraphvizContext.js';
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
export interface RenderOptions {
  /**
   * Stop waiting for the tree to settle: when the signal aborts, `render()`
   * rejects with `signal.reason` (an `AbortError`, or a `TimeoutError` for
   * `AbortSignal.timeout(ms)`). Without a signal, `render()` waits until
   * the work React scheduled (transitions, deferred values, suspended data)
   * is done; bound it for trees you do not control, e.g.
   * `signal: AbortSignal.timeout(5000)`.
   */
  signal?: AbortSignal;
}

export interface GraphvizRoot {
  /**
   * Render a React element. Resolves once the tree has settled; renders on
   * one root run one after another.
   */
  render(element: ReactElement, options?: RenderOptions): Promise<void>;
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
  container?: Container,
): ReactElement {
  return createElement(
    GraphvizContext.Provider,
    { value: context },
    createElement(
      GraphMap.Provider,
      { value: clusterMap(container) },
      createElement(
        GraphContainer.Provider,
        { value: container ?? null },
        container
          ? createElement(CurrentGraph.Provider, { value: container }, element)
          : element,
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
  } = ownOptions(options);

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
 * Render, wait until no work is left, then check the result.
 *
 * The render and the updates effects schedule run synchronously
 * (`updateContainerSync`, `flushSyncWork`, and the discrete priority of the
 * host config). Work React puts on other lanes (transitions, deferred values,
 * suspended data) runs on its scheduler; `render()` yields to it until the
 * root has no pending lanes, or until `signal` aborts.
 */
async function renderInternal<
  Container extends AnyGraphContainer = AnyGraphContainer,
>(
  containerInfo: RenderContainer<Container>,
  fiberRoot: ReturnType<typeof reconciler.createContainer>,
  wrappedElement: ReactElement,
  originalContainer: Container | undefined,
  options: CreateRootOptions = {},
  isUnmounted: () => boolean = () => false,
  signal?: AbortSignal,
): Promise<void> {
  const { onRenderComplete } = ownOptions(options);
  signal?.throwIfAborted();
  containerInfo.uncaughtErrors = [];
  reconciler.updateContainerSync(wrappedElement, fiberRoot, null, null);
  reconciler.flushSyncWork();
  signal?.throwIfAborted();
  // Passive effects of a render that finished outside the synchronous lane
  // (e.g. the cleanup of a Suspense fallback) are flushed here too.
  while (
    (reconciler.flushPassiveEffects() || hasPendingWork(fiberRoot)) &&
    containerInfo.uncaughtErrors.length === 0
  ) {
    signal?.throwIfAborted();
    await yieldToScheduler();
    if (isUnmounted()) break;
  }
  if (isUnmounted()) {
    throw new Error('The root was unmounted before the render settled');
  }
  signal?.throwIfAborted();
  const [error] = containerInfo.uncaughtErrors;
  if (containerInfo.uncaughtErrors.length > 0) {
    throw error;
  }
  validateModels(containerInfo.renderedModels, originalContainer);
  onRenderComplete?.([...containerInfo.renderedModels]);
}

// FiberRoot#pendingLanes: React's lanes with work left. Internal, which is
// why react-reconciler is pinned to the React minor it was built for.
function hasPendingWork(
  fiberRoot: ReturnType<typeof reconciler.createContainer>,
): boolean {
  return (fiberRoot as { pendingLanes?: number }).pendingLanes !== 0;
}

// Settles like `promise`, or rejects with `signal.reason` as soon as the
// signal aborts, e.g. while the render waits behind another one (which then
// does not run: renderNow checks the signal first).
function rejectOnAbort<T>(
  promise: Promise<T>,
  signal: AbortSignal,
): Promise<T> {
  if (signal.aborted) return Promise.reject(signal.reason);
  return new Promise<T>((resolve, reject) => {
    const onAbort = () => reject(signal.reason);
    signal.addEventListener('abort', onAbort, { once: true });
    promise.then(resolve, reject).finally(() => {
      signal.removeEventListener('abort', onAbort);
    });
  });
}

// A macrotask, so React's scheduler (setImmediate / MessageChannel) and
// resolved promises get to run.
function yieldToScheduler(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
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

  const context: Context<Container> = {
    container,
    models: createModelsContext(models ?? {}),
  };
  // The host config adds the models at commit and lists the rendered ones.
  const containerInfo: RenderContainer<Container> = {
    renderedModels: [],
    uncaughtErrors: [],
    context,
    children: [],
  };

  const fiberRoot = createFiberRoot(containerInfo, otherOptions);
  let isUnmounted = false;

  // Renders on one root run one after another: each waits for the previous
  // to settle, so each sees its own tree, models and errors.
  let previous: Promise<void> = Promise.resolve();

  const renderNow = async (
    element: ReactElement,
    signal?: AbortSignal,
  ): Promise<void> => {
    signal?.throwIfAborted();
    if (isUnmounted) {
      throw new Error('Cannot render on an unmounted root');
    }

    const wrappedElement = createWrappedElement(element, context, container);

    await renderInternal(
      containerInfo,
      fiberRoot,
      wrappedElement,
      container,
      otherOptions,
      () => isUnmounted,
      signal,
    );
  };

  return {
    render(element: ReactElement, options?: RenderOptions): Promise<void> {
      const { signal } = ownOptions(options ?? {});
      const result = previous.then(() => renderNow(element, signal));
      previous = result.catch(noop);
      return signal ? rejectOnAbort(result, signal) : result;
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
