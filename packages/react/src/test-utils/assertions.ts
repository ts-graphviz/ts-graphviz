import type {
  DotObjectModel,
  EdgeModel,
  GraphBaseModel,
  NodeModel,
  SubgraphModel,
} from 'ts-graphviz';
import { expect } from 'vitest';

/**
 * Custom assertions for ts-graphviz models
 */

export function expectNode(model: DotObjectModel): asserts model is NodeModel {
  expect(model.$$type).toBe('Node');
}

export function expectEdge(model: DotObjectModel): asserts model is EdgeModel {
  expect(model.$$type).toBe('Edge');
}

export function expectGraph(
  model: DotObjectModel,
): asserts model is GraphBaseModel {
  expect(model.$$type).toBe('Graph');
}

export function expectSubgraph(
  model: DotObjectModel,
): asserts model is SubgraphModel {
  expect(model.$$type).toBe('Subgraph');
}

export function expectModelsToContainTypes(
  models: DotObjectModel[],
  expectedTypes: Array<'Node' | 'Edge' | 'Graph' | 'Subgraph'>,
) {
  const actualTypes = models.map((m) => m.$$type);
  for (const type of expectedTypes) {
    expect(actualTypes).toContain(type);
  }
}

export function expectModelWithId(
  models: DotObjectModel[],
  id: string,
): DotObjectModel {
  const model = models.find((m) => (m as any).id === id);
  expect(model).toBeDefined();
  if (!model) {
    throw new Error(`Model with id '${id}' not found`);
  }
  return model;
}

export function expectGraphStructure(
  graph: GraphBaseModel,
  expected: {
    nodeCount?: number;
    edgeCount?: number;
    subgraphCount?: number;
    directed?: boolean;
  },
) {
  if (expected.nodeCount !== undefined) {
    expect(graph.nodes.length).toBe(expected.nodeCount);
  }
  if (expected.edgeCount !== undefined) {
    expect(graph.edges.length).toBe(expected.edgeCount);
  }
  if (expected.subgraphCount !== undefined) {
    expect(graph.subgraphs.length).toBe(expected.subgraphCount);
  }
  if (expected.directed !== undefined) {
    expect((graph as any).directed).toBe(expected.directed);
  }
}
