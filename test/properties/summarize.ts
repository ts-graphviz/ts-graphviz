import type {
  EdgeModel,
  GraphBaseModel,
  NodeModel,
  RootGraphModel,
  SubgraphModel,
} from '@ts-graphviz/common';
import { isNodeModel } from '@ts-graphviz/common';

/**
 * A plain, order-preserving description of a model, for structural equality
 * checks across conversions (the model classes themselves hold cyclic
 * references and context objects).
 */
interface GraphSummary {
  id?: string;
  comment?: string;
  /** The body as DOT has it (see {@link bodyOf}). */
  body: BodyEntry[];
  nodes: { id: string; comment?: string; attributes: [string, unknown][] }[];
  edges: {
    targets: TargetSummary[];
    comment?: string;
    attributes: [string, unknown][];
  }[];
  subgraphs: GraphSummary[];
}

/** A statement of a body, by its kind. */
export type BodyEntry =
  | ['assignment', string, unknown]
  | ['defaults', string, [string, unknown][]]
  | ['node', string]
  | ['edge']
  | ['subgraph', string | undefined, BodyEntry[]];

/**
 * A graph's body as DOT has it: its own attributes, which `toDot` writes
 * first as graph attribute assignments (`key = value;`), its leading default
 * statements, and its statements in order. `fromDot` reads them back as
 * statements of the graph, so a model and the model read from its DOT have
 * the same body.
 */
export function bodyOf(g: GraphBaseModel): BodyEntry[] {
  return [
    ...g.values.map(([k, v]): BodyEntry => ['assignment', k, v]),
    ...Object.values(g.attributes)
      .filter((list) => list.getAttributeNames().length > 0)
      .map((list): BodyEntry => ['defaults', list.$$kind, sorted(list.values)]),
    ...g.statements.map((s): BodyEntry => {
      switch (s.$$type) {
        case 'Node':
          return ['node', s.id];
        case 'Edge':
          return ['edge'];
        case 'Subgraph':
          return ['subgraph', s.id, bodyOf(s)];
        case 'AttributeAssignment':
          return ['assignment', s.key, s.value];
        default:
          return ['defaults', s.$$kind, sorted(s.values)];
      }
    }),
  ];
}

export interface RootGraphSummary extends GraphSummary {
  directed: boolean;
  strict: boolean;
}

const sorted = (values: ReadonlyArray<[string, unknown]>) =>
  [...values].sort(([a], [b]) => a.localeCompare(b));

/**
 * A node reference as a plain object; a group as an array of them. A group
 * of one node is that node: the same edge to Graphviz, and `toDot` writes a
 * one-node group with a port as the node itself (a comma list needs two).
 */
type TargetSummary =
  | { id: string; port?: string; compass?: string }
  | { id: string; port?: string; compass?: string }[];

function summarizeTarget(target: EdgeModel['targets'][number]): TargetSummary {
  if (Array.isArray(target)) {
    let refs = target.map(
      (t) => summarizeTarget(t) as Exclude<TargetSummary, unknown[]>,
    );
    // Without ports a group is written `{a b}`, a subgraph: a set of nodes.
    if (refs.every((r) => r.port === undefined && r.compass === undefined)) {
      refs = [...new Map(refs.map((r) => [r.id, r])).values()];
    }
    return refs.length === 1 ? refs[0] : refs;
  }
  if (isNodeModel(target)) {
    return { id: target.id };
  }
  return {
    id: target.id,
    ...(target.port !== undefined ? { port: target.port } : {}),
    ...(target.compass !== undefined ? { compass: target.compass } : {}),
  };
}

function summarizeNode(node: NodeModel): GraphSummary['nodes'][number] {
  return {
    id: node.id,
    comment: node.comment,
    attributes: sorted(node.attributes.values),
  };
}

function summarizeEdge(edge: EdgeModel): GraphSummary['edges'][number] {
  return {
    targets: edge.targets.map(summarizeTarget),
    comment: edge.comment,
    attributes: sorted(edge.attributes.values),
  };
}

function summarizeGraph(model: GraphBaseModel | SubgraphModel): GraphSummary {
  return {
    id: model.id,
    comment: model.comment,
    body: bodyOf(model),
    nodes: model.getNodes().map(summarizeNode),
    edges: model.getEdges().map(summarizeEdge),
    subgraphs: model.getSubgraphs().map(summarizeGraph),
  };
}

export function summarize(model: RootGraphModel): RootGraphSummary {
  return {
    directed: model.directed,
    strict: model.strict,
    ...summarizeGraph(model),
  };
}
