import type {
  AttributeKey,
  AttributeValue,
  EdgeModel,
  GraphBaseModel,
  SubgraphModel,
} from '@ts-graphviz/common';
import type {
  AttributeASTNode,
  ClusterStatementASTNode,
  SubgraphASTNode,
} from '../../../../types.js';
import { idFromLiteral, valueFromLiteral } from '../../../literal.js';
import type { ConvertToModelContext } from '../../types.js';
import { convertEdge } from '../EdgePlugin.js';
import { collectAttributes } from './collect-attributes.js';
import { CommentHolder } from './comment-holder.js';
import { nodeIdsOf } from './subgraph-nodes.js';

/**
 * The nodes each subgraph model has had in this conversion, over every
 * place it is opened: `subgraph s { a } -> subgraph s { b }` reaches both
 * a and b at each end, as in Graphviz.
 */
const subgraphNodes = new WeakMap<SubgraphModel, Set<string>>();

/**
 * Whether a subgraph target is only a set of nodes (`{a b}`): anonymous and
 * holding plain node statements. Graphviz keeps no trace of such a subgraph
 * (`dot -Tcanon` prints only the edges), so it becomes a model group, the
 * form `fromModel` writes groups in, rather than a model subgraph.
 */
function isNodeGroup(target: SubgraphASTNode): boolean {
  return (
    target.id === undefined &&
    target.children.every((c) => c.type === 'Node' && c.children.length === 0)
  );
}

function applySubgraph(
  context: ConvertToModelContext,
  graph: GraphBaseModel,
  stmt: SubgraphASTNode,
): SubgraphModel {
  const subgraph = stmt.id
    ? graph.subgraph(idFromLiteral(stmt.id))
    : graph.subgraph();
  applyStatements(context, subgraph, stmt.children);
  const nodes = subgraphNodes.get(subgraph) ?? new Set<string>();
  for (const id of nodeIdsOf(stmt)) nodes.add(id);
  subgraphNodes.set(subgraph, nodes);
  return subgraph;
}

/**
 * Applies an array of graph statement AST nodes to a graph model within a conversion context.
 *
 * Iterates over each statement and updates the graph model accordingly, handling subgraphs, attributes, nodes, edges, attribute lists, and comments. Comments are managed and associated with relevant graph elements as statements are processed.
 *
 * @param statements - The array of AST nodes representing graph statements to apply.
 */
export function applyStatements(
  context: ConvertToModelContext,
  graph: GraphBaseModel,
  statements: ClusterStatementASTNode[],
): void {
  const commentHolder = new CommentHolder();
  for (const stmt of statements) {
    switch (stmt.type) {
      case 'Subgraph': {
        const subgraph = applySubgraph(context, graph, stmt);
        commentHolder.apply(subgraph, stmt.location);
        break;
      }
      case 'Attribute':
        graph.set(
          idFromLiteral(stmt.key) as AttributeKey,
          valueFromLiteral(stmt.value) as AttributeValue,
        );
        commentHolder.reset();
        break;
      case 'Node': {
        const node = context.convert(stmt);
        // A node mentioned again adds to its attributes, as in Graphviz
        // (`a [color=red]; a [shape=box]` is one node with both).
        const existing = graph.getNode(node.id);
        if (existing) {
          existing.attributes.apply(node.attributes.values);
          commentHolder.apply(existing, stmt.location);
        } else {
          commentHolder.apply(node, stmt.location);
          graph.addNode(node);
        }
        break;
      }
      case 'Edge': {
        let edge: EdgeModel;
        if (
          stmt.targets.some((t) => t.type === 'Subgraph' && !isNodeGroup(t))
        ) {
          // As in Graphviz, a subgraph target is a subgraph of the graph
          // (with its statements) and the edge reaches all of its nodes.
          // All of them are built before the edge is, so a subgraph opened
          // at both ends counts its nodes from both.
          const subgraphs = stmt.targets.map((t) =>
            t.type === 'Subgraph' && !isNodeGroup(t)
              ? applySubgraph(context, graph, t)
              : undefined,
          );
          edge = convertEdge(context, stmt, (i) => {
            const subgraph = subgraphs[i];
            return subgraph && [...(subgraphNodes.get(subgraph) ?? [])];
          });
        } else {
          edge = context.convert(stmt);
        }
        commentHolder.apply(edge, stmt.location);
        graph.addEdge(edge);
        break;
      }
      case 'AttributeList': {
        const attributes = stmt.children.filter<AttributeASTNode>(
          (v): v is AttributeASTNode => v.type === 'Attribute',
        );
        // `attributes.<kind>.apply` takes the entries as is; `graph.edge()`
        // would read an array as edge targets.
        switch (stmt.kind) {
          case 'Edge':
            graph.attributes.edge.apply(collectAttributes(attributes));
            break;
          case 'Node':
            graph.attributes.node.apply(collectAttributes(attributes));
            break;
          case 'Graph':
            graph.attributes.graph.apply(collectAttributes(attributes));
            break;
        }
        commentHolder.reset();
        break;
      }
      case 'Comment':
        commentHolder.set(stmt);
    }
  }
}
