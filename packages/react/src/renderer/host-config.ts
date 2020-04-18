/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable class-methods-use-this */
import { FC } from 'react';
import ReactReconciler from 'react-reconciler';
import { Debug } from './debug';

type Type = FC; // 'Digraph' | 'Graph' | 'Node' | 'Edge' | 'Subgraph';
type Props = any;
type Container = {};

type Instance = any; // gv.Digraph | gv.Graph | gv.Node | gv.Edge | gv.Subgraph;
type TextInstance = any; // gv.LblStringValue;
type HydratableInstance = any;
type PublicInstance = any;
type HostContext = any;
type UpdatePayload = any;
type ChildSet = any;
type TimeoutHandle = any;
type NoTimeout = any;

type OpaqueHandle = ReactReconciler.Fiber;

export class HostConfig {
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

  @Debug
  public getPublicInstance(instance: Instance | TextInstance): PublicInstance {
    return instance;
  }

  @Debug
  public getRootHostContext(rootContainerInstance: Container): HostContext {
    return {};
  }

  @Debug
  public getChildHostContext(
    parentHostContext: HostContext,
    type: Type,
    rootContainerInstance: Container,
  ): HostContext {
    return parentHostContext;
  }

  @Debug
  public prepareForCommit(containerInfo: Container): void {
    // NoOp
  }

  @Debug
  public resetAfterCommit(containerInfo: Container): void {
    // containerInfo.setRoot
  }

  /**
   * Create component instance
   */
  @Debug
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

  @Debug
  public appendInitialChild(parentInstance: Instance, child: Instance | TextInstance): void {
    parentInstance.appendChild(child);
  }

  @Debug
  public finalizeInitialChildren(
    parentInstance: Instance,
    type: Type,
    props: Props,
    rootContainerInstance: Container,
    hostContext: HostContext,
  ): boolean {
    return false;
  }

  @Debug
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

  @Debug
  public shouldSetTextContent(type: Type, props: Props): boolean {
    return false;
  }

  @Debug
  public shouldDeprioritizeSubtree(type: Type, props: Props): boolean {
    return false;
  }

  @Debug
  public createTextInstance(
    text: string,
    rootContainerInstance: Container,
    hostContext: HostContext,
    internalInstanceHandle: OpaqueHandle,
  ): TextInstance {
    return text;
  }

  @Debug
  public scheduleDeferredCallback(callback: () => any, options?: { timeout: number }): any {
    // NoOp
  }

  @Debug
  public cancelDeferredCallback(callbackID: any): void {
    // NoOp
  }

  // -------------------
  //      Mutation
  //     (optional)
  // -------------------
  @Debug
  public appendChild(parentInstance: Instance, child: Instance | TextInstance): void {
    // NoOp
    if (parentInstance.appendChild) {
      parentInstance.appendChild(child);
    }
  }

  @Debug
  public appendChildToContainer(container: Container, child: Instance | TextInstance): void {
    // if (container.appendChild) {
    //   container.appendChild(child);
    // }
  }

  @Debug
  public commitTextUpdate(textInstance: TextInstance, oldText: string, newText: string): void {
    // NoOp
  }

  @Debug
  public commitMount(instance: Instance, type: Type, newProps: Props, internalInstanceHandle: OpaqueHandle): void {
    // NoOp
  }

  @Debug
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

  @Debug
  public insertBefore(
    parentInstance: Instance,
    child: Instance | TextInstance,
    beforeChild: Instance | TextInstance,
  ): void {
    // NoOp
  }

  @Debug
  public insertInContainerBefore(
    container: Container,
    child: Instance | TextInstance,
    beforeChild: Instance | TextInstance,
  ): void {
    // NoOp
  }

  @Debug
  public removeChild(parentInstance: Instance, child: Instance | TextInstance): void {
    // NoOp
  }

  @Debug
  public removeChildFromContainer(container: Container, child: Instance | TextInstance): void {
    // NoOp
  }

  @Debug
  public resetTextContent(instance: Instance): void {
    // NoOp
  }

  // -------------------
  //     Persistence
  //     (optional)
  // -------------------
  // export declare function cloneInstance(
  //   instance: Instance,
  //   updatePayload: null | UpdatePayload,
  //   type: Type,
  //   oldProps: Props,
  //   newProps: Props,
  //   internalInstanceHandle: OpaqueHandle,
  //   keepChildren: boolean,
  //   recyclableInstance: Instance,
  // ): Instance;

  // export declare function createContainerChildSet(container: Container): ChildSet;

  // export declare function appendChildToContainerChildSet(childSet: ChildSet, child: Instance | TextInstance): void;
  // export declare function finalizeContainerChildren(container: Container, newChildren: ChildSet): void;

  // export declare function replaceContainerChildren(container: Container, newChildren: ChildSet): void;

  // -------------------
  //     Hydration
  //     (optional)
  // -------------------
  // export declare function canHydrateInstance(instance: HydratableInstance, type: Type, props: Props): null | Instance;
  // export declare function canHydrateTextInstance(instance: HydratableInstance, text: string): null | TextInstance;
  // export declare function getNextHydratableSibling(
  //   instance: Instance | TextInstance | HydratableInstance,
  // ): null | HydratableInstance;
  // export declare function getFirstHydratableChild(parentInstance: Instance | Container): null | HydratableInstance;
  // export declare function hydrateInstance(
  //   instance: Instance,
  //   type: Type,
  //   props: Props,
  //   rootContainerInstance: Container,
  //   hostContext: HostContext,
  //   internalInstanceHandle: OpaqueHandle,
  // ): null | UpdatePayload;
  // export declare function hydrateTextInstance(
  //   textInstance: TextInstance,
  //   text: string,
  //   internalInstanceHandle: OpaqueHandle,
  // ): boolean;
  // export declare function didNotMatchHydratedContainerTextInstance(
  //   parentContainer: Container,
  //   textInstance: TextInstance,
  //   text: string,
  // ): void;
  // export declare function didNotMatchHydratedTextInstance(
  //   parentType: Type,
  //   parentProps: Props,
  //   parentInstance: Instance,
  //   textInstance: TextInstance,
  //   text: string,
  // ): void;
  // export declare function didNotHydrateContainerInstance(
  //   parentContainer: Container,
  //   instance: Instance | TextInstance,
  // ): void;
  // export declare function didNotHydrateInstance(
  //   parentType: Type,
  //   parentProps: Props,
  //   parentInstance: Instance,
  //   instance: Instance | TextInstance,
  // ): void;
  // export declare function didNotFindHydratableContainerInstance(
  //   parentContainer: Container,
  //   type: Type,
  //   props: Props,
  // ): void;
  // export declare function didNotFindHydratableContainerTextInstance(parentContainer: Container, text: string): void;
  // export declare function didNotFindHydratableInstance(
  //   parentType: Type,
  //   parentProps: Props,
  //   parentInstance: Instance,
  //   type: Type,
  //   props: Props,
  // ): void;
  // export declare function didNotFindHydratableTextInstance(
  //   parentType: Type,
  //   parentProps: Props,
  //   parentInstance: Instance,
  //   text: string,
  // ): void;
}
