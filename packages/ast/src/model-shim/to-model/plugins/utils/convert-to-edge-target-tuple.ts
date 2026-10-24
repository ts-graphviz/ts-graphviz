import type {
  Compass,
  EdgeTarget,
  EdgeTargetTuple,
  ForwardRefNode,
} from '@ts-graphviz/common';
import type { EdgeASTNode, NodeRefASTNode } from '../../../../types.js';
import { idFromLiteral } from '../../../literal.js';

function toNodeRef(t: NodeRefASTNode): ForwardRefNode {
  return {
    id: idFromLiteral(t.id),
    port: t.port ? idFromLiteral(t.port) : undefined,
    compass: t.compass ? (idFromLiteral(t.compass) as Compass) : undefined,
  };
}

export function convertToEdgeTargetTuple(edge: EdgeASTNode): EdgeTargetTuple {
  // biome-ignore lint/suspicious/useIterableCallbackReturn: the switch is exhaustive over `t.type`, which TypeScript verifies via the `EdgeTarget` return type
  return edge.targets.map((t): EdgeTarget => {
    switch (t.type) {
      case 'NodeRef':
        return toNodeRef(t);
      case 'NodeRefGroup':
        return t.children.map(toNodeRef);
    }
  }) as EdgeTargetTuple;
}
