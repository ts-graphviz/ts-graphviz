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
  attributes: [string, unknown][];
  /** `graph [...]`, `node [...]` and `edge [...]` default statements. */
  defaults: {
    graph: [string, unknown][];
    node: [string, unknown][];
    edge: [string, unknown][];
  };
  nodes: { id: string; comment?: string; attributes: [string, unknown][] }[];
  edges: {
    targets: TargetSummary[];
    comment?: string;
    attributes: [string, unknown][];
  }[];
  subgraphs: GraphSummary[];
}

export interface RootGraphSummary extends GraphSummary {
  directed: boolean;
  strict: boolean;
}

const sorted = (values: ReadonlyArray<[string, unknown]>) =>
  [...values].sort(([a], [b]) => a.localeCompare(b));

/** A node reference as a plain object; a group as an array of them. */
type TargetSummary =
  | { id: string; port?: string; compass?: string }
  | { id: string; port?: string; compass?: string }[];

function summarizeTarget(target: EdgeModel['targets'][number]): TargetSummary {
  if (Array.isArray(target)) {
    return target.map(
      (t) => summarizeTarget(t) as Exclude<TargetSummary, unknown[]>,
    );
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
    attributes: sorted(model.values),
    defaults: {
      graph: sorted(model.attributes.graph.values),
      node: sorted(model.attributes.node.values),
      edge: sorted(model.attributes.edge.values),
    },
    nodes: model.nodes.map(summarizeNode),
    edges: model.edges.map(summarizeEdge),
    subgraphs: model.subgraphs.map(summarizeGraph),
  };
}

export function summarize(model: RootGraphModel): RootGraphSummary {
  return {
    directed: model.directed,
    strict: model.strict,
    ...summarizeGraph(model),
  };
}
