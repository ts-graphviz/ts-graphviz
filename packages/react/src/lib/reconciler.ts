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
  preparePortalMount(containerInfo: Container): void {
    // NoOp
  }

  scheduleTimeout(fn: (...args: unknown[]) => unknown, delay?: number) {
    // NoOp
  }

  cancelTimeout(id: any): void {
    // NoOp
  }

  queueMicrotask(fn: () => void): void {
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

  public getRootHostContext(rootContainerInstance: Container): HostContext {
    return {};
  }

  public getChildHostContext(
    parentHostContext: HostContext,
    type: Type,
    rootContainerInstance: Container,
  ): HostContext {
    return parentHostContext;
  }

  public prepareForCommit(
    containerInfo: Container,
  ): Record<string, any> | null {
    return null;
  }

  public resetAfterCommit(containerInfo: Container): void {
    // containerInfo.setRoot
  }

  /**
   * Create component instance
   */
  public createInstance(
    type: Type,
    props: Props,
    rootContainerInstance: Container,
    hostContext: HostContext,
    internalInstanceHandle: OpaqueHandle,
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
    parentInstance: Instance,
    type: Type,
    props: Props,
    rootContainerInstance: Container,
    hostContext: HostContext,
  ): boolean {
    return false;
  }

  public prepareUpdate(
    instance: Instance,
    type: Type,
    oldProps: Props,
    newProps: Props,
    rootContainerInstance: Container,
    hostContext: HostContext,
  ): null | UpdatePayload {
    return {};
  }

  public shouldSetTextContent(type: Type, props: Props): boolean {
    return false;
  }

  public shouldDeprioritizeSubtree(type: Type, props: Props): boolean {
    return false;
  }

  public createTextInstance(
    text: string,
    rootContainerInstance: Container,
    hostContext: HostContext,
    internalInstanceHandle: OpaqueHandle,
  ): TextInstance {
    return text;
  }

  public scheduleDeferredCallback(
    callback: () => any,
    options?: { timeout: number },
  ): any {
    // NoOp
  }

  public cancelDeferredCallback(callbackID: any): void {
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
    container: Container,
    child: Instance | TextInstance,
  ): void {
    // if (container.appendChild) {
    //   container.appendChild(child);
    // }
  }

  public commitTextUpdate(
    textInstance: TextInstance,
    oldText: string,
    newText: string,
  ): void {
    // NoOp
  }

  public commitMount(
    instance: Instance,
    type: Type,
    newProps: Props,
    internalInstanceHandle: OpaqueHandle,
  ): void {
    // NoOp
  }

  public commitUpdate(
    instance: Instance,
    updatePayload: UpdatePayload,
    type: Type,
    oldProps: Props,
    newProps: Props,
    internalInstanceHandle: OpaqueHandle,
  ): void {
    // NoOp
  }

  public insertBefore(
    parentInstance: Instance,
    child: Instance | TextInstance,
    beforeChild: Instance | TextInstance,
  ): void {
    // NoOp
  }

  public insertInContainerBefore(
    container: Container,
    child: Instance | TextInstance,
    beforeChild: Instance | TextInstance,
  ): void {
    // NoOp
  }

  public removeChild(
    parentInstance: Instance,
    child: Instance | TextInstance,
  ): void {
    // NoOp
  }

  public removeChildFromContainer(
    container: Container,
    child: Instance | TextInstance,
  ): void {
    // NoOp
  }

  public resetTextContent(instance: Instance): void {
    // NoOp
  }
}

export const reconciler = ReactReconciler(new HostConfig());
