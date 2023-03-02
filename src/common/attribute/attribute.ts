import type { AttributeKey } from './keys.js';
import type {
  AddDouble,
  AddPoint,
  ArrowType,
  Blank,
  ClusterMode,
  Color,
  ColorList,
  DirType,
  Double,
  DoubleList,
  EscString,
  Int,
  LayerList,
  LayerRange,
  LblString,
  OutputMode,
  PackMode,
  Pagedir,
  Point,
  PointList,
  PortPos,
  QuadType,
  Rankdir,
  RankType,
  Rect,
  Shape,
  SmoothType,
  SplineType,
  StartType,
  Style,
  ViewPort,
} from '../type/index.js';

/**
 * KeyValueMapping is an interface that defines a set of attributes that can be used to configure a graph.
 */
interface KeyValueMapping {
  _background: string;
  area: Double;
  arrowhead: ArrowType;
  arrowsize: Double;
  arrowtail: ArrowType;
  bb: Rect;
  bgcolor: Color | ColorList;
  center: boolean;
  charset: string;
  class: string;
  clusterrank: ClusterMode;
  color: Color | ColorList;
  colorscheme: string;
  comment: string;
  compound: boolean;
  concentrate: boolean;
  constraint: boolean;
  Damping: Double;
  decorate: boolean;
  defaultdist: Double;
  dim: Int;
  dimen: Int;
  dir: DirType;
  diredgeconstraints: string | boolean;
  distortion: Double;
  dpi: Double;
  edgehref: EscString;
  edgetarget: EscString;
  edgetooltip: EscString;
  edgeURL: EscString;
  epsilon: Double;
  esep: AddDouble | AddPoint;
  fillcolor: Color | ColorList;
  fixedsize: boolean | string;
  fontcolor: Color;
  fontname: string;
  fontnames: string;
  fontpath: string;
  fontsize: Double;
  forcelabels: boolean;
  gradientangle: Blank | Int;
  group: string;
  head_lp: Point;
  headclip: boolean;
  headhref: EscString;
  headlabel: LblString;
  headport: PortPos;
  headtarget: EscString;
  headtooltip: EscString;
  headURL: EscString;
  height: Blank | Double;
  href: EscString;
  id: EscString;
  image: string;
  imagepath: string;
  imagepos: string;
  imagescale: string | boolean;
  inputscale: Double;
  K: Double;
  label: LblString;
  label_scheme: Int;
  labelangle: Double;
  labeldistance: Double;
  labelfloat: boolean;
  labelfontcolor: Color;
  labelfontname: string;
  labelfontsize: Double;
  labelhref: EscString;
  labeljust: string;
  labelloc: string;
  labeltarget: EscString;
  labeltooltip: EscString;
  labelURL: EscString;
  landscape: boolean;
  layer: LayerRange;
  layerlistsep: string;
  layers: LayerList;
  layerselect: LayerRange;
  layersep: string;
  layout: string;
  len: Double;
  levels: Int;
  levelsgap: Double;
  lhead: string;
  lheight: Double;
  lp: Point;
  ltail: string;
  lwidth: Double;
  margin: Double | Point;
  maxiter: Int;
  mclimit: Double;
  mindist: Double;
  minlen: Int;
  mode: string;
  model: string;
  mosek: boolean;
  newrank: boolean;
  nodesep: Double;
  nojustify: boolean;
  normalize: Double | boolean;
  notranslate: boolean;
  nslimit: Double;
  nslimit1: Double;
  ordering: string;
  orientation: string | Double;
  outputorder: OutputMode;
  overlap: string | boolean;
  overlap_scaling: Double;
  overlap_shrink: boolean;
  pack: boolean | Int;
  packmode: PackMode;
  pad: Double | Point;
  page: Double | Point;
  pagedir: Pagedir;
  pencolor: Color;
  penwidth: Double;
  peripheries: Int;
  pin: boolean;
  pos: Point | SplineType;
  quadtree: QuadType | boolean;
  quantum: Double;
  rank: RankType;
  rankdir: Rankdir;
  ranksep: Double | DoubleList;
  ratio: Double | string;
  rects: Rect;
  regular: boolean;
  remincross: boolean;
  repulsiveforce: Double;
  resolution: Double;
  root: string | boolean;
  rotate: Int;
  rotation: Double;
  samehead: string;
  sametail: string;
  samplepoints: Int;
  scale: Double | Point;
  searchsize: Int;
  sep: AddDouble | AddPoint;
  shape: Shape;
  shapefile: string;
  showboxes: Int;
  sides: Int;
  size: Double | Point;
  skew: Double;
  smoothing: SmoothType;
  sortv: Int;
  splines: boolean | string;
  start: Blank | StartType;
  style: Blank | Style;
  stylesheet: string;
  tail_lp: string;
  tailclip: Point;
  tailhref: EscString;
  taillabel: LblString;
  tailport: PortPos;
  tailtarget: EscString;
  tailtooltip: EscString;
  tailURL: EscString;
  target: EscString | string;
  tooltip: EscString;
  truecolor: boolean;
  URL: EscString;
  vertices: PointList;
  viewport: Blank | ViewPort;
  voro_margin: Double;
  weight: Int | Double;
  width: Double;
  xdotversion: string;
  xlabel: LblString;
  xlp: Point;
  z: Blank | Double;
}

/**
 * This type represents an Attribute, which is a key-value mapping of an {@link AttributeKey} to a value.
 *
 * @param T The {@link AttributeKey} to be mapped to a value.
 * @group Attribute
 */
export type Attribute<T extends AttributeKey> = KeyValueMapping[T];
