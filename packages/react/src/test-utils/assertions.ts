import type {
  DotObjectModel,
  EdgeModel,
  GraphBaseModel,
  NodeModel,
  SubgraphModel,
} from 'ts-graphviz';
import { expect } from 'vitest';

/**
 * Type guard utilities for ts-graphviz models
 */

/**
 * Type guard for models with id property
 */
export function hasId(
  model: DotObjectModel,
): model is DotObjectModel & { id: string } {
  return 'id' in model && typeof (model as any).id === 'string';
}

/**
 * Type guard for graph models with directed property
 */
export function isDirectedGraph(
  model: GraphBaseModel,
): model is GraphBaseModel & { directed: boolean } {
  return 'directed' in model && typeof (model as any).directed === 'boolean';
}

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

export function expectModelWithId<T extends DotObjectModel>(
  models: T[],
  id: string,
): T & { id: string } {
  const model = models.find((m) => {
    // Type-safe access to id property using type guard
    return hasId(m) && m.id === id;
  });
  expect(model).toBeDefined();
  if (!model) {
    throw new Error(`Model with id '${id}' not found`);
  }
  // Type assertion is safe here because we found the model with hasId type guard
  return model as T & { id: string };
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
    // Use type guard for directed property access
    if (isDirectedGraph(graph)) {
      expect(graph.directed).toBe(expected.directed);
    } else {
      throw new Error('Graph does not have directed property');
    }
  }
}
