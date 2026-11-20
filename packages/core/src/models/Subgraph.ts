import type {
  Attributes,
  ClusterSubgraphAttributeKey,
  EmptySchema,
  Schema,
  SubgraphAttributeKey,
  SubgraphModel,
} from '@ts-graphviz/common';
import { readArguments } from '@ts-graphviz/common';
import { isString } from './arguments.js';
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
   * A subgraph whose id starts with `cluster`, in any case, is a cluster.
   * A subgraph takes no attributes here: as in DOT, they are statements of
   * its body (`setAttribute`, `addAttributeAssignment`). Anything but an id
   * throws a `TypeError` with code `TSG_ERR_INVALID_ARGUMENTS`.
   */
  constructor(...args: [id?: string]) {
    super();
    const [id] = readArguments('new Subgraph()', args, [isString]) as [
      string | undefined,
    ];
    this.id = id;
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
