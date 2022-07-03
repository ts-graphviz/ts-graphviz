import {
  ClusterSubgraphAttributeKey,
  EdgeAttributeKey,
  NodeAttributeKey,
  GraphAttributeKey,
  SubgraphAttributeKey,
} from '@ts-graphviz/dot-attribute';
import { GraphBase } from './clusters.js';
import { Attributes } from './attributes-base.js';
import { IGraph, GraphAttributes } from './types.js';

/**
 * Base class for RootCluster.
 *
 * @category Domain Model
 */
export class Graph extends GraphBase<GraphAttributeKey> implements IGraph {
  public readonly id?: string;

  public readonly directed: boolean;
  /**
   * Strict mode.
   *
   * @description
   * A graph may also be described as strict.
   * This forbids the creation of multi-edges, i.e., there can be at most one edge with a given tail node and head node in the directed case.
   * For undirected graphs, there can be at most one edge connected to the same two nodes.
   * Subsequent edge statements using the same two nodes will identify the edge with the previously defined one and apply any attributes given in the edge statement.
   */
  public strict: boolean;

  public attributes = Object.freeze({
    graph: new Attributes<SubgraphAttributeKey | ClusterSubgraphAttributeKey>(),
    edge: new Attributes<EdgeAttributeKey>(),
    node: new Attributes<NodeAttributeKey>(),
  });

  constructor(directed: boolean, id?: string, attributes?: GraphAttributes);

  constructor(directed: boolean, id?: string, strict?: boolean, attributes?: GraphAttributes);

  constructor(directed: boolean, strict?: boolean, attributes?: GraphAttributes);

  constructor(directed: boolean, attributes?: GraphAttributes);

  constructor(directed: boolean, ...args: unknown[]) {
    super();
    this.directed = directed;
    this.id = args.find((arg): arg is string => typeof arg === 'string');
    this.strict = args.find((arg): arg is boolean => typeof arg === 'boolean') ?? false;
    const attributes = args.find((arg): arg is GraphAttributes => typeof arg === 'object' && arg !== null);
    if (attributes !== undefined) {
      this.apply(attributes);
    }
  }
}
