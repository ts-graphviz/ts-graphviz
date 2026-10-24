import type {
  Compass,
  EdgeTarget,
  EdgeTargetTuple,
  ForwardRefNode,
} from '@ts-graphviz/common';
import type { EdgeASTNode, NodeRefASTNode } from '../../../../types.js';
import { idFromLiteral } from '../../../literal.js';

const COMPASS_POINTS: ReadonlySet<string> = new Set<Compass>([
  'n',
  'ne',
  'e',
  'se',
  's',
  'sw',
  'w',
  'nw',
  'c',
  '_',
]);

function toNodeRef(t: NodeRefASTNode): ForwardRefNode {
  // A compass point that is not a keyword (e.g. `b:p:""` printed by
  // `dot -Tcanon`) is ignored, as Graphviz ignores it.
  const compass = t.compass ? idFromLiteral(t.compass) : undefined;
  return {
    id: idFromLiteral(t.id),
    port: t.port ? idFromLiteral(t.port) : undefined,
    compass:
      compass !== undefined && COMPASS_POINTS.has(compass)
        ? (compass as Compass)
        : undefined,
  };
}

export function convertToEdgeTargetTuple(edge: EdgeASTNode): EdgeTargetTuple {
  // biome-ignore lint/suspicious/useIterableCallbackReturn: the switch is exhaustive over `t.type`, which TypeScript verifies via the `EdgeTarget` return type
  return edge.targets.map((t): EdgeTarget => {
    switch (t.type) {
      case 'NodeRef':
        return toNodeRef(t);
      case 'NodeRefGroup':
        return t.refs.map(toNodeRef);
    }
  }) as EdgeTargetTuple;
}
