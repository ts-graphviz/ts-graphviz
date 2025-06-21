import type { FC } from 'react';
import ReactReconciler from 'react-reconciler';

type Type = FC;
type Props = any;
type Container = Record<string, never>;

type Instance = any;
type TextInstance = any;
type SuspenseInstance = any;
type HydratableInstance = any;
type PublicInstance = any;
type HostContext = any;
type UpdatePayload = any;
type ChildSet = any;
type TimeoutHandle = any;
type NoTimeout = any;

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

  scheduleTimeout(_fn: (...args: unknown[]) => unknown, _delay?: number) {
    // NoOp
  }

  cancelTimeout(_id: any): void {
    // NoOp
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
    return {};
  }

  public getChildHostContext(
    parentHostContext: HostContext,
    _type: Type,
    _rootContainerInstance: Container,
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
   * Create component instance
   */
  public createInstance(
    type: Type,
    props: Props,
    _rootContainerInstance: Container,
    _hostContext: HostContext,
    _internalInstanceHandle: OpaqueHandle,
  ): Instance {
    // NoOp
    return type(props);
  }

  public appendInitialChild(
    parentInstance: Instance,
    child: Instance | TextInstance,
  ): void {
    parentInstance.appendChild(child);
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
    _oldProps: Props,
    _newProps: Props,
    _rootContainerInstance: Container,
    _hostContext: HostContext,
  ): null | UpdatePayload {
    return {};
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
    return text;
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
    // NoOp
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
    _instance: Instance,
    _updatePayload: UpdatePayload,
    _type: Type,
    _oldProps: Props,
    _newProps: Props,
    _internalInstanceHandle: OpaqueHandle,
  ): void {
    // NoOp
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
