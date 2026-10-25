import type {
  ClusterStatementASTNode,
  EdgeTargetASTNode,
  SubgraphASTNode,
} from '../../../../types.js';
import { idFromLiteral } from '../../../literal.js';

function collect(
  statements: ClusterStatementASTNode[] | EdgeTargetASTNode[],
  ids: Set<string>,
): void {
  for (const stmt of statements) {
    switch (stmt.type) {
      case 'Node':
      case 'NodeRef':
        ids.add(idFromLiteral(stmt.id));
        break;
      case 'NodeRefList':
        for (const ref of stmt.refs) ids.add(idFromLiteral(ref.id));
        break;
      case 'Edge':
        collect(stmt.targets, ids);
        break;
      case 'Subgraph':
        collect(stmt.children, ids);
        break;
    }
  }
}

/**
 * The ids of the nodes a subgraph contains, as Graphviz counts them for an
 * edge to the subgraph: nodes declared in it, nodes its edges mention, and
 * the nodes of subgraphs nested in it, in the order they first appear.
 */
export function nodeIdsOf(subgraph: SubgraphASTNode): string[] {
  const ids = new Set<string>();
  collect(subgraph.children, ids);
  return [...ids];
}
