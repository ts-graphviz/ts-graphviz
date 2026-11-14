import type {
  AttributeKey,
  AttributeValue,
  EdgeModel,
  GraphBaseModel,
  NodeModel,
  SubgraphModel,
} from '@ts-graphviz/common';
import { hasField, ownField } from '../../../../own-field.js';
import type {
  AttributeASTNode,
  ClusterStatementASTNode,
  SubgraphASTNode,
} from '../../../../types.js';
import { idFromLiteral, valueFromLiteral } from '../../../literal.js';
import { takeEdgeTargets } from '../../edge-target-budget.js';
import type { ConvertToModelContext } from '../../types.js';
import { convertEdge } from '../EdgePlugin.js';
import { BodyComments } from './body-comments.js';
import { collectAttributes } from './collect-attributes.js';
import { nodeIdsOf, type SubgraphIdCache } from './subgraph-nodes.js';

/**
 * The nodes each subgraph has had in this conversion, over every place it
 * is declared: `subgraph s { a } -> subgraph s { b }` reaches both a and b
 * at each end, as in Graphviz. A subgraph with an id is known by the graph
 * it is in and the id (each declaration is a model of its own); one without
 * is known by its model.
 */
const subgraphNodes = new WeakMap<
  ConvertToModelContext,
  Map<object, Map<string, Set<string>>>
>();

function nodesOf(
  context: ConvertToModelContext,
  graph: GraphBaseModel,
  subgraph: SubgraphModel,
): Set<string> {
  let byKey = subgraphNodes.get(context);
  if (byKey === undefined) {
    byKey = new Map();
    subgraphNodes.set(context, byKey);
  }
  const key: object = subgraph.id === undefined ? subgraph : graph;
  let byId = byKey.get(key);
  if (byId === undefined) {
    byId = new Map();
    byKey.set(key, byId);
  }
  const id = subgraph.id ?? '';
  let nodes = byId.get(id);
  if (nodes === undefined) {
    nodes = new Set();
    byId.set(id, nodes);
  }
  return nodes;
}

/**
 * A graph of the deprecated `legacyModels`, which holds one node per id, as
 * 3.x did: a node or a subgraph declared again adds to the first one.
 */
interface LegacyGraph {
  getNode(id: string): NodeModel | undefined;
  getSubgraph(id: string): SubgraphModel | undefined;
}

function asLegacy(graph: GraphBaseModel): LegacyGraph | undefined {
  // From the graph's classes only: a getNode inherited from Object.prototype
  // does not make every graph a legacy one.
  return hasField(graph, 'getNode') && hasField(graph, 'getSubgraph')
    ? (graph as GraphBaseModel & LegacyGraph)
    : undefined;
}

/**
 * The ids of each subgraph statement, collected once per conversion: the
 * subgraphs nested in one are applied (and collected) before it, so each
 * level reuses the ids of the levels below instead of walking them again.
 */
const idCaches = new WeakMap<ConvertToModelContext, SubgraphIdCache>();

function idCacheOf(context: ConvertToModelContext): SubgraphIdCache {
  let cache = idCaches.get(context);
  if (cache === undefined) {
    cache = new WeakMap();
    idCaches.set(context, cache);
  }
  return cache;
}

/**
 * Whether a subgraph target is only a set of nodes (`{a b}`): anonymous and
 * holding plain node statements. Graphviz keeps no trace of such a subgraph
 * (`dot -Tcanon` prints only the edges), so it becomes a model group, the
 * form `fromModel` writes groups in, rather than a model subgraph.
 */
function isNodeGroup(target: SubgraphASTNode): boolean {
  return (
    ownField(target, 'id') === undefined &&
    target.children.every((c) => c.type === 'Node' && c.children.length === 0)
  );
}

function applySubgraph(
  context: ConvertToModelContext,
  graph: GraphBaseModel,
  stmt: SubgraphASTNode,
): SubgraphModel {
  const id = ownField(stmt, 'id');
  const name = id ? idFromLiteral(id) : undefined;
  // Each declaration is a subgraph of its own, where it is written; a
  // legacy graph adds to the subgraph it has with the id.
  let subgraph =
    name !== undefined ? asLegacy(graph)?.getSubgraph(name) : undefined;
  if (subgraph === undefined) {
    subgraph = context.models.createSubgraph(name);
    graph.addSubgraph(subgraph);
  }
  applyStatements(context, subgraph, stmt.children);
  const nodes = nodesOf(context, graph, subgraph);
  for (const id of nodeIdsOf(stmt, idCacheOf(context))) nodes.add(id);
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
  const comments = new BodyComments();
  for (const stmt of statements) {
    switch (stmt.type) {
      case 'Subgraph': {
        const subgraph = applySubgraph(context, graph, stmt);
        comments.statement(subgraph, stmt);
        break;
      }
      case 'Attribute':
        graph.setAttribute(
          idFromLiteral(stmt.key) as AttributeKey,
          valueFromLiteral(stmt.value) as AttributeValue,
        );
        comments.statement(undefined, stmt);
        break;
      case 'Node': {
        // Converted by the node plugin each time, so a converter whose
        // plugin changes nodes applies to every mention.
        const node = context.convert(stmt);
        // Each declaration is a node of its own, where it is written, and
        // Graphviz applies their attributes in turn. A legacy graph adds a
        // node mentioned again to the one it has (`a [color=red]; a
        // [shape=box]` is one node with both), through its setAttribute, so
        // a setAttribute that changes values runs on them again.
        const existing = asLegacy(graph)?.getNode(node.id);
        if (existing) {
          for (const name of node.getAttributeNames()) {
            existing.setAttribute(name, node.getAttribute(name) as never);
          }
          comments.statement(existing, stmt);
        } else {
          comments.statement(node, stmt);
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
            if (subgraph === undefined) return undefined;
            const nodes = nodesOf(context, graph, subgraph);
            // A subgraph opened again keeps its nodes, so these grow with
            // every edge to it: bounded by `maxEdgeTargets`, checked before
            // they are copied.
            takeEdgeTargets(context, nodes.size);
            return [...nodes];
          });
        } else {
          edge = context.convert(stmt);
        }
        comments.statement(edge, stmt);
        graph.addEdge(edge);
        break;
      }
      case 'AttributeList': {
        const attributes = stmt.children.filter<AttributeASTNode>(
          (v): v is AttributeASTNode => v.type === 'Attribute',
        );
        // The graph decides: kept in place (the default classes) or
        // merged into its defaults (the deprecated `legacyModels`).
        const list = graph.addAttributeList(
          stmt.kind,
          collectAttributes(attributes),
        );
        comments.statement(list, stmt);
        break;
      }
      case 'Comment':
        comments.comment(stmt);
    }
  }
  comments.end(graph);
}
