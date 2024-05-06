import type { ClusterSubgraphAttributeKey } from './ClusterSubgraphAttributeKey.js';
import type { EdgeAttributeKey } from './EdgeAttributeKey.js';
import type { GraphAttributeKey } from './GraphAttributeKey.js';
import type { NodeAttributeKey } from './NodeAttributeKey.js';
import type { SubgraphAttributeKey } from './SubgraphAttributeKey.js';

/**
 * Attribute types.
 * @group Attribute
 */

export type AttributeKey =
  | NodeAttributeKey
  | EdgeAttributeKey
  | GraphAttributeKey
  | SubgraphAttributeKey
  | ClusterSubgraphAttributeKey;
