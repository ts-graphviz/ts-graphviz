import type { ReactElement } from 'react';
import type { DotModel, ModelClasses, RootGraphModel } from 'ts-graphviz';
import { createModelKit, MODEL, modelOf, ownOptions } from 'ts-graphviz';

import type { Context } from './contexts/GraphvizContext.js';
import { type ErrorInfo, Mount } from './mount.js';
import type { AnyGraphContainer } from './types/container.js';

/**
 * Options of `fromElement`.
 */
export interface FromElementOptions<
  Container extends AnyGraphContainer = AnyGraphContainer,
> {
  /**
   * A graph to add the element's models to. `fromElement` then resolves
   * with this graph, and the element may have nodes, edges and subgraphs at
   * its top level. The graph's DOT DSL (such as `digraph()` returns) can
   * stand for it; the result is then the graph model, not the DSL.
   *
   * What a conversion added is the graph's own afterwards: a later
   * conversion or root adds to it, and takes nothing of it out.
   */
  container?: Container | { readonly [MODEL]: Container };
  /**
   * Model classes used to create graphs, nodes and edges.
   * The default classes are used for the kinds left out.
   */
  models?: Partial<ModelClasses>;
  /**
   * Stop waiting: when the signal aborts, `fromElement` rejects with
   * `signal.reason` (an `AbortError`, or a `TimeoutError` for
   * `AbortSignal.timeout(ms)`), and nothing stays in the container. Without
   * a signal it waits as long as React has work left; bound it for elements
   * you do not control, e.g. `signal: AbortSignal.timeout(5000)`.
   */
  signal?: AbortSignal;
  /**
   * Called when an error boundary in the element catches an error. If the
   * callback throws, `fromElement` rejects with what it threw.
   */
  onCaughtError?: (error: unknown, errorInfo: ErrorInfo) => void;
  /**
   * Called when React recovers from an error by itself. If the callback
   * throws, `fromElement` rejects with what it threw.
   */
  onRecoverableError?: (error: unknown, errorInfo: ErrorInfo) => void;
}

/**
 * How many times a conversion starts again after the renderer failed while
 * it rendered another tree.
 */
const MAX_ATTEMPTS = 3;

// A macrotask, so React's scheduler (setImmediate / MessageChannel) and
// resolved promises get to run.
function yieldToScheduler(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

/** Why an attempt ended without models. */
type Failure =
  | { kind: 'error'; error: unknown }
  // The renderer failed over another tree: this one can be rendered again.
  | { kind: 'renderer'; error: unknown };

/**
 * Convert a React element to models, once: render it, wait until React has
 * no work left for it, and resolve with the models.
 *
 * Without a container, the element is one or more root graphs (`<Digraph>`,
 * `<Graph>`), and the result is one `Dot` model holding them:
 *
 * ```tsx
 * const dot = toDot(
 *   await fromElement(
 *     <Digraph>
 *       <Node id="a" />
 *     </Digraph>,
 *   ),
 * );
 * ```
 *
 * With a container, the models are added to it and it is the result:
 *
 * ```tsx
 * const G = new Digraph('main');
 * await fromElement(<Node id="a" />, { container: G });
 * ```
 *
 * The render and the updates effects schedule run at once; transitions,
 * deferred values and data read with `use` are waited for. What an effect
 * starts by itself (a timer, a fetch that sets state later) is not. When
 * the models are ready the tree is unmounted, so its effects clean up; the
 * models stay.
 *
 * It rejects with the error no error boundary caught (what an effect's
 * cleanup throws when the tree is unmounted included), with the error a
 * model class threw, with `signal.reason` on abort, and with a `TypeError`
 * when, without a container, the top level has something that is not a root
 * graph. Whenever it rejects, what it added is taken out of the container
 * again (as far as the model classes let it: an error they throw on
 * removal is not reported).
 */
export function fromElement<Container extends AnyGraphContainer>(
  element: ReactElement,
  options: FromElementOptions<Container> & {
    container: Container | { readonly [MODEL]: Container };
  },
): Promise<Container>;
export function fromElement(
  element: ReactElement,
  options?: FromElementOptions & { container?: undefined },
): Promise<DotModel>;
export function fromElement<Container extends AnyGraphContainer>(
  element: ReactElement,
  options?: FromElementOptions<Container>,
): Promise<Container | DotModel>;
export async function fromElement<Container extends AnyGraphContainer>(
  element: ReactElement,
  options: FromElementOptions<Container> = {},
): Promise<Container | DotModel> {
  // Own properties only: an inherited one is never an option.
  const {
    container: given,
    models,
    signal,
    onCaughtError,
    onRecoverableError,
  } = ownOptions(options);
  signal?.throwIfAborted();
  const kit = createModelKit(models ?? {});
  const context: Context<Container> = {
    container: modelOf(given) as Container | undefined,
    models: kit,
  };

  for (let attempt = 1; ; attempt++) {
    // The first failure decides; a wrapper function keeps the narrowing of
    // a variable assigned in callbacks.
    const state: { failure?: Failure } = {};
    const fail = (failure: Failure): void => {
      state.failure ??= failure;
    };
    const failureNow = (): Failure | undefined => state.failure;
    // The callback's own error ends the conversion.
    const guarded =
      (callback?: (error: unknown, info: ErrorInfo) => void) =>
      (error: unknown, info: ErrorInfo): void => {
        try {
          callback?.(error, info);
        } catch (thrown) {
          fail({ kind: 'error', error: thrown });
        }
      };
    const mount: Mount<Container> = new Mount(context, {
      onUncaughtError: (error) => fail({ kind: 'error', error }),
      onCaughtError: guarded(onCaughtError),
      onRecoverableError: guarded(onRecoverableError),
      onModelError: (error) => fail({ kind: 'error', error }),
      onCommit: () => undefined,
      onFailure: (error, own) =>
        fail({ kind: own ? 'error' : 'renderer', error }),
    });
    try {
      mount.renderSync(element);
      while (state.failure === undefined && mount.hasWorkLeft()) {
        signal?.throwIfAborted();
        await yieldToScheduler();
        mount.checkRenderer();
      }
      signal?.throwIfAborted();
      const { failure } = state;
      if (failure?.kind === 'renderer' && attempt < MAX_ATTEMPTS) {
        mount.discard(true);
        continue;
      }
      if (failure !== undefined) {
        throw failure.kind === 'error'
          ? failure.error
          : new Error(
              `The renderer failed ${MAX_ATTEMPTS} times while it rendered other trees`,
              { cause: failure.error },
            );
      }
      if (context.container === undefined && mount.hasOtherThanRootGraphs) {
        throw new TypeError(
          'Without a container, the element must have only <Digraph> or <Graph> at its top level. Pass a container to add nodes, edges or subgraphs to it.',
        );
      }
      const result =
        context.container ?? new kit.Dot(mount.models as RootGraphModel[]);
      // The models stay; the tree goes, and its effects clean up.
      mount.discard(false);
      const whileUnmounting = failureNow();
      if (whileUnmounting !== undefined) throw whileUnmounting.error;
      mount.keep();
      return result;
    } catch (error) {
      mount.discard(true);
      throw error;
    }
  }
}
