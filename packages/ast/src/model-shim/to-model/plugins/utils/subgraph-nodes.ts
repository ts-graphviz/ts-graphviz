import type {
  ClusterStatementASTNode,
  EdgeTargetASTNode,
  SubgraphASTNode,
} from '../../../../types.js';
import { idFromLiteral } from '../../../literal.js';

/**
 * The ids of subgraphs already collected in a conversion, so a subgraph
 * nested in many levels is walked once rather than once per level.
 */
export type SubgraphIdCache = WeakMap<SubgraphASTNode, readonly string[]>;

function collect(
  statements: ClusterStatementASTNode[] | EdgeTargetASTNode[],
  ids: Set<string>,
  cache: SubgraphIdCache | undefined,
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
        collect(stmt.targets, ids, cache);
        break;
      case 'Subgraph': {
        const known = cache?.get(stmt);
        if (known === undefined) {
          collect(stmt.children, ids, cache);
        } else {
          for (const id of known) ids.add(id);
        }
        break;
      }
    }
  }
}

/**
 * The ids of the nodes a subgraph contains, as Graphviz counts them for an
 * edge to the subgraph: nodes declared in it, nodes its edges mention, and
 * the nodes of subgraphs nested in it, in the order they first appear.
 */
export function nodeIdsOf(
  subgraph: SubgraphASTNode,
  cache?: SubgraphIdCache,
): string[] {
  const known = cache?.get(subgraph);
  if (known !== undefined) return [...known];
  const ids = new Set<string>();
  collect(subgraph.children, ids, cache);
  const result = [...ids];
  cache?.set(subgraph, result);
  return [...result];
}
