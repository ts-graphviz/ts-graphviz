import type {
  Compass,
  EdgeTarget,
  EdgeTargetTuple,
  ForwardRefNode,
} from '@ts-graphviz/common';
import type {
  EdgeASTNode,
  NodeRefASTNode,
  SubgraphASTNode,
} from '../../../../types.js';
import { idFromLiteral } from '../../../literal.js';
import { nodeIdsOf } from './subgraph-nodes.js';

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

/**
 * The ids of `{a b}` (an anonymous subgraph of plain node statements) as
 * written, so a model group comes back exactly as `fromModel` wrote it.
 */
function plainNodeIds(target: SubgraphASTNode): string[] | undefined {
  if (target.id !== undefined) return undefined;
  const ids: string[] = [];
  for (const child of target.children) {
    if (child.type !== 'Node' || child.children.length > 0) return undefined;
    ids.push(idFromLiteral(child.id));
  }
  return ids;
}

/**
 * The model targets of an edge. A subgraph target becomes the group of its
 * nodes (without ports, which Graphviz ignores inside a subgraph); see
 * {@link nodeIdsOf}. `subgraphNodes` gives the nodes when the subgraph has
 * already been added to a graph, so a subgraph that is opened more than
 * once counts all of its nodes, as Graphviz does.
 */
export function convertToEdgeTargetTuple(
  edge: EdgeASTNode,
  subgraphNodes?: (index: number) => string[] | undefined,
): EdgeTargetTuple {
  // biome-ignore lint/suspicious/useIterableCallbackReturn: the switch is exhaustive over `t.type`, which TypeScript verifies via the `EdgeTarget` return type
  return edge.targets.map((t, i): EdgeTarget => {
    switch (t.type) {
      case 'NodeRef':
        return toNodeRef(t);
      case 'NodeRefList':
        return t.refs.map(toNodeRef);
      case 'Subgraph':
        return (subgraphNodes?.(i) ?? plainNodeIds(t) ?? nodeIdsOf(t)).map(
          (id) => ({ id }),
        );
    }
  }) as EdgeTargetTuple;
}
