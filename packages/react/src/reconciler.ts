import type { FC, ComponentProps } from 'react';
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
 * Container represents the graph context
 */
type Container = Record<string, never>;

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
      PublicInstance,
      HostContext,
      UpdatePayload,
      ChildSet, // TODO Placeholder for undocumented API
      TimeoutHandle,
      NoTimeout
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

  queueMicrotask(_fn: () => void): void {
    // NoOp
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
  public isPrimaryRenderer = false;

  public supportsMutation = false;

  public supportsPersistence = false;

  public supportsHydration = false;

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
    
    // Execute the component function to trigger hooks and side effects
    type(props);
    
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
    _parentInstance: Instance,
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
    _container: Container,
    _child: Instance | TextInstance,
  ): void {
    // if (container.appendChild) {
    //   container.appendChild(child);
    // }
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
    _newProps: Props,
    _internalInstanceHandle: OpaqueHandle,
  ): void {
    // NoOp
  }

  public commitUpdate(
    instance: Instance,
    updatePayload: UpdatePayload,
    type: Type,
    _oldProps: Props,
    newProps: Props,
    _internalInstanceHandle: OpaqueHandle,
  ): void {
    if (updatePayload && updatePayload.type === 'UPDATE') {
      // Update instance props
      instance.props = newProps;
      
      // Re-execute component function to trigger hooks with new props
      type(newProps);
    }
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
