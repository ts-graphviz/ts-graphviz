/* eslint-disable @typescript-eslint/no-empty-interface */
import { $keywords, $keywordsValidation } from '../../utils/index.js';

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
/**
 * Attribute types available for graph.
 * @group Attribute
 */
export type GraphAttributeKey = GraphAttributeKey.values;
/** @hidden */
export namespace GraphAttributeKey {
  export type values = Exclude<keyof $values, keyof $exclude | symbol | number>;
  export interface $values
    extends $keywords<
      | 'Damping'
      | 'K'
      | 'URL'
      | '_background'
      | 'bb'
      | 'bgcolor'
      | 'center'
      | 'charset'
      | 'clusterrank'
      | 'colorscheme'
      | 'comment'
      | 'compound'
      | 'concentrate'
      | 'defaultdist'
      | 'dim'
      | 'dimen'
      | 'diredgeconstraints'
      | 'dpi'
      | 'epsilon'
      | 'esep'
      | 'fontcolor'
      | 'fontname'
      | 'fontnames'
      | 'fontpath'
      | 'fontsize'
      | 'forcelabels'
      | 'gradientangle'
      | 'href'
      | 'id'
      | 'imagepath'
      | 'inputscale'
      | 'label'
      | 'label_scheme'
      | 'labeljust'
      | 'labelloc'
      | 'landscape'
      | 'layerlistsep'
      | 'layers'
      | 'layerselect'
      | 'layersep'
      | 'layout'
      | 'levels'
      | 'levelsgap'
      | 'lheight'
      | 'lp'
      | 'lwidth'
      | 'margin'
      | 'maxiter'
      | 'mclimit'
      | 'mindist'
      | 'mode'
      | 'model'
      | 'mosek'
      | 'newrank'
      | 'nodesep'
      | 'nojustify'
      | 'normalize'
      | 'notranslate'
      | 'nslimit'
      | 'nslimit1'
      | 'ordering'
      | 'orientation'
      | 'outputorder'
      | 'overlap'
      | 'overlap_scaling'
      | 'overlap_shrink'
      | 'pack'
      | 'packmode'
      | 'pad'
      | 'page'
      | 'pagedir'
      | 'quadtree'
      | 'quantum'
      | 'rankdir'
      | 'ranksep'
      | 'ratio'
      | 'remincross'
      | 'repulsiveforce'
      | 'resolution'
      | 'root'
      | 'rotate'
      | 'rotation'
      | 'scale'
      | 'searchsize'
      | 'sep'
      | 'showboxes'
      | 'size'
      | 'smoothing'
      | 'sortv'
      | 'splines'
      | 'start'
      | 'style'
      | 'stylesheet'
      | 'target'
      | 'truecolor'
      | 'viewport'
      | 'voro_margin'
      | 'xdotversion'
      | 'class'
      | 'TBbalance'
    > {}
  export interface $exclude extends $keywordsValidation {}
}
/**
 * Attribute types available for subgraph.
 * @group Attribute
 */
export type SubgraphAttributeKey = SubgraphAttributeKey.values;
/** @hidden */
export namespace SubgraphAttributeKey {
  export type values = Exclude<keyof $values, keyof $exclude | symbol | number>;
  export interface $values extends $keywords<'rank'> {}
  export interface $exclude extends $keywordsValidation {}
}

/**
 * Attribute types available for cluster subgraph.
 * @group Attribute
 */
export type ClusterSubgraphAttributeKey = ClusterSubgraphAttributeKey.values;
/** @hidden */
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
