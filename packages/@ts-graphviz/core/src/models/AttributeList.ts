import {
  AttributeKey,
  AttributeListModel,
  ClusterSubgraphAttributeKey,
  GraphAttributesObject,
  SubgraphAttributeKey,
  SubgraphAttributesObject,
} from '@ts-graphviz/common';
import { AttributesBase } from './AttributesBase.js';
import { define } from '@ts-graphviz/common';
import { NodeAttributeKey } from '@ts-graphviz/common';
import { NodeAttributesObject } from '@ts-graphviz/common';
import { EdgeAttributeKey } from '@ts-graphviz/common';
import { EdgeAttributesObject } from '@ts-graphviz/common';

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
export class NodeAttributeList extends AttributeList<NodeAttributeKey> implements AttributeListModel<NodeAttributeKey> {
  constructor(attributes?: NodeAttributesObject) {
    super(attributes);
  }
}

@define({ type: 'AttributeList', kind: 'Edge' })
export class EdgeAttributeList extends AttributeList<EdgeAttributeKey> implements AttributeListModel<EdgeAttributeKey> {
  constructor(attributes?: EdgeAttributesObject) {
    super(attributes);
  }
}

@define({ type: 'AttributeList', kind: 'Graph' })
export class GraphAttributeList
  extends AttributeList<SubgraphAttributeKey | ClusterSubgraphAttributeKey>
  implements AttributeListModel<SubgraphAttributeKey | ClusterSubgraphAttributeKey>
{
  constructor(attributes?: SubgraphAttributesObject) {
    super(attributes);
  }
}
