import type { $keywords } from '../utils/types/$keywords.js';
import type { $keywordsValidation } from '../utils/types/$keywordsValidation.js';

/**
 * Attribute types available for edges.
 * @group Attribute
 */

export type EdgeAttributeKey = EdgeAttributeKey.values;
/** @hidden */
export namespace EdgeAttributeKey {
  export type values = Exclude<keyof $values, keyof $exclude | symbol | number>;
  export interface $values
    extends $keywords<
      | 'URL'
      | 'arrowhead'
      | 'arrowsize'
      | 'arrowtail'
      | 'color'
      | 'colorscheme'
      | 'comment'
      | 'constraint'
      | 'decorate'
      | 'dir'
      | 'edgeURL'
      | 'edgehref'
      | 'edgetarget'
      | 'edgetooltip'
      | 'fillcolor'
      | 'fontcolor'
      | 'fontname'
      | 'fontsize'
      | 'headURL'
      | 'head_lp'
      | 'headclip'
      | 'headhref'
      | 'headlabel'
      | 'headport'
      | 'headtarget'
      | 'headtooltip'
      | 'href'
      | 'id'
      | 'label'
      | 'labelURL'
      | 'labelangle'
      | 'labeldistance'
      | 'labelfloat'
      | 'labelfontcolor'
      | 'labelfontname'
      | 'labelfontsize'
      | 'labelhref'
      | 'labeltarget'
      | 'labeltooltip'
      | 'layer'
      | 'len'
      | 'lhead'
      | 'lp'
      | 'ltail'
      | 'minlen'
      | 'nojustify'
      | 'penwidth'
      | 'pos'
      | 'samehead'
      | 'sametail'
      | 'showboxes'
      | 'style'
      | 'tailURL'
      | 'tail_lp'
      | 'tailclip'
      | 'tailhref'
      | 'taillabel'
      | 'tailport'
      | 'tailtarget'
      | 'tailtooltip'
      | 'target'
      | 'tooltip'
      | 'weight'
      | 'xlabel'
      | 'xlp'
      | 'class'
    > {}

  export interface $exclude extends $keywordsValidation {}
}
