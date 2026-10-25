import ReactReconciler from 'react-reconciler';
import {
  DefaultEventPriority,
  NoEventPriority,
} from 'react-reconciler/constants.js';
import type {
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

/** Nothing reads the host context; one object serves every element. */
const HOST_CONTEXT: HostContext = {};

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

  // Update priorities, as react-dom tracks them (#1752): the priority set by
  // the reconciler, or the default one outside of an event. Arrow functions,
  // because the reconciler calls host config methods without `this`.
  #currentUpdatePriority: UpdatePriority = NoEventPriority;

  resolveUpdatePriority = (): UpdatePriority =>
    this.#currentUpdatePriority !== NoEventPriority
      ? this.#currentUpdatePriority
      : DefaultEventPriority;

  setCurrentUpdatePriority = (priority: UpdatePriority): void => {
    this.#currentUpdatePriority = priority;
  };

  getCurrentUpdatePriority = (): UpdatePriority => this.#currentUpdatePriority;

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
  clearContainer(_container: Container): void {
    // NoOp - our containers don't need special clearing
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

  public getPublicInstance(instance: Instance | TextInstance): PublicInstance {
    return instance;
  }

  public getRootHostContext(_rootContainerInstance: Container): HostContext {
    return HOST_CONTEXT;
  }

  public getChildHostContext(
    parentHostContext: HostContext,
    _type: Type,
  ): HostContext {
    return parentHostContext;
  }

  public prepareForCommit(
    _containerInfo: Container,
  ): Record<string, any> | null {
    return null;
  }

  public resetAfterCommit(_containerInfo: Container): void {
    // containerInfo.setRoot
  }

  /**
   * Create component instance for Graphviz elements
   */
  public createInstance(
    type: Type,
    props: Props,
    _rootContainerInstance: Container,
    _hostContext: HostContext,
    _internalInstanceHandle: OpaqueHandle,
  ): Instance {
    const instance: Instance = {
      type,
      props,
      children: [],
      appendChild: (child: Instance | TextInstance) => {
        instance.children.push(child);
      },
    };

    return instance;
  }

  public appendInitialChild(
    parentInstance: Instance,
    child: Instance | TextInstance,
  ): void {
    if (parentInstance.appendChild) {
      parentInstance.appendChild(child);
    }
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
    text: string,
    _rootContainerInstance: Container,
    _hostContext: HostContext,
    _internalInstanceHandle: OpaqueHandle,
  ): TextInstance {
    return text.trim();
  }

  public scheduleDeferredCallback(
    _callback: () => any,
    _options?: { timeout: number },
  ): any {
    // NoOp
  }

  public cancelDeferredCallback(_callbackID: any): void {
    // NoOp
  }

  // -------------------
  //      Mutation
  //     (optional)
  // -------------------
  public appendChild(
    parentInstance: Instance,
    child: Instance | TextInstance,
  ): void {
    if (parentInstance.appendChild) {
      parentInstance.appendChild(child);
    }
  }

  public appendChildToContainer(
    container: Container,
    child: Instance | TextInstance,
  ): void {
    // Store the root instance for debugging
    if (typeof child === 'object' && 'type' in child) {
      container.__rootInstance = child;
    }
  }

  public commitTextUpdate(
    _textInstance: TextInstance,
    _oldText: string,
    _newText: string,
  ): void {
    // NoOp
  }

  public commitMount(
    _instance: Instance,
    _type: Type,
    _props: Props,
    _internalInstanceHandle: OpaqueHandle,
  ): void {
    // Ref handling is done via useImperativeHandle in components
  }

  public commitUpdate?(
    instance: Instance,
    _type: Type,
    _prevProps: Props,
    nextProps: Props,
    _internalHandle: OpaqueHandle,
  ): void {
    // Update instance props
    instance.props = nextProps;

    // Don't re-execute component function here - let React handle updates
    // This avoids issues with React's changed execution timing
  }

  public insertBefore(
    _parentInstance: Instance,
    _child: Instance | TextInstance,
    _beforeChild: Instance | TextInstance,
  ): void {
    // NoOp
  }

  public insertInContainerBefore(
    _container: Container,
    _child: Instance | TextInstance,
    _beforeChild: Instance | TextInstance,
  ): void {
    // NoOp
  }

  public removeChild(
    _parentInstance: Instance,
    _child: Instance | TextInstance,
  ): void {
    // NoOp
  }

  public removeChildFromContainer(
    _container: Container,
    _child: Instance | TextInstance,
  ): void {
    // NoOp
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
