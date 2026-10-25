import ReactReconciler from 'react-reconciler';
import {
  DiscreteEventPriority,
  NoEventPriority,
} from 'react-reconciler/constants.js';
import {
  createHostInstance,
  HOST,
  insertChild,
  removeChild,
  syncContainer,
  updateHostInstance,
} from './host.js';
import type {
  Child,
  HostContext,
  ReconcilerInstance as Instance,
  ComponentProps as Props,
  PublicInstance,
  RenderContainer,
  TextInstance,
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
  preparePortalMount(_containerInfo: Container): void {
    // NoOp
  }

  scheduleTimeout(
    fn: (...args: unknown[]) => unknown,
    delay?: number,
  ): TimeoutHandle {
    return setTimeout(fn, delay || 0);
  }

  cancelTimeout(id: TimeoutHandle): void {
    clearTimeout(id);
  }

  scheduleMicrotask(fn: () => unknown): void {
    queueMicrotask(() => {
      fn();
    });
  }

  // Update priorities (#1752), from react-reconciler/constants. A render
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
    container.children = [];
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

  // Temporary workaround for scenario where multiple renderers concurrently
  // render using the same context objects. E.g. React DOM and React ART on the
  // same page. DOM is the primary renderer; ART is the secondary renderer.
  public isPrimaryRenderer = true;

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
  public getRootHostContext(container: Container): HostContext {
    return container.context?.container ? IN_GRAPH : OUTSIDE_GRAPH;
  }

  public getChildHostContext(
    parentHostContext: HostContext,
    type: Type,
  ): HostContext {
    // A portal adds to a graph of the tree it is in: none outside one.
    return type === HOST.graph ? IN_GRAPH : parentHostContext;
  }

  public prepareForCommit(
    _containerInfo: Container,
  ): Record<string, any> | null {
    return null;
  }

  // The instances are in place: make the models match them. An error (from
  // a model class) must not leave the commit half done, which would break
  // the renderer: render() rejects with it instead.
  public resetAfterCommit(containerInfo: Container): void {
    try {
      syncContainer(containerInfo);
    } catch (error) {
      containerInfo.uncaughtErrors.push(error);
    }
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
    if ('children' in parentInstance)
      insertChild(parentInstance.children, child);
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
    return { kind: 'text', hidden: false };
  }

  public appendChild(parentInstance: Instance, child: Child): void {
    if ('children' in parentInstance)
      insertChild(parentInstance.children, child);
  }

  public appendChildToContainer(container: Container, child: Child): void {
    insertChild(container.children, child);
  }

  public insertBefore(
    parentInstance: Instance,
    child: Child,
    beforeChild: Child,
  ): void {
    if ('children' in parentInstance) {
      insertChild(parentInstance.children, child, beforeChild);
    }
  }

  public insertInContainerBefore(
    container: Container,
    child: Child,
    beforeChild: Child,
  ): void {
    insertChild(container.children, child, beforeChild);
  }

  public removeChild(parentInstance: Instance, child: Child): void {
    if ('children' in parentInstance)
      removeChild(parentInstance.children, child);
  }

  public removeChildFromContainer(container: Container, child: Child): void {
    removeChild(container.children, child);
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
    updateHostInstance(instance, nextProps);
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

export const reconciler: ReactReconciler.Reconciler<
  Container,
  Instance,
  TextInstance,
  SuspenseInstance,
  FormInstance,
  PublicInstance
> = ReactReconciler(new HostConfig());
