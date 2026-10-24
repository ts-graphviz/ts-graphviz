import type { EdgeTarget, EdgeTargetTuple } from '@ts-graphviz/common';
import type { EdgeASTNode } from '../../../../types.js';

export function convertToEdgeTargetTuple(edge: EdgeASTNode): EdgeTargetTuple {
  // biome-ignore lint/suspicious/useIterableCallbackReturn: the switch is exhaustive over `t.type`, which TypeScript verifies via the `EdgeTarget` return type
  return edge.targets.map((t): EdgeTarget => {
    switch (t.type) {
      case 'NodeRef':
        return {
          id: t.id.value,
          port: t.port?.value,
          compass: t.compass?.value,
        };
      case 'NodeRefGroup':
        return t.children.map((t) => ({
          id: t.id.value,
          port: t.port?.value,
          compass: t.compass?.value,
        }));
    }
  }) as EdgeTargetTuple;
}
