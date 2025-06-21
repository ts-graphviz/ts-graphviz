import type { ComponentProps, FC } from 'react';
import ReactReconciler from 'react-reconciler';
import type { GraphBaseModel } from 'ts-graphviz';

/**
 * React component type for Graphviz elements
 */
type Type = FC<any>;

/**
 * Props for Graphviz components
 */
type Props = ComponentProps<any>;

/**
 * Container represents the graph context - now holds the actual context
 */
type Container = Record<string, any>;

/**
 * Instance represents a rendered Graphviz element (Node, Edge, Subgraph, etc.)
 */
type Instance = {
  type: string;
  props: Props;
  children: (Instance | TextInstance)[];
  appendChild?: (child: Instance | TextInstance) => void;
};

/**
 * Text instance for string content
 */
type TextInstance = string;

/**
 * Suspense instance (not used in Graphviz rendering)
 */
type SuspenseInstance = never;

/**
 * Hydratable instance (not used in Graphviz rendering)
 */
type HydratableInstance = never;

/**
 * Public instance exposed to user code
 */
type PublicInstance = Instance | TextInstance;

/**
 * Host context for rendering
 */
type HostContext = {
  graph?: GraphBaseModel;
};

/**
 * Update payload for element updates
 */
type UpdatePayload = {
  type: 'UPDATE';
  oldProps: Props;
  newProps: Props;
} | null;

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
 * Update priority types for React 19 reconciler
 */
type UpdatePriority = number;

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
      SuspenseInstance,
      HydratableInstance,
      FormInstance,
      PublicInstance,
      HostContext,
      ChildSet,
      TimeoutHandle,
      NoTimeout,
      TransitionStatus
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

  queueMicrotask(fn: () => void): void {
    // For React 19 compatibility, execute immediately to ensure synchronous behavior
    fn();
  }

  // React 19 reconciler methods for update priority management
  resolveUpdatePriority(): UpdatePriority {
    // Return SyncLane priority for immediate execution
    // In React 19, this is typically 1 for synchronous updates
    return 1;
  }

  setCurrentUpdatePriority(_priority: UpdatePriority): void {
    // NoOp - we force synchronous rendering by design
  }

  getCurrentUpdatePriority(): UpdatePriority {
    // Always return sync priority to ensure immediate execution
    return 1;
  }

  // React 19 form-related methods
  resetFormInstance(_form: FormInstance): void {
    // NoOp - not applicable for Graphviz rendering
  }

  // React 19 transition-related properties
  NotPendingTransition: TransitionStatus = null;

  // React 19 suspense and commit methods
  maySuspendCommit(_type: Type, _props: Props): boolean {
    return false;
  }

  preloadInstance(_type: Type, _props: Props): boolean {
    return false;
  }

  startSuspendingCommit(): void {
    // NoOp
  }

  suspendInstance(_type: Type, _props: Props): void {
    // NoOp
  }

  waitForCommitToBeReady():
    | ((initiateCommit: () => void) => () => void)
    | null {
    return null;
  }

  // React 19 additional required methods
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

  // React 19 container clearing method
  clearContainer(_container: Container): void {
    // NoOp - our containers don't need special clearing
  }

  // React 19 transition context and scheduling methods
  HostTransitionContext: any = null;

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

  public now = Date.now;

  public setTimeout = setTimeout;

  public clearTimeout = clearTimeout;

  public noTimeout: NoTimeout = -1; // TODO

  // Temporary workaround for scenario where multiple renderers concurrently
  // render using the same context objects. E.g. React DOM and React ART on the
  // same page. DOM is the primary renderer; ART is the secondary renderer.
  public isPrimaryRenderer = true;

  public supportsMutation = true;

  public supportsPersistence = false;

  public supportsHydration = false;

  // React 19 specific configurations for synchronous rendering
  public supportsMicrotasks = false;

  public getPublicInstance(instance: Instance | TextInstance): PublicInstance {
    return instance;
  }

  public getRootHostContext(_rootContainerInstance: Container): HostContext {
    return {
      graph: undefined,
    };
  }

  public getChildHostContext(
    parentHostContext: HostContext,
    _type: Type,
    _rootContainerInstance: Container,
  ): HostContext {
    // Preserve parent context for nested components
    return {
      ...parentHostContext,
      // You could extend context based on component type if needed
    };
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
      type: type.displayName || type.name || 'Unknown',
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
    _rootContainerInstance: Container,
    _hostContext: HostContext,
  ): boolean {
    return false;
  }

  public prepareUpdate(
    _instance: Instance,
    _type: Type,
    oldProps: Props,
    newProps: Props,
    _rootContainerInstance: Container,
    _hostContext: HostContext,
  ): null | UpdatePayload {
    // Check if props have actually changed
    if (JSON.stringify(oldProps) !== JSON.stringify(newProps)) {
      return {
        type: 'UPDATE',
        oldProps,
        newProps,
      };
    }
    return null;
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
    // Store the root element info in container for later use
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
    // This avoids issues with React 19's changed execution timing
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

export const reconciler = ReactReconciler(new HostConfig());
