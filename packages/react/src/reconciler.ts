import ReactReconciler from 'react-reconciler';
import {
  DiscreteEventPriority,
  NoEventPriority,
} from 'react-reconciler/constants.js';
import { createHostInstance } from './host.js';
import {
  type Child,
  clearChildren,
  createText,
  HOST,
  type Instance,
  insertChild,
  removeChild,
  setProps,
  sync,
  type TextInstance,
} from './shared/tree.js';
import type {
  HostContext,
  ComponentProps as Props,
  PublicInstance,
  RenderContainer,
} from './types/reconciler.js';

/**
 * Type aliases for reconciler compatibility
 */
// Host element types are strings (`dot:td`, ...); components never get here.
type Type = string;
type Container = RenderContainer;

/**
 * Suspense instance (not used in Graphviz rendering)
 */
type SuspenseInstance = never;

/**
 * Hydratable instance (not used in Graphviz rendering)
 */
type HydratableInstance = never;

/**
 * Child set (not used in current implementation)
 */
type ChildSet = never;

/**
 * Timeout handle for scheduling
 */
type TimeoutHandle = ReturnType<typeof setTimeout>;

/**
 * No timeout constant
 */
type NoTimeout = -1;

/**
 * React Reconciler Fiber type
 */
type OpaqueHandle = ReactReconciler.Fiber;

/**
 * An event priority from `react-reconciler/constants`.
 */
type UpdatePriority = number;

/** The host contexts, shared: whether nodes and edges may be rendered. */
const IN_GRAPH: HostContext = { inGraph: true };
const OUTSIDE_GRAPH: HostContext = { inGraph: false };

/**
 * Form instance type (not used in Graphviz rendering)
 */
type FormInstance = never;

/**
 * Transition status type (not used in Graphviz rendering)
 */
type TransitionStatus = null;

/** What a host config tells the code that owns its reconciler. */
export interface HostHooks {
  /** An error came out of React's work loop, which nothing can resume. */
  onWorkLoopError(error: unknown): void;
  /** React starts to render or to commit the tree of this container. */
  onWork(containerInfo: Container): void;
  /** Whether the reconciler was given up: nothing more is to run on it. */
  isStopped(): boolean;
}

const NO_HOOKS: HostHooks = {
  onWorkLoopError: (error) => {
    throw error;
  },
  onWork: () => undefined,
  isStopped: () => false,
};

export class HostConfig
  implements
    ReactReconciler.HostConfig<
      Type,
      Props,
      Container,
      Instance,
      TextInstance,
      never, // ActivityInstance
      SuspenseInstance,
      HydratableInstance,
      FormInstance,
      PublicInstance,
      HostContext,
      ChildSet,
      TimeoutHandle,
      NoTimeout,
      TransitionStatus,
      null, // SuspendedState
      null, // RendererInspectionConfig
      never, // FormStateMarkerInstance
      never, // HoistableRoot
      never // Resource
    >
{
  readonly #hooks: HostHooks;

  constructor(hooks: HostHooks = NO_HOOKS) {
    this.#hooks = hooks;
  }

  preparePortalMount(_containerInfo: Container): void {
    // NoOp
  }

  // A reconciler that was given up cannot work again: what it would still
  // start (a retry of suspended data, the work of a late update) is dropped
  // instead of failing as an exception nobody can catch.
  scheduleTimeout = (
    fn: (...args: unknown[]) => unknown,
    delay?: number,
  ): TimeoutHandle => {
    return setTimeout(() => {
      if (!this.#hooks.isStopped()) fn();
    }, delay || 0);
  };

  cancelTimeout(id: TimeoutHandle): void {
    clearTimeout(id);
  }

  // React runs its work loop from here. It handles what components throw;
  // anything that still comes out of it left React in the middle of its
  // work, and is for the owner of the reconciler to deal with.
  scheduleMicrotask = (fn: () => unknown): void => {
    queueMicrotask(() => {
      if (this.#hooks.isStopped()) return;
      try {
        fn();
      } catch (error) {
        this.#hooks.onWorkLoopError(error);
      }
    });
  };

  // Update priorities, from react-reconciler/constants. A render
  // produces a snapshot of models, so every update runs at the discrete
  // (synchronous) priority, including those effects schedule: React lowers
  // the priority to the default one while it runs passive effects, which
  // would leave their updates for later, after render() returned. The set
  // priority is still tracked, so React's save-and-restore keeps working.
  // Arrow functions, because the reconciler calls host config methods
  // without `this`.
  #currentUpdatePriority: UpdatePriority = NoEventPriority;

  resolveUpdatePriority = (): UpdatePriority => DiscreteEventPriority;

  setCurrentUpdatePriority = (priority: UpdatePriority): void => {
    this.#currentUpdatePriority = priority;
  };

  getCurrentUpdatePriority = (): UpdatePriority =>
    this.#currentUpdatePriority === NoEventPriority
      ? NoEventPriority
      : DiscreteEventPriority;

  // form-related methods
  resetFormInstance(_form: FormInstance): void {
    // NoOp - not applicable for Graphviz rendering
  }

  // transition-related properties
  NotPendingTransition: TransitionStatus = null;

  // suspense and commit methods
  maySuspendCommit(_type: Type, _props: Props): boolean {
    return false;
  }

  maySuspendCommitOnUpdate(
    _type: Type,
    _oldProps: Props,
    _newProps: Props,
  ): boolean {
    return false;
  }

  maySuspendCommitInSyncRender(_type: Type, _props: Props): boolean {
    return false;
  }

  preloadInstance(_instance: Instance, _type: Type, _props: Props): boolean {
    // Nothing to load: every instance is ready.
    return true;
  }

  startSuspendingCommit(): null {
    return null;
  }

  suspendInstance(
    _state: null,
    _instance: Instance,
    _type: Type,
    _props: Props,
  ): void {
    // NoOp
  }

  suspendOnActiveViewTransition(_state: null, _container: Container): void {
    // NoOp
  }

  waitForCommitToBeReady(
    _state: null,
    _timeoutOffset: number,
  ):
    | ((
        initiateCommit: (...args: unknown[]) => unknown,
      ) => (...args: unknown[]) => unknown)
    | null {
    return null;
  }

  getSuspendedCommitReason(_state: null, _container: Container): null {
    return null;
  }

  // additional required methods
  getInstanceFromNode(_node: any): OpaqueHandle | null {
    return null;
  }

  beforeActiveInstanceBlur(): void {
    // NoOp
  }

  afterActiveInstanceBlur(): void {
    // NoOp
  }

  prepareScopeUpdate(_scopeInstance: any, _instance: Instance): void {
    // NoOp
  }

  getInstanceFromScope(_scopeInstance: any): Instance | null {
    return null;
  }

  detachDeletedInstance(_instance: Instance): void {
    // NoOp
  }

  logRecoverableError(_error: any): void {
    // NoOp - errors are handled elsewhere
  }

  requestPostPaintCallback(_callback: (time: number) => void): void {
    // NoOp
  }

  // container clearing method
  clearContainer(container: Container): void {
    clearChildren(container);
  }

  // transition context and scheduling methods
  HostTransitionContext: any = null as any;

  shouldAttemptEagerTransition(): boolean {
    return false;
  }

  trackSchedulerEvent(): void {
    // NoOp
  }

  resolveEventType(): string | null {
    return null;
  }

  resolveEventTimeStamp(): number {
    return Date.now();
  }

  cloneInstance?: any;

  cloneFundamentalInstance?: any;

  createContainerChildSet?: any;

  appendChildToContainerChildSet?: any;

  finalizeContainerChildren?: any;

  replaceContainerChildren?: any;

  cloneHiddenInstance?: any;

  cloneHiddenTextInstance?: any;

  public now: () => number = Date.now;

  public noTimeout: NoTimeout = -1; // TODO

  // A context has one slot for the primary renderer and one for the others.
  // React DOM is the primary one; taking the same slot would let a tree of
  // each, rendered at the same time, read the other's context values.
  public isPrimaryRenderer = false;

  // Reported to React DevTools.
  public rendererPackageName = '@ts-graphviz/react';

  public rendererVersion = '';

  public extraDevToolsConfig: null = null;

  // React calls this to replay console calls logged on a server; a renderer
  // of models has none, and the library does not write to the console.
  public bindToConsole(
    _methodName: string,
    _args: unknown[],
    _badgeName: string,
  ): () => void {
    return () => {};
  }

  public supportsMutation = true;

  public supportsPersistence = false;

  public supportsHydration = false;

  public supportsMicrotasks = true;

  /** A `ref` on a component resolves to its model. */
  public getPublicInstance(instance: Instance | TextInstance): PublicInstance {
    return 'model' in instance
      ? ((instance.model ?? null) as PublicInstance)
      : null;
  }

  // Nodes and edges need a graph: the container, or a graph element.
  public getRootHostContext = (container: Container): HostContext => {
    this.#hooks.onWork(container);
    return container.container ? IN_GRAPH : OUTSIDE_GRAPH;
  };

  public getChildHostContext(
    parentHostContext: HostContext,
    type: Type,
  ): HostContext {
    // A portal adds to a graph of the tree it is in: none outside one.
    return type === HOST.graph ? IN_GRAPH : parentHostContext;
  }

  public prepareForCommit = (
    containerInfo: Container,
  ): Record<string, any> | null => {
    this.#hooks.onWork(containerInfo);
    return null;
  };

  // The instances are in place: make the models match them. An error (from
  // a model class) must not leave the commit half done, which would break
  // the renderer: the container gets it instead.
  public resetAfterCommit(containerInfo: Container): void {
    if (!containerInfo.active) return;
    try {
      sync(containerInfo);
    } catch (error) {
      containerInfo.onSyncError(error);
      return;
    }
    containerInfo.onCommit();
  }

  public createInstance(
    type: Type,
    props: Props,
    _rootContainerInstance: Container,
    hostContext: HostContext,
    _internalInstanceHandle: OpaqueHandle,
  ): Instance {
    return createHostInstance(type, props, hostContext);
  }

  public appendInitialChild(parentInstance: Instance, child: Child): void {
    if ('children' in parentInstance) insertChild(parentInstance, child);
  }

  public finalizeInitialChildren(
    _instance: Instance,
    _type: Type,
    _props: Props,
    _hostContext: HostContext,
  ): boolean {
    return false;
  }

  public shouldSetTextContent(_type: Type, _props: Props): boolean {
    return false;
  }

  public shouldDeprioritizeSubtree(_type: Type, _props: Props): boolean {
    return false;
  }

  public createTextInstance(
    _text: string,
    _rootContainerInstance: Container,
    _hostContext: HostContext,
    _internalInstanceHandle: OpaqueHandle,
  ): TextInstance {
    return createText();
  }

  public appendChild(parentInstance: Instance, child: Child): void {
    if ('children' in parentInstance) insertChild(parentInstance, child);
  }

  public appendChildToContainer(container: Container, child: Child): void {
    insertChild(container, child);
  }

  public insertBefore(
    parentInstance: Instance,
    child: Child,
    beforeChild: Child,
  ): void {
    if ('children' in parentInstance) {
      insertChild(parentInstance, child, beforeChild);
    }
  }

  public insertInContainerBefore(
    container: Container,
    child: Child,
    beforeChild: Child,
  ): void {
    insertChild(container, child, beforeChild);
  }

  public removeChild(parentInstance: Instance, child: Child): void {
    if (child.parent === parentInstance) removeChild(child);
  }

  public removeChildFromContainer(container: Container, child: Child): void {
    if (child.parent === container) removeChild(child);
  }

  public commitTextUpdate(
    _textInstance: TextInstance,
    _oldText: string,
    _newText: string,
  ): void {
    // Text is not part of the graph.
  }

  public commitMount(
    _instance: Instance,
    _type: Type,
    _props: Props,
    _internalInstanceHandle: OpaqueHandle,
  ): void {
    // NoOp
  }

  public commitUpdate(
    instance: Instance,
    _type: Type,
    _prevProps: Props,
    nextProps: Props,
    _internalHandle: OpaqueHandle,
  ): void {
    setProps(instance, nextProps);
  }

  // A Suspense boundary showing its fallback again hides its content.
  public hideInstance(instance: Instance): void {
    instance.hidden = true;
  }

  public unhideInstance(instance: Instance, _props: Props): void {
    instance.hidden = false;
  }

  public hideTextInstance(textInstance: TextInstance): void {
    textInstance.hidden = true;
  }

  public unhideTextInstance(textInstance: TextInstance, _text: string): void {
    textInstance.hidden = false;
  }

  public resetTextContent(_instance: Instance): void {
    // NoOp
  }
}

export type Reconciler = ReactReconciler.Reconciler<
  Container,
  Instance,
  TextInstance,
  SuspenseInstance,
  FormInstance,
  PublicInstance
>;

export type FiberRoot = ReturnType<Reconciler['createContainer']>;

/** What React says about where an error came from. */
interface ReactErrorInfo {
  componentStack?: string | null;
}

export interface RootErrorCallbacks {
  onUncaughtError(error: unknown, info: ReactErrorInfo): void;
  onCaughtError(error: unknown, info: ReactErrorInfo): void;
  onRecoverableError(error: unknown, info: ReactErrorInfo): void;
}

/**
 * Create the fiber root of a container. The only call of `createContainer`:
 * its arguments are positional and react-reconciler is 0.x, so they are
 * placed here, by name, against react-reconciler 0.34's signature
 * (React 19.3).
 */
export function createRootContainer(
  reconciler: Pick<Reconciler, 'createContainer'>,
  containerInfo: Container,
  callbacks: RootErrorCallbacks,
): FiberRoot {
  return reconciler.createContainer(
    containerInfo,
    1, // tag: ConcurrentRoot
    null, // hydrationCallbacks
    false, // isStrictMode
    null, // concurrentUpdatesByDefaultOverride
    '@ts-graphviz/react', // identifierPrefix
    callbacks.onUncaughtError,
    callbacks.onCaughtError,
    callbacks.onRecoverableError,
    () => undefined, // onDefaultTransitionIndicator
    null, // transitionCallbacks
  );
}

/** Told that the renderer failed; `own`: while it worked on this tree. */
type FailureListener = (error: unknown, own: boolean) => void;

/**
 * A reconciler and the trees rendered with it.
 *
 * All the trees share one reconciler, as the roots of React DOM do: React
 * keeps what it is rendering (the context values among it) in state the
 * reconcilers of a page share, so two of them rendering at the same time
 * would read each other's. The price is that an error thrown out of React's
 * work loop stops every tree: React handles what components throw, but not
 * what comes out of its own traversal or of the host, and it cannot resume.
 * The reconciler is then given up with its trees, which are told, and the
 * next render starts on a new one.
 */
export class RendererGeneration {
  #failed = false;
  // The tree React started to render or to commit last.
  #working: Container | undefined;
  readonly #trees = new Map<
    Container,
    { fiberRoot: FiberRoot; onFailure: FailureListener }
  >();
  readonly #reconciler: Reconciler = ReactReconciler(
    new HostConfig({
      onWorkLoopError: (error) => this.fail(error),
      onWork: (containerInfo) => {
        // A tree that was given up is unmounted too, and is nobody's.
        this.#working = this.#trees.has(containerInfo)
          ? containerInfo
          : undefined;
      },
      isStopped: () => this.#failed,
    }),
  );

  get failed(): boolean {
    return this.#failed;
  }

  /** Create the fiber root of a tree, and listen for a failure. */
  mount(
    containerInfo: Container,
    callbacks: RootErrorCallbacks,
    onFailure: FailureListener,
  ): FiberRoot {
    const fiberRoot = createRootContainer(
      this.#reconciler,
      containerInfo,
      callbacks,
    );
    this.#trees.set(containerInfo, { fiberRoot, onFailure });
    return fiberRoot;
  }

  /** Stop listening: the tree is given up. */
  forget(containerInfo: Container): void {
    this.#trees.delete(containerInfo);
    if (this.#working === containerInfo) this.#working = undefined;
  }

  /**
   * Call React. A throw out of it fails the generation; nothing runs on a
   * failed one.
   */
  run<T>(work: (reconciler: Reconciler) => T): T | undefined {
    if (this.#failed) return undefined;
    try {
      return work(this.#reconciler);
    } catch (error) {
      this.fail(error);
      return undefined;
    }
  }

  /**
   * Notice a reconciler that stopped in the middle of its work, when the
   * error went where it could not be caught (out of a task of React's
   * scheduler). To be called from a task of our own, where React is not
   * running.
   */
  check(): void {
    if (!this.#failed && this.#reconciler.isAlreadyRendering()) {
      this.fail(
        new Error(
          'React stopped in the middle of its work: an error was thrown out of it and reported as an uncaught exception',
        ),
      );
    }
  }

  fail(error: unknown): void {
    if (this.#failed) return;
    this.#failed = true;
    if (current === this) current = undefined;
    const working = this.#working;
    const trees = [...this.#trees];
    this.#trees.clear();
    for (const [, { fiberRoot }] of trees) cancelScheduledWork(fiberRoot);
    for (const [containerInfo, { onFailure }] of trees) {
      onFailure(error, containerInfo === working);
    }
  }
}

/**
 * Cancel the task React's scheduler holds for a tree (the rest of a
 * transition, say), as the scheduler's own `cancelCallback` does: on a
 * reconciler that stopped, the task could only throw. `callbackNode` and
 * the task's `callback` are internals of React and its scheduler.
 */
function cancelScheduledWork(fiberRoot: FiberRoot): void {
  const task = (fiberRoot as { callbackNode?: unknown }).callbackNode;
  if (typeof task === 'object' && task !== null && 'callback' in task) {
    task.callback = null;
  }
}

let current: RendererGeneration | undefined;

/** The generation new trees are rendered with. */
export function currentGeneration(): RendererGeneration {
  current ??= new RendererGeneration();
  return current;
}
