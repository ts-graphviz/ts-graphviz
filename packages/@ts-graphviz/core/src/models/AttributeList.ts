import {
  AttributeKey,
  AttributeListModel,
  ClusterSubgraphAttributeKey,
  SubgraphAttributeKey,
  define,
  NodeAttributeKey,
  EdgeAttributeKey,
} from '@ts-graphviz/common';
import { AttributesBase } from './AttributesBase.js';

/**
 * A set of attribute values for any object.
 * @group Models
 */
export class AttributeList<T extends AttributeKey = AttributeKey>
  extends AttributesBase<T>
  implements AttributeListModel<T>
{
  public comment?: string;
}

@define({ type: 'AttributeList', kind: 'Node' })
export class NodeAttributeList extends AttributeList<NodeAttributeKey> {}

@define({ type: 'AttributeList', kind: 'Edge' })
export class EdgeAttributeList extends AttributeList<EdgeAttributeKey> {}

@define({ type: 'AttributeList', kind: 'Graph' })
export class GraphAttributeList extends AttributeList<SubgraphAttributeKey | ClusterSubgraphAttributeKey> {}
