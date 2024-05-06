import type { $keywords } from '../utils/types/$keywords.js';
import type { $keywordsValidation } from '../utils/types/$keywordsValidation.js';

/**
 * Attribute types available for subgraph.
 * @group Attribute
 */
export type SubgraphAttributeKey = SubgraphAttributeKey.values; /** @hidden */

export namespace SubgraphAttributeKey {
  export type values = Exclude<keyof $values, keyof $exclude | symbol | number>;
  export interface $values extends $keywords<'rank'> {}
  export interface $exclude extends $keywordsValidation {}
}
