import {
  ClusterSubgraphAttribute,
  EdgeAttribute,
  NodeAttribute,
  RootClusterAttribute,
  SubgraphAttribute,
} from '../attribute';
import { IContext, IRootCluster, RootClusterType } from '../types';
import { commentOut, concatWordsWithSpace, joinLines } from '../utils/dot-rendering';
import { Cluster } from './Cluster';

/**
 * Base class for RootCluster.
 */
export abstract class RootCluster extends Cluster<RootClusterAttribute> implements IRootCluster {
  /**
   * Strict mode.
   *
   * @description
   * A graph may also be described as strict.
   * This forbids the creation of multi-edges, i.e., there can be at most one edge with a given tail node and head node in the directed case.
   * For undirected graphs, there can be at most one edge connected to the same two nodes.
   * Subsequent edge statements using the same two nodes will identify the edge with the previously defined one and apply any attributes given in the edge statement.
   */
  public strict: boolean = false;
  /** Indicates the type of cluster. */
  public abstract readonly type: RootClusterType;
  public attributes = {
    graph: this.context.createAttributes<SubgraphAttribute | ClusterSubgraphAttribute>(),
    edge: this.context.createAttributes<EdgeAttribute>(),
    node: this.context.createAttributes<NodeAttribute>(),
  };
  constructor(public context: IContext, id?: string) {
    super();
    this.id = id;
    this.context.root = this;
  }
  /** Convert RootCluster to Dot language. */
  public toDot(): string {
    const comment = this.comment ? commentOut(this.comment) : undefined;
    const dot = concatWordsWithSpace(this.strict ? 'strict' : undefined, this.toDotWithoutComment());
    return joinLines(comment, dot);
  }
}
