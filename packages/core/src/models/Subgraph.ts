import type {
  ClusterSubgraphAttributeKey,
  ModelsContext,
  ModelTypes,
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
export class Subgraph<M extends ModelTypes = ModelTypes>
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

  constructor(id?: string, attributes?: SubgraphAttributesObject);

  constructor(attributes?: SubgraphAttributesObject);

  constructor(...args: unknown[]) {
    super();
    this.id = args.find((arg): arg is string => typeof arg === 'string');
    const attributes = args.find(
      (arg): arg is SubgraphAttributesObject =>
        typeof arg === 'object' && arg !== null,
    );
    if (attributes !== undefined) {
      this.apply(attributes);
    }
  }

  public isSubgraphCluster(): boolean {
    if (typeof this.id === 'string') {
      return this.id.startsWith('cluster');
    }
    return false;
  }

  /** @hidden */
  protected override defaultModels(): ModelsContext {
    return defaultModelsContext();
  }
}
