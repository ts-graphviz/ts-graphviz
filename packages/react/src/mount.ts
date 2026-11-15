import { createElement, type ReactElement } from 'react';
import type { AnyDotObjectModel } from 'ts-graphviz';
import { CurrentGraph } from './contexts/CurrentGraph.js';
import { GraphContainer } from './contexts/GraphContainer.js';
import { GraphMap } from './contexts/GraphMap.js';
import { type Context, GraphvizContext } from './contexts/GraphvizContext.js';
import { keepStatements, syncContainer } from './host.js';
import {
  currentGeneration,
  type FiberRoot,
  type RendererGeneration,
} from './reconciler.js';
import type { AnyGraphContainer } from './types/container.js';
import type { AddedStatements, RenderContainer } from './types/reconciler.js';

/**
 * Error information for React error handling
 */
export interface ErrorInfo {
  componentStack?: string;
}

/**
 * What the owner of a mounted tree is told. None of these may throw: they
 * are called from inside React's commit.
 */
export interface MountHandlers {
  /** No error boundary caught the error; React has emptied the tree. */
  onUncaughtError(error: unknown, info: ErrorInfo): void;
  onCaughtError(error: unknown, info: ErrorInfo): void;
  onRecoverableError(error: unknown, info: ErrorInfo): void;
  /**
   * A model class threw while the models were made to match a commit. The
   * mount is discarded and what it added is taken out again.
   */
  onModelError(error: unknown): void;
  /** The models match a commit. */
  onCommit(): void;
  /**
   * The renderer failed and can run nothing more, this tree included;
   * `own`: while it worked on this tree. Discarding the mount is left to
   * the owner, which decides whether the models go with it.
   */
  onFailure(error: unknown, own: boolean): void;
}

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
): ReactElement {
  const { container } = context;
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
 * One tree React renders, and the models it adds. `createRoot` and
 * `fromElement` are both made of it.
 */
export class Mount<Container extends AnyGraphContainer = AnyGraphContainer> {
  readonly #generation: RendererGeneration = currentGeneration();
  readonly #containerInfo: RenderContainer<Container>;
  readonly #fiberRoot: FiberRoot;
  readonly #context: Context<Container>;
  // The owner is told about errors until React has unmounted the tree.
  #reporting = true;
  #rolledBack = false;

  /**
   * @param added What the tree added to each graph. The trees of one root
   * share it: the next one replaces what a lost one left.
   */
  constructor(
    context: Context<Container>,
    handlers: MountHandlers,
    added: AddedStatements = new Map(),
  ) {
    this.#context = context;
    this.#containerInfo = {
      renderedModels: [],
      context,
      children: [],
      added,
      active: true,
      onCommit: handlers.onCommit,
      onSyncError: (error) => {
        this.discard(true);
        handlers.onModelError(error);
      },
    };
    // Work of a tree that was given up may still report when it is gone:
    // that is not the owner's any more. What its effects throw while React
    // unmounts it still is.
    const whileActive =
      (handler: (error: unknown, info: ErrorInfo) => void) =>
      (error: unknown, info: { componentStack?: string | null }): void => {
        if (this.#reporting) handler(error, toErrorInfo(info));
      };
    this.#fiberRoot = this.#generation.mount(
      this.#containerInfo,
      {
        onUncaughtError: whileActive(handlers.onUncaughtError),
        onCaughtError: whileActive(handlers.onCaughtError),
        onRecoverableError: whileActive(handlers.onRecoverableError),
      },
      handlers.onFailure,
    );
  }

  /** Whether commits still reach the models. */
  get active(): boolean {
    return this.#containerInfo.active;
  }

  /**
   * The models the tree shows: with a container, all it added to it; without
   * one, the root graphs of the top level.
   */
  get models(): AnyDotObjectModel[] {
    return this.#containerInfo.renderedModels;
  }

  /** Whether the top level has an element that is not a root graph. */
  get hasOtherThanRootGraphs(): boolean {
    return this.#containerInfo.children.some(
      (child) =>
        child.kind !== 'text' &&
        !(child.kind === 'graph' && child.model.$$type === 'Graph'),
    );
  }

  /** Schedule a render, as a root of React does. */
  render(element: ReactElement): void {
    const wrapped = createWrappedElement(element, this.#context);
    this.#generation.run((reconciler) => {
      reconciler.updateContainer(wrapped, this.#fiberRoot, null, null);
    });
  }

  /** Render now, with the updates effects schedule. */
  renderSync(element: ReactElement): void {
    const wrapped = createWrappedElement(element, this.#context);
    this.#generation.run((reconciler) => {
      reconciler.updateContainerSync(wrapped, this.#fiberRoot, null, null);
      reconciler.flushSyncWork();
    });
  }

  /**
   * Run the passive effects that are due, and tell whether React has work
   * left for this tree (transitions, deferred values, suspended data, which
   * run on its scheduler).
   */
  hasWorkLeft(): boolean {
    const flushed = this.#generation.run((reconciler) =>
      reconciler.flushPassiveEffects(),
    );
    // FiberRoot#pendingLanes: React's lanes with work left. Internal, which
    // is why react-reconciler is pinned to the React minor it was built for.
    return (
      flushed === true ||
      (this.#fiberRoot as { pendingLanes?: number }).pendingLanes !== 0
    );
  }

  /**
   * Notice a renderer that stopped without telling; from a task of our own,
   * never from inside React.
   */
  checkRenderer(): void {
    this.#generation.check();
  }

  /**
   * The models the tree added are the graphs' own from now on; for a tree
   * that was given up without `rollback`.
   */
  keep(): void {
    keepStatements(this.#containerInfo.added);
  }

  /**
   * Give the tree up: commits no longer reach the models, and React unmounts
   * the tree so that its effects clean up; the owner is told what they
   * throw, and nothing after that. With `rollback` the models it added are
   * taken out; without, they stay as they are, and a later call with
   * `rollback` still takes them out.
   */
  discard(rollback: boolean): void {
    const containerInfo = this.#containerInfo;
    if (rollback && !this.#rolledBack) {
      this.#rolledBack = true;
      containerInfo.children = [];
      try {
        syncContainer(containerInfo);
      } catch {
        // A model class that throws on removal too: nothing more to try.
      }
      containerInfo.renderedModels = [];
    }
    if (!containerInfo.active) return;
    containerInfo.active = false;
    this.#generation.forget(containerInfo);
    this.#generation.run((reconciler) => {
      reconciler.updateContainerSync(null, this.#fiberRoot, null, null);
      reconciler.flushSyncWork();
    });
    this.#reporting = false;
  }
}
