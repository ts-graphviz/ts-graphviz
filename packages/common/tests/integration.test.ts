import {
  type FilterableModel,
  isAttributeListModel,
  isCompass,
  isEdgeModel,
  isNodeModel,
  isNodeRef,
  isNodeRefLike,
  isRootGraphModel,
  isSubgraphModel,
  toNodeRef,
  toNodeRefGroup,
} from '@ts-graphviz/common';
import { describe, expect, it } from 'vitest';

describe('Integration Tests - Public API', () => {
  it('should export all type guards', () => {
    expect(typeof isNodeModel).toBe('function');
    expect(typeof isEdgeModel).toBe('function');
    expect(typeof isRootGraphModel).toBe('function');
    expect(typeof isSubgraphModel).toBe('function');
    expect(typeof isAttributeListModel).toBe('function');
  });

  it('should export all node reference utilities', () => {
    expect(typeof isNodeRef).toBe('function');
    expect(typeof isNodeRefLike).toBe('function');
    expect(typeof isCompass).toBe('function');
    expect(typeof toNodeRef).toBe('function');
    expect(typeof toNodeRefGroup).toBe('function');
  });

  it('should work with FilterableModel type', () => {
    const mockNode: FilterableModel = {
      $$type: 'Node',
      id: 'test',
      attributes: new Map(),
      comment: '',
    } as any;

    // Type guards should work with FilterableModel
    expect(isNodeModel(mockNode)).toBe(true);
    expect(isEdgeModel(mockNode)).toBe(false);
    expect(isRootGraphModel(mockNode)).toBe(false);
  });

  it('should demonstrate complete workflow', () => {
    // Start with unknown data
    const unknownData: unknown[] = [
      { $$type: 'Node', id: 'node1' },
      { $$type: 'Edge', targets: [{ id: 'node1' }, { id: 'node2' }] },
      'invalid',
      { $$type: 'Graph', directed: true, id: 'graph1' },
    ];

    // Filter and process with type safety
    const nodes = unknownData.filter(isNodeModel);
    const edges = unknownData.filter(isEdgeModel);
    const graphs = unknownData.filter(isRootGraphModel);

    expect(nodes).toHaveLength(1);
    expect(edges).toHaveLength(1);
    expect(graphs).toHaveLength(1);

    // TypeScript knows the exact types after filtering
    expect(nodes[0].id).toBe('node1');
    expect(edges[0].targets).toHaveLength(2);
    expect(graphs[0].directed).toBe(true);
  });

  it('should handle node reference parsing workflow', () => {
    const rawTargets = ['node1', 'node2:port1', 'node3:port2:ne'];

    // Validate all targets
    expect(rawTargets.every(isNodeRefLike)).toBe(true);

    // Convert to structured format
    const nodeRefs = toNodeRefGroup(rawTargets);

    expect(nodeRefs).toEqual([
      { id: 'node1', port: undefined },
      { id: 'node2', port: 'port1' },
      { id: 'node3', port: 'port2', compass: 'ne' },
    ]);

    // Validate compass directions
    expect(isCompass('ne')).toBe(true);
    expect(isCompass('invalid')).toBe(false);
  });
});
