import type {
  AnyModelTypes,
  ClusterSubgraphAttributeKey,
  ModelsContext,
  ModelTypes,
  SchemaOf,
  SubgraphAttributeKey,
  SubgraphAttributesObject,
  SubgraphModel,
} from '@ts-graphviz/common';
import { GraphBase } from './GraphBase.js';
import { defaultModelsContext } from './models-context.js';

/**
 * DOT object class representing a subgraph.
 * @group Models
 */
export class Subgraph<M extends AnyModelTypes = ModelTypes>
  extends GraphBase<
    'Subgraph',
    SubgraphAttributeKey | ClusterSubgraphAttributeKey,
    M
  >
  implements SubgraphModel<M>
{
  public get $$type(): 'Subgraph' {
    return 'Subgraph';
  }
  public readonly id?: string;

  constructor(id?: string, attributes?: SubgraphAttributesObject<SchemaOf<M>>);

  constructor(attributes?: SubgraphAttributesObject<SchemaOf<M>>);

  constructor(...args: unknown[]) {
    super();
    this.id = args.find((arg): arg is string => typeof arg === 'string');
    const attributes = args.find(
      (arg): arg is SubgraphAttributesObject<SchemaOf<M>> =>
        typeof arg === 'object' && arg !== null,
    );
    if (attributes !== undefined) {
      this.apply(attributes);
    }
  }

  public isSubgraphCluster(): boolean {
    // As Graphviz decides (is_a_cluster): an id starting with "cluster" in
    // any case, or the cluster attribute.
    return (
      (typeof this.id === 'string' &&
        this.id.slice(0, 7).toLowerCase() === 'cluster') ||
      graphvizBool(this.get('cluster'))
    );
  }

  /** @hidden */
  protected override defaultModels(): ModelsContext {
    return defaultModelsContext();
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
