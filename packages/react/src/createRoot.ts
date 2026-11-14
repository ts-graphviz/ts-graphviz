import type { ReactElement } from 'react';
import type {
  AnyDotObjectModel,
  DotObjectModel,
  FilterableModel,
  ModelClasses,
} from 'ts-graphviz';
import { createModelKit, MODEL, modelOf, ownOptions } from 'ts-graphviz';

import type { Context } from './contexts/GraphvizContext.js';
import { type ErrorInfo, Mount, type MountHandlers } from './mount.js';
import type { AddedStatements, AnyGraphContainer } from './shared/tree.js';

export type { ErrorInfo };

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
   * The graph's DOT DSL (such as `digraph()` returns) can stand for it.
   */
  container?: Container | { readonly [MODEL]: Container };
  /**
   * Model classes used to create graphs, nodes and edges.
   * The default classes are used for the kinds left out.
   */
  models?: Partial<ModelClasses>;
  /**
   * Called when an error is not caught by any error boundary; React has
   * then emptied the tree, and the models it showed are taken out. Also
   * called when a model class throws while the models are updated, and when
   * the renderer itself fails (see {@link GraphvizRoot.render}).
   *
   * An error this callback throws is thrown again outside the render, as an
   * uncaught exception: catch inside it what you do not want to end a
   * Node.js process. The same goes for the other callbacks.
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
   * Called with the top-level models after React committed the tree, once
   * for the commits of one turn: renders in a row are batched by React, so
   * it is called fewer times than `render()`. Not called for a render that
   * ended in an uncaught error.
   */
  onRenderComplete?: (models: AnyDotObjectModel[]) => void;
}

/**
 * A root to render into, again and again, like a root of React.
 */
export interface GraphvizRoot {
  /**
   * Render a React element, or update the tree rendered before. Like
   * `render()` of a React root it returns nothing and does not wait: React
   * renders shortly after, and the result comes through the callbacks of
   * `createRoot` (`onRenderComplete`, or one of the error callbacks). To
   * convert an element once and wait for the models, use `fromElement`.
   *
   * After the renderer itself failed (an error thrown out of React's work,
   * not by a component: `onUncaughtError` gets it), the tree and its state
   * are lost, and its effects are not cleaned up; the next `render()`
   * starts a new one.
   *
   * A tree that suspended as a whole (no `Suspense` above the data it
   * waits for) commits nothing. React renders it to its end when `render()`
   * is called again, so an error of that earlier tree can be reported
   * after the later call.
   *
   * @throws If the root was unmounted.
   */
  render(element: ReactElement): void;
  /**
   * Unmount the tree: its effects are cleaned up and the models it added
   * are taken out of the container. What a cleanup throws is reported to
   * `onUncaughtError`.
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
  getTopLevelModels<T extends AnyDotObjectModel>(
    typeGuard: (model: AnyDotObjectModel) => model is T,
  ): T[];
  getTopLevelModels<T extends DotObjectModel>(
    typeGuard?: (model: DotObjectModel) => model is T,
  ): T[];
}

/**
 * Call a callback of the user's from inside React's work, where an error
 * of its own must not land: it is thrown again outside, as React does for
 * the callbacks it guards itself.
 */
function callOutside<A extends unknown[]>(
  callback: ((...args: A) => void) | undefined,
  ...args: A
): void {
  try {
    callback?.(...args);
  } catch (error) {
    setTimeout(() => {
      throw error;
    });
  }
}

/**
 * Create a Graphviz root for rendering React elements to Graphviz models
 * @param options - Options for creating the root, including optional container
 */
export function createRoot<
  Container extends AnyGraphContainer = AnyGraphContainer,
>(options: CreateRootOptions<Container> = {}): GraphvizRoot {
  // Own properties only: an inherited one is never an option.
  const {
    container: given,
    models,
    onUncaughtError,
    onCaughtError,
    onRecoverableError,
    onRenderComplete,
  } = ownOptions(options);
  const context: Context<Container> = {
    container: modelOf(given) as Container | undefined,
    models: createModelKit(models ?? {}),
  };

  let mount: Mount<Container> | undefined;
  // What the root's trees added, one after the other.
  const added: AddedStatements = new Map();
  let isUnmounted = false;
  // The last commit ended in an uncaught error (React then commits the
  // emptied tree, and reports the error after it).
  let failed = false;
  let completionQueued = false;

  const open = (): Mount<Container> => {
    const handlers: MountHandlers = {
      onUncaughtError: (error, info) => {
        failed = true;
        callOutside(onUncaughtError, error, info);
      },
      onCaughtError: (error, info) => callOutside(onCaughtError, error, info),
      onRecoverableError: (error, info) =>
        callOutside(onRecoverableError, error, info),
      onModelError: (error) => {
        failed = true;
        callOutside(onUncaughtError, error, {});
      },
      onCommit: () => {
        // A tree that suspended as a whole is rendered to its end when the
        // next render starts, and its error is reported then: the commit
        // that follows is that of the new tree.
        failed = false;
        if (onRenderComplete === undefined || completionQueued) return;
        completionQueued = true;
        // After the commits of this turn, the ones effects cause included,
        // and outside React's work, where the callback may throw.
        queueMicrotask(() => {
          completionQueued = false;
          if (failed || mount !== opened || !opened.active) return;
          onRenderComplete([...opened.models]);
        });
      },
      onFailure: (error, own) => {
        // The tree that failed loses its models; another keeps them, to be
        // replaced by the next render.
        opened.discard(own);
        failed = true;
        callOutside(
          onUncaughtError,
          own
            ? error
            : new Error(
                'The renderer failed while it rendered another tree, and this tree was lost with it; render again to start a new one',
                { cause: error },
              ),
          {},
        );
      },
    };
    const opened: Mount<Container> = new Mount(context, handlers, added);
    return opened;
  };

  return {
    render(element: ReactElement): void {
      if (isUnmounted) {
        throw new Error('Cannot render on an unmounted root');
      }
      if (!mount?.active) mount = open();
      failed = false;
      const rendering = mount;
      rendering.render(element);
      // A task of our own, where React is not running: if it says it is,
      // it stopped there.
      setTimeout(() => rendering.checkRenderer());
    },

    unmount(): void {
      if (isUnmounted) {
        return;
      }

      isUnmounted = true;
      mount?.discard(true);
      mount = undefined;
    },

    getTopLevelModels<T extends DotObjectModel>(
      typeGuard?: (model: AnyDotObjectModel) => boolean,
    ): T[] {
      const models = [...(mount?.models ?? [])];
      // The overloads type the result: by the guard, or as the caller says.
      return (typeGuard
        ? models.filter(typeGuard)
        : models) as DotObjectModel[] as T[];
    },
  };
}
