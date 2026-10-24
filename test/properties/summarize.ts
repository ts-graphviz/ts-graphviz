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
export interface GraphSummary {
  id?: string;
  comment?: string;
  attributes: [string, unknown][];
  nodes: { id: string; comment?: string; attributes: [string, unknown][] }[];
  edges: {
    targets: string[];
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

function targetId(target: EdgeModel['targets'][number]): string {
  if (Array.isArray(target)) {
    return `{${target.map(targetId).join(' ')}}`;
  }
  return isNodeModel(target) ? target.id : target.id;
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
    targets: edge.targets.map(targetId),
    comment: edge.comment,
    attributes: sorted(edge.attributes.values),
  };
}

export function summarizeGraph(
  model: GraphBaseModel | SubgraphModel,
): GraphSummary {
  return {
    id: model.id,
    comment: model.comment,
    attributes: sorted(model.values),
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
