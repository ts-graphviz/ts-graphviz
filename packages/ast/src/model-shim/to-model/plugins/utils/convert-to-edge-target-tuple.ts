import type { EdgeTarget, EdgeTargetTuple, NodeRef } from '@ts-graphviz/common';
import type { EdgeASTNode, NodeRefASTNode } from '../../../../types.js';

// A node parsed without a port or compass point does not own the field.
function toEdgeTarget(t: NodeRefASTNode): NodeRef {
  return {
    id: t.id.value,
    port: Object.hasOwn(t, 'port') ? t.port?.value : undefined,
    compass: Object.hasOwn(t, 'compass') ? t.compass?.value : undefined,
  } as NodeRef;
}

export function convertToEdgeTargetTuple(edge: EdgeASTNode): EdgeTargetTuple {
  return edge.targets.map((t): EdgeTarget => {
    switch (t.type) {
      case 'NodeRef':
        return toEdgeTarget(t);
      case 'NodeRefGroup':
        return t.children.map(toEdgeTarget);
    }
  }) as EdgeTargetTuple;
}
