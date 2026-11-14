import type {
  Attributes,
  ClusterSubgraphAttributeKey,
  ClusterSubgraphAttributesObject,
  EmptySchema,
  NonClusterSubgraphAttributesObject,
  Schema,
  SubgraphAttributeKey,
  SubgraphAttributesObject,
  SubgraphModel,
} from '@ts-graphviz/common';
import { GraphBase } from './GraphBase.js';

/**
 * DOT object class representing a subgraph.
 * @group Models
 */
export class Subgraph<S extends Schema = EmptySchema>
  extends GraphBase<
    'Subgraph',
    SubgraphAttributeKey | ClusterSubgraphAttributeKey,
    S
  >
  implements SubgraphModel<S>
{
  public get $$type(): 'Subgraph' {
    return 'Subgraph';
  }
  public readonly id?: string;

  /**
   * A subgraph whose id starts with `cluster` is a cluster, and takes the
   * attributes of a cluster. The id is checked for `cluster`, `Cluster` and
   * `CLUSTER`; for other spellings, and for an id known at run time only,
   * the attributes of a cluster need `cluster: true`.
   *
   * Only `createSubgraph` of a kit also refuses, for a cluster id, the
   * attributes that only a subgraph takes.
   */
  constructor(
    id: `cluster${string}` | `Cluster${string}` | `CLUSTER${string}`,
    attributes?: ClusterSubgraphAttributesObject<S>,
  );

  /**
   * Any other id, or none: the attributes of a subgraph, or those of a
   * cluster with `cluster: true`.
   */
  constructor(id?: string, attributes?: NonClusterSubgraphAttributesObject<S>);

  constructor(attributes?: NonClusterSubgraphAttributesObject<S>);

  constructor(...args: unknown[]) {
    super();
    this.id = args.find((arg): arg is string => typeof arg === 'string');
    const attributes = args.find(
      (arg): arg is SubgraphAttributesObject<S> =>
        typeof arg === 'object' && arg !== null,
    );
    if (attributes !== undefined) {
      this.setAttributes(attributes);
    }
  }

  public isSubgraphCluster(): boolean {
    // As Graphviz decides (is_a_cluster): an id starting with "cluster" in
    // any case, or the cluster attribute.
    return (
      (typeof this.id === 'string' &&
        this.id.slice(0, 7).toLowerCase() === 'cluster') ||
      // Read without the schema: whatever it says, Graphviz reads the value.
      graphvizBool((this as Attributes<'cluster'>).getAttribute('cluster'))
    );
  }
}

// How Graphviz reads a boolean attribute (mapbool): true / yes in any case,
// or a number other than 0. Values parsed from DOT may be strings.
function graphvizBool(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value !== 'string') return false;
  const text = value.toLowerCase();
  if (text === 'true' || text === 'yes') return true;
  return /^\d/.test(text) && Number.parseInt(text, 10) !== 0;
}
