import { Compass } from '../type/index.js';
import { ForwardRefNode, NodeRef, NodeRefLike, NodeRefGroupLike, NodeRefGroup, NodeModel } from './types.js';

export function isForwardRefNode(object: unknown): object is ForwardRefNode {
  return typeof object === 'object' && object !== null && typeof (object as ForwardRefNode).id === 'string';
}

export function isNodeModel(object: unknown): object is NodeModel {
  return (
    typeof object === 'object' &&
    object !== null &&
    (object as NodeModel).$$type === 'Node' &&
    typeof (object as NodeModel).id === 'string'
  );
}

export function isNodeRef(node: unknown): node is NodeRef {
  return isNodeModel(node) || isForwardRefNode(node);
}

export function isNodeRefLike(node: unknown): node is NodeRefLike {
  return typeof node === 'string' || isNodeRef(node);
}

export function isNodeRefGroupLike(target: NodeRefLike | NodeRefGroupLike): target is NodeRefGroupLike {
  return Array.isArray(target) && target.every(isNodeRefLike);
}

export function isCompass(c: string): c is Compass {
  return ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw', 'c'].includes(c);
}

export function toNodeRef(target: NodeRefLike): NodeRef {
  if (isNodeRef(target)) {
    return target;
  }
  const [id, port, compass] = target.split(':');
  if (isCompass(compass)) {
    return { id, port, compass };
  }
  return { id, port };
}

export function toNodeRefGroup(targets: NodeRefGroupLike): NodeRefGroup {
  if (targets.length < 2 && (isNodeRefLike(targets[0]) && isNodeRefLike(targets[1])) === false) {
    throw Error('EdgeTargets must have at least 2 elements.');
  }
  return targets.map((t) => toNodeRef(t));
}
