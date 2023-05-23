import { EdgeASTNode } from '@ts-graphviz/ast';
import { EdgeTargetTuple, EdgeTarget } from '@ts-graphviz/common';

export function convertToEdgeTargetTuple(edge: EdgeASTNode): EdgeTargetTuple {
  return edge.targets.map((t): EdgeTarget => {
    switch (t.type) {
      case 'NodeRef':
        return { id: t.id.value, port: t.port?.value, compass: t.compass?.value };
      case 'NodeRefGroup':
        return t.children.map((t) => ({ id: t.id.value, port: t.port?.value, compass: t.compass?.value }));
    }
  }) as EdgeTargetTuple;
}
