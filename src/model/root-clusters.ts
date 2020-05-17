import { attribute } from '../attribute';
import { IRootCluster, RootClusterAttributes } from '../types';
import { Cluster } from './clusters';
import { Attributes } from './attributes-base';

/**
 * Base class for RootCluster.
 */
export abstract class RootCluster extends Cluster<attribute.RootCluster> implements IRootCluster {
  public readonly id?: string;
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

  public attributes = {
    graph: new Attributes<attribute.Subgraph | attribute.ClusterSubgraph>(),
    edge: new Attributes<attribute.Edge>(),
    node: new Attributes<attribute.Node>(),
  };
  constructor(id?: string, attributes?: RootClusterAttributes);
  constructor(id?: string, strict?: boolean, attributes?: RootClusterAttributes);
  constructor(strict?: boolean, attributes?: RootClusterAttributes);
  constructor(attributes?: RootClusterAttributes);
  constructor(...args: unknown[]) {
    super();
    this.id = args.find((arg): arg is string => typeof arg === 'string');
    this.strict = args.find((arg): arg is boolean => typeof arg === 'boolean') ?? false;
    const attributes = args.find((arg): arg is RootClusterAttributes => typeof arg === 'object');
    if (attributes !== undefined) {
      this.apply(attributes);
    }
  }
}

/**
 * Graph object.
 *
 * @description
 * An object representing an omnidirectional graph.
 * @category Primary
 */
export class Graph extends RootCluster {}

/**
 * Digraph object.
 *
 * @description
 * The object representing a directional graph.
 * @category Primary
 */
export class Digraph extends RootCluster {}
