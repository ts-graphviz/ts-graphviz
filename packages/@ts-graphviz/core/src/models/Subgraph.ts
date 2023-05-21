import {
  SubgraphAttributeKey,
  ClusterSubgraphAttributeKey,
  SubgraphModel,
  SubgraphAttributesObject,
  define,
} from '@ts-graphviz/common';
import { GraphBase } from './GraphBase.js';

/**
 * DOT object class representing a subgraph.
 * @group Models
 */
@define({ type: 'Subgraph' })
export class Subgraph extends GraphBase<SubgraphAttributeKey | ClusterSubgraphAttributeKey> implements SubgraphModel {
  public readonly id?: string;

  constructor(id?: string, attributes?: SubgraphAttributesObject);

  constructor(attributes?: SubgraphAttributesObject);

  constructor(...args: unknown[]) {
    super();
    this.id = args.find((arg): arg is string => typeof arg === 'string');
    const attributes = args.find((arg): arg is SubgraphAttributesObject => typeof arg === 'object' && arg !== null);
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
}
