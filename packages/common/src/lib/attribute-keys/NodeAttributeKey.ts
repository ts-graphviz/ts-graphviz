import type { $keywords } from '../utils/types/$keywords.js';
import type { $keywordsValidation } from '../utils/types/$keywordsValidation.js';

/**
 * Attribute types available for nodes.
 * @group Attribute
 */
export type NodeAttributeKey = NodeAttributeKey.values;
/** @hidden */
export namespace NodeAttributeKey {
  export type values = Exclude<keyof $values, keyof $exclude | symbol | number>;
  export interface $values
    extends $keywords<
      | 'URL'
      | 'area'
      | 'color'
      | 'colorscheme'
      | 'comment'
      | 'distortion'
      | 'fillcolor'
      | 'fixedsize'
      | 'fontcolor'
      | 'fontname'
      | 'fontsize'
      | 'gradientangle'
      | 'group'
      | 'height'
      | 'href'
      | 'id'
      | 'image'
      | 'imagepos'
      | 'imagescale'
      | 'label'
      | 'labelloc'
      | 'layer'
      | 'margin'
      | 'nojustify'
      | 'ordering'
      | 'orientation'
      | 'penwidth'
      | 'peripheries'
      | 'pin'
      | 'pos'
      | 'rects'
      | 'regular'
      | 'root'
      | 'samplepoints'
      | 'shape'
      | 'shapefile'
      | 'showboxes'
      | 'sides'
      | 'skew'
      | 'sortv'
      | 'style'
      | 'target'
      | 'tooltip'
      | 'vertices'
      | 'width'
      | 'xlabel'
      | 'xlp'
      | 'z'
      | 'class'
    > {}
  export interface $exclude extends $keywordsValidation {}
}
