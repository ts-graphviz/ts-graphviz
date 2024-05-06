import type { $keywords } from '../utils/types/$keywords.js';
import type { $keywordsValidation } from '../utils/types/$keywordsValidation.js';

/**
 * Attribute types available for cluster subgraph.
 * @group Attribute
 */
export type ClusterSubgraphAttributeKey = ClusterSubgraphAttributeKey.values;

/**
 * Attribute types available for cluster subgraph.
 * @hidden
 */
export namespace ClusterSubgraphAttributeKey {
  export type values = Exclude<keyof $values, keyof $exclude | symbol | number>;
  export interface $values
    extends $keywords<
      | 'K'
      | 'URL'
      | 'area'
      | 'bgcolor'
      | 'color'
      | 'colorscheme'
      | 'fillcolor'
      | 'fontcolor'
      | 'fontname'
      | 'fontsize'
      | 'gradientangle'
      | 'href'
      | 'id'
      | 'label'
      | 'labeljust'
      | 'labelloc'
      | 'layer'
      | 'lheight'
      | 'lp'
      | 'lwidth'
      | 'margin'
      | 'nojustify'
      | 'pencolor'
      | 'penwidth'
      | 'peripheries'
      | 'sortv'
      | 'style'
      | 'target'
      | 'tooltip'
      | 'class'
    > {}
  export interface $exclude extends $keywordsValidation {}
}
