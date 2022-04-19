import { attribute } from './assets';

/**
 * Attribute types available for edges.
 */
export type EdgeAttributeKey =
  | typeof attribute.URL
  | typeof attribute.arrowhead
  | typeof attribute.arrowsize
  | typeof attribute.arrowtail
  | typeof attribute.color
  | typeof attribute.colorscheme
  | typeof attribute.comment
  | typeof attribute.constraint
  | typeof attribute.decorate
  | typeof attribute.dir
  | typeof attribute.edgeURL
  | typeof attribute.edgehref
  | typeof attribute.edgetarget
  | typeof attribute.edgetooltip
  | typeof attribute.fillcolor
  | typeof attribute.fontcolor
  | typeof attribute.fontname
  | typeof attribute.fontsize
  | typeof attribute.headURL
  | typeof attribute.head_lp
  | typeof attribute.headclip
  | typeof attribute.headhref
  | typeof attribute.headlabel
  | typeof attribute.headport
  | typeof attribute.headtarget
  | typeof attribute.headtooltip
  | typeof attribute.href
  | typeof attribute.id
  | typeof attribute.label
  | typeof attribute.labelURL
  | typeof attribute.labelangle
  | typeof attribute.labeldistance
  | typeof attribute.labelfloat
  | typeof attribute.labelfontcolor
  | typeof attribute.labelfontname
  | typeof attribute.labelfontsize
  | typeof attribute.labelhref
  | typeof attribute.labeltarget
  | typeof attribute.labeltooltip
  | typeof attribute.layer
  | typeof attribute.len
  | typeof attribute.lhead
  | typeof attribute.lp
  | typeof attribute.ltail
  | typeof attribute.minlen
  | typeof attribute.nojustify
  | typeof attribute.penwidth
  | typeof attribute.pos
  | typeof attribute.samehead
  | typeof attribute.sametail
  | typeof attribute.showboxes
  | typeof attribute.style
  | typeof attribute.tailURL
  | typeof attribute.tail_lp
  | typeof attribute.tailclip
  | typeof attribute.tailhref
  | typeof attribute.taillabel
  | typeof attribute.tailport
  | typeof attribute.tailtarget
  | typeof attribute.tailtooltip
  | typeof attribute.target
  | typeof attribute.tooltip
  | typeof attribute.weight
  | typeof attribute.xlabel
  | typeof attribute.xlp
  | typeof attribute._class;

/**
 * Attribute types available for nodes.
 */
export type NodeAttributeKey =
  | typeof attribute.URL
  | typeof attribute.area
  | typeof attribute.color
  | typeof attribute.colorscheme
  | typeof attribute.comment
  | typeof attribute.distortion
  | typeof attribute.fillcolor
  | typeof attribute.fixedsize
  | typeof attribute.fontcolor
  | typeof attribute.fontname
  | typeof attribute.fontsize
  | typeof attribute.gradientangle
  | typeof attribute.group
  | typeof attribute.height
  | typeof attribute.href
  | typeof attribute.id
  | typeof attribute.image
  | typeof attribute.imagepos
  | typeof attribute.imagescale
  | typeof attribute.label
  | typeof attribute.labelloc
  | typeof attribute.layer
  | typeof attribute.margin
  | typeof attribute.nojustify
  | typeof attribute.ordering
  | typeof attribute.orientation
  | typeof attribute.penwidth
  | typeof attribute.peripheries
  | typeof attribute.pin
  | typeof attribute.pos
  | typeof attribute.rects
  | typeof attribute.regular
  | typeof attribute.root
  | typeof attribute.samplepoints
  | typeof attribute.shape
  | typeof attribute.shapefile
  | typeof attribute.showboxes
  | typeof attribute.sides
  | typeof attribute.skew
  | typeof attribute.sortv
  | typeof attribute.style
  | typeof attribute.target
  | typeof attribute.tooltip
  | typeof attribute.vertices
  | typeof attribute.width
  | typeof attribute.xlabel
  | typeof attribute.xlp
  | typeof attribute.z
  | typeof attribute._class;

/**
 * Attribute types available for root cluster.
 */
export type RootClusterAttributeKey =
  | typeof attribute.Damping
  | typeof attribute.K
  | typeof attribute.URL
  | typeof attribute._background
  | typeof attribute.bb
  | typeof attribute.bgcolor
  | typeof attribute.center
  | typeof attribute.charset
  | typeof attribute.clusterrank
  | typeof attribute.colorscheme
  | typeof attribute.comment
  | typeof attribute.compound
  | typeof attribute.concentrate
  | typeof attribute.defaultdist
  | typeof attribute.dim
  | typeof attribute.dimen
  | typeof attribute.diredgeconstraints
  | typeof attribute.dpi
  | typeof attribute.epsilon
  | typeof attribute.esep
  | typeof attribute.fontcolor
  | typeof attribute.fontname
  | typeof attribute.fontnames
  | typeof attribute.fontpath
  | typeof attribute.fontsize
  | typeof attribute.forcelabels
  | typeof attribute.gradientangle
  | typeof attribute.href
  | typeof attribute.id
  | typeof attribute.imagepath
  | typeof attribute.inputscale
  | typeof attribute.label
  | typeof attribute.label_scheme
  | typeof attribute.labeljust
  | typeof attribute.labelloc
  | typeof attribute.landscape
  | typeof attribute.layerlistsep
  | typeof attribute.layers
  | typeof attribute.layerselect
  | typeof attribute.layersep
  | typeof attribute.layout
  | typeof attribute.levels
  | typeof attribute.levelsgap
  | typeof attribute.lheight
  | typeof attribute.lp
  | typeof attribute.lwidth
  | typeof attribute.margin
  | typeof attribute.maxiter
  | typeof attribute.mclimit
  | typeof attribute.mindist
  | typeof attribute.mode
  | typeof attribute.model
  | typeof attribute.mosek
  | typeof attribute.newrank
  | typeof attribute.nodesep
  | typeof attribute.nojustify
  | typeof attribute.normalize
  | typeof attribute.notranslate
  | typeof attribute.nslimit
  | typeof attribute.nslimit1
  | typeof attribute.ordering
  | typeof attribute.orientation
  | typeof attribute.outputorder
  | typeof attribute.overlap
  | typeof attribute.overlap_scaling
  | typeof attribute.overlap_shrink
  | typeof attribute.pack
  | typeof attribute.packmode
  | typeof attribute.pad
  | typeof attribute.page
  | typeof attribute.pagedir
  | typeof attribute.quadtree
  | typeof attribute.quantum
  | typeof attribute.rankdir
  | typeof attribute.ranksep
  | typeof attribute.ratio
  | typeof attribute.remincross
  | typeof attribute.repulsiveforce
  | typeof attribute.resolution
  | typeof attribute.root
  | typeof attribute.rotate
  | typeof attribute.rotation
  | typeof attribute.scale
  | typeof attribute.searchsize
  | typeof attribute.sep
  | typeof attribute.showboxes
  | typeof attribute.size
  | typeof attribute.smoothing
  | typeof attribute.sortv
  | typeof attribute.splines
  | typeof attribute.start
  | typeof attribute.style
  | typeof attribute.stylesheet
  | typeof attribute.target
  | typeof attribute.truecolor
  | typeof attribute.viewport
  | typeof attribute.voro_margin
  | typeof attribute.xdotversion
  | typeof attribute._class;

/**
 * Attribute types available for subgraph.
 */
export type SubgraphAttributeKey = typeof attribute.rank;

/**
 * Attribute types available for cluster subgraph.
 */
export type ClusterSubgraphAttributeKey =
  | typeof attribute.K
  | typeof attribute.URL
  | typeof attribute.area
  | typeof attribute.bgcolor
  | typeof attribute.color
  | typeof attribute.colorscheme
  | typeof attribute.fillcolor
  | typeof attribute.fontcolor
  | typeof attribute.fontname
  | typeof attribute.fontsize
  | typeof attribute.gradientangle
  | typeof attribute.href
  | typeof attribute.id
  | typeof attribute.label
  | typeof attribute.labeljust
  | typeof attribute.labelloc
  | typeof attribute.layer
  | typeof attribute.lheight
  | typeof attribute.lp
  | typeof attribute.lwidth
  | typeof attribute.margin
  | typeof attribute.nojustify
  | typeof attribute.pencolor
  | typeof attribute.penwidth
  | typeof attribute.peripheries
  | typeof attribute.sortv
  | typeof attribute.style
  | typeof attribute.target
  | typeof attribute.tooltip
  | typeof attribute._class;

/**
 * Attribute types.
 */
export type AttributeKey =
  | NodeAttributeKey
  | EdgeAttributeKey
  | RootClusterAttributeKey
  | SubgraphAttributeKey
  | ClusterSubgraphAttributeKey;

interface AttributeValueMapping {
  [attribute._background]: string;
  [attribute.area]: attribute.type.Double;
  [attribute.arrowhead]: attribute.type.ArrowType;
  [attribute.arrowsize]: attribute.type.Double;
  [attribute.arrowtail]: attribute.type.ArrowType;
  [attribute.bb]: attribute.type.Rect;
  [attribute.bgcolor]: attribute.type.Color | attribute.type.ColorList;
  [attribute.center]: boolean;
  [attribute.charset]: string;
  [attribute._class]: string;
  [attribute.clusterrank]: attribute.type.ClusterMode;
  [attribute.color]: attribute.type.Color | attribute.type.ColorList;
  [attribute.colorscheme]: string;
  [attribute.comment]: string;
  [attribute.compound]: boolean;
  [attribute.concentrate]: boolean;
  [attribute.constraint]: boolean;
  [attribute.Damping]: attribute.type.Double;
  [attribute.decorate]: boolean;
  [attribute.defaultdist]: attribute.type.Double;
  [attribute.dim]: attribute.type.Int;
  [attribute.dimen]: attribute.type.Int;
  [attribute.dir]: attribute.type.DirType;
  [attribute.diredgeconstraints]: string | boolean;
  [attribute.distortion]: attribute.type.Double;
  [attribute.dpi]: attribute.type.Double;
  [attribute.edgehref]: attribute.type.EscString;
  [attribute.edgetarget]: attribute.type.EscString;
  [attribute.edgetooltip]: attribute.type.EscString;
  [attribute.edgeURL]: attribute.type.EscString;
  [attribute.epsilon]: attribute.type.Double;
  [attribute.esep]: attribute.type.AddDouble | attribute.type.AddPoint;
  [attribute.fillcolor]: attribute.type.Color | attribute.type.ColorList;
  [attribute.fixedsize]: boolean | string;
  [attribute.fontcolor]: attribute.type.Color;
  [attribute.fontname]: string;
  [attribute.fontnames]: string;
  [attribute.fontpath]: string;
  [attribute.fontsize]: attribute.type.Double;
  [attribute.forcelabels]: boolean;
  [attribute.gradientangle]: attribute.type.Int;
  [attribute.group]: string;
  [attribute.head_lp]: attribute.type.Point;
  [attribute.headclip]: boolean;
  [attribute.headhref]: attribute.type.EscString;
  [attribute.headlabel]: attribute.type.LblString;
  [attribute.headport]: attribute.type.PortPos;
  [attribute.headtarget]: attribute.type.EscString;
  [attribute.headtooltip]: attribute.type.EscString;
  [attribute.headURL]: attribute.type.EscString;
  [attribute.height]: attribute.type.Double;
  [attribute.href]: attribute.type.EscString;
  [attribute.id]: attribute.type.EscString;
  [attribute.image]: string;
  [attribute.imagepath]: string;
  [attribute.imagepos]: string;
  [attribute.imagescale]: string | boolean;
  [attribute.inputscale]: attribute.type.Double;
  [attribute.K]: attribute.type.Double;
  [attribute.label]: attribute.type.LblString;
  [attribute.label_scheme]: attribute.type.Int;
  [attribute.labelangle]: attribute.type.Double;
  [attribute.labeldistance]: attribute.type.Double;
  [attribute.labelfloat]: boolean;
  [attribute.labelfontcolor]: attribute.type.Color;
  [attribute.labelfontname]: string;
  [attribute.labelfontsize]: attribute.type.Double;
  [attribute.labelhref]: attribute.type.EscString;
  [attribute.labeljust]: string;
  [attribute.labelloc]: string;
  [attribute.labeltarget]: attribute.type.EscString;
  [attribute.labeltooltip]: attribute.type.EscString;
  [attribute.labelURL]: attribute.type.EscString;
  [attribute.landscape]: boolean;
  [attribute.layer]: attribute.type.LayerRange;
  [attribute.layerlistsep]: string;
  [attribute.layers]: attribute.type.LayerList;
  [attribute.layerselect]: attribute.type.LayerRange;
  [attribute.layersep]: string;
  [attribute.layout]: string;
  [attribute.len]: attribute.type.Double;
  [attribute.levels]: attribute.type.Int;
  [attribute.levelsgap]: attribute.type.Double;
  [attribute.lhead]: string;
  [attribute.lheight]: attribute.type.Double;
  [attribute.lp]: attribute.type.Point;
  [attribute.ltail]: string;
  [attribute.lwidth]: attribute.type.Double;
  [attribute.margin]: attribute.type.Double | attribute.type.Point;
  [attribute.maxiter]: attribute.type.Int;
  [attribute.mclimit]: attribute.type.Double;
  [attribute.mindist]: attribute.type.Double;
  [attribute.minlen]: attribute.type.Int;
  [attribute.mode]: string;
  [attribute.model]: string;
  [attribute.mosek]: boolean;
  [attribute.newrank]: boolean;
  [attribute.nodesep]: attribute.type.Double;
  [attribute.nojustify]: boolean;
  [attribute.normalize]: attribute.type.Double | boolean;
  [attribute.notranslate]: boolean;
  [attribute.nslimit]: attribute.type.Double;
  [attribute.nslimit1]: attribute.type.Double;
  [attribute.ordering]: string;
  [attribute.orientation]: string | attribute.type.Double;
  [attribute.outputorder]: attribute.type.OutputMode;
  [attribute.overlap]: string | boolean;
  [attribute.overlap_scaling]: attribute.type.Double;
  [attribute.overlap_shrink]: boolean;
  [attribute.pack]: boolean | attribute.type.Int;
  [attribute.packmode]: attribute.type.PackMode;
  [attribute.pad]: attribute.type.Double | attribute.type.Point;
  [attribute.page]: attribute.type.Double | attribute.type.Point;
  [attribute.pagedir]: attribute.type.Pagedir;
  [attribute.pencolor]: attribute.type.Color;
  [attribute.penwidth]: attribute.type.Double;
  [attribute.peripheries]: attribute.type.Int;
  [attribute.pin]: boolean;
  [attribute.pos]: attribute.type.Point | attribute.type.SplineType;
  [attribute.quadtree]: attribute.type.QuadType | boolean;
  [attribute.quantum]: attribute.type.Double;
  [attribute.rank]: attribute.type.RankType;
  [attribute.rankdir]: attribute.type.Rankdir;
  [attribute.ranksep]: attribute.type.Double | attribute.type.DoubleList;
  [attribute.ratio]: attribute.type.Double | string;
  [attribute.rects]: attribute.type.Rect;
  [attribute.regular]: boolean;
  [attribute.remincross]: boolean;
  [attribute.repulsiveforce]: attribute.type.Double;
  [attribute.resolution]: attribute.type.Double;
  [attribute.root]: string | boolean;
  [attribute.rotate]: attribute.type.Int;
  [attribute.rotation]: attribute.type.Double;
  [attribute.samehead]: string;
  [attribute.sametail]: string;
  [attribute.samplepoints]: attribute.type.Int;
  [attribute.scale]: attribute.type.Double | attribute.type.Point;
  [attribute.searchsize]: attribute.type.Int;
  [attribute.sep]: attribute.type.AddDouble | attribute.type.AddPoint;
  [attribute.shape]: attribute.type.Shape;
  [attribute.shapefile]: string;
  [attribute.showboxes]: attribute.type.Int;
  [attribute.sides]: attribute.type.Int;
  [attribute.size]: attribute.type.Double | attribute.type.Point;
  [attribute.skew]: attribute.type.Double;
  [attribute.smoothing]: attribute.type.SmoothType;
  [attribute.sortv]: attribute.type.Int;
  [attribute.splines]: boolean | string;
  [attribute.start]: attribute.type.StartType;
  [attribute.style]: attribute.type.Style;
  [attribute.stylesheet]: string;
  [attribute.tail_lp]: string;
  [attribute.tailclip]: attribute.type.Point;
  [attribute.tailclip]: attribute.type.Point;
  [attribute.tailhref]: attribute.type.EscString;
  [attribute.taillabel]: attribute.type.LblString;
  [attribute.tailport]: attribute.type.PortPos;
  [attribute.tailtarget]: attribute.type.EscString;
  [attribute.tailtooltip]: attribute.type.EscString;
  [attribute.tailURL]: attribute.type.EscString;
  [attribute.target]: attribute.type.EscString | string;
  [attribute.tooltip]: attribute.type.EscString;
  [attribute.truecolor]: boolean;
  [attribute.URL]: attribute.type.EscString;
  [attribute.vertices]: attribute.type.PointList;
  [attribute.viewport]: attribute.type.ViewPort;
  [attribute.voro_margin]: attribute.type.Double;
  [attribute.weight]: attribute.type.Int | attribute.type.Double;
  [attribute.width]: attribute.type.Double;
  [attribute.xdotversion]: string;
  [attribute.xlabel]: attribute.type.LblString;
  [attribute.xlp]: attribute.type.Point;
  [attribute.z]: attribute.type.Double;
}

export type Attribute<T extends AttributeKey> = AttributeValueMapping[T];
