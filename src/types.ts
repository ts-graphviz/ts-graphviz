import { attribute } from './attribute';

/**
 * Directive indicating which direction the Edge should point.
 */
export type Compass = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw' | 'c' | '_';
export namespace Compass {
  /** Upper part */
  export const n: Compass = 'n';
  /** Upper left */
  export const ne: Compass = 'ne';
  /** Left part */
  export const e: Compass = 'e';
  /** Lower left */
  export const se: Compass = 'se';
  /** Lower part */
  export const s: Compass = 's';
  /** Lower right */
  export const sw: Compass = 'sw';
  /** Right part */
  export const w: Compass = 'w';
  /** Upper right */
  export const nw: Compass = 'nw';
  /** Center */
  export const c: Compass = 'c';

  /** Default */
  export const _: Compass = '_';

  const all: ReadonlyArray<string> = [n, ne, e, se, s, sw, w, nw, c, _];
  /**
   * Determine whether the character string satisfies the Compass condition.
   */
  export function is(str: string): str is Compass {
    return all.includes(str);
  }
}

/**
 * Objects that can be Edge destinations satisfy this interface.
 */
export type NodeRef = INode | IForwardRefNode;

export type NodeRefGroup = NodeRef[];

/**
 * string or an object implementing IEdgeTarget.
 */
export type NodeRefLike = NodeRef | string;

export type NodeRefGroupLike = NodeRefLike[];

export type EdgeTarget = NodeRef | NodeRefGroup;
export type EdgeTargetLike = NodeRefLike | NodeRefGroupLike;

export type EdgeTargetTuple = [from: EdgeTarget, to: EdgeTarget, ...rest: EdgeTarget[]];
export type EdgeTargetLikeTuple = [from: EdgeTargetLike, to: EdgeTargetLike, ...rest: EdgeTargetLike[]];

export interface IHasComment {
  /** Comments to include when outputting with toDot. */
  comment?: string;
}

export interface IHasAttributes<T extends AttributeKey> {
  readonly attributes: IAttributes<T>;
}

/**
 * Catalogue of the schemas/types/grammars expected by {@link https://graphviz.org/doc/info/attrs.html attributes}.
 */
export namespace types {
  /**
   * A double with an optional prefix `'+'`.
   *
   * @see {@link https://graphviz.gitlab.io/docs/attr-types/addDouble/ addDouble}
   */
  export type AddDouble = `+${Double}`;

  /**
   * Double-precision floating point number.
   *
   * @see {@link https://graphviz.gitlab.io/docs/attr-types/double/ double}
   */
  export type Double = number;

  /**
   * Port Position
   *
   * @see {@link https://graphviz.gitlab.io/docs/attr-types/portPos/ portPos}
   */
  export type PortPos = `${string}:${Compass}` | Compass;
  /**
   * A colon-separated list of doubles: `"%f(:%f)*"` where each %f is a double.
   *
   * @see {@link https://graphviz.gitlab.io/docs/attr-types/doubleList/ doubleList}
   */
  export type DoubleList =
    | Double
    | `${Double}:${Double}`
    | `${Double}:${Double}:${Double}`
    | `${Double}:${Double}:${Double}:${Double}`
    | `${Double}:${Double}:${Double}:${Double}:${Double}`
    | `${Double}:${Double}:${Double}:${Double}:${Double}:${Double}`
    | `${Double}:${Double}:${Double}:${Double}:${Double}:${Double}:${Double}`
    | `${Double}:${Double}:${Double}:${Double}:${Double}:${Double}:${Double}:${Double}`
    | `${Double}:${Double}:${Double}:${Double}:${Double}:${Double}:${Double}:${Double}:${Double}`;

  /**
   * Integer number.
   *
   * @see {@link https://graphviz.gitlab.io/docs/attr-types/int/ int}
   */
  export type Int = number;

  /**
   * @see {@link https://graphviz.gitlab.io/docs/attr-types/shape/ shape}
   */
  export type Shape = string;

  /**
   * @see {@link https://graphviz.gitlab.io/docs/attr-types/smoothType/ smoothType}
   */
  export type SmoothType = 'none' | 'avg_dist' | 'graph_dist' | 'power_dist' | 'rng' | 'spring' | 'triangle';

  /**
   * @see {@link https://graphviz.gitlab.io/docs/attr-types/splineType/ splineType}
   */
  export type SplineType = SplineType.spline | string;
  export namespace SplineType {
    export type prefix = endp | startp | `${endp}${startp}` | '';
    export type spline = `${prefix}point ${triple}`;
    export type triple = `${Point} ${Point} ${Point}`;
    export type endp = `e,${Double},${Double} `;
    export type startp = `s,${Double},${Double} `;
  }

  /**
   * @see {@link https://graphviz.gitlab.io/docs/attr-types/startType/ startType}
   */
  export type StartType = `${StartType.style}${StartType.seed}`;
  export namespace StartType {
    export type style = 'regular' | 'self' | 'random';
    export type seed = number;
  }

  /**s
   * @see {@link https://graphviz.gitlab.io/docs/attr-types/style/ style}
   */
  export type Style =
    | Style.styleItem
    | `${Style.styleItem},${Style.styleItem}`
    | `${Style.styleItem},${Style.styleItem},${Style.styleItem}`
    | `${Style.styleItem},${Style.styleItem},${Style.styleItem},${Style.styleItem}`;
  export namespace Style {
    export type styleItem =
      | 'dashed'
      | 'dotted'
      | 'solid'
      | 'invis'
      | 'bold'
      | 'tapered'
      | 'filled'
      | 'striped'
      | 'wedged'
      | 'diagonals'
      | 'rounded'
      | 'filled'
      | 'striped'
      | 'rounded'
      | 'radial';
  }

  /**
   * @see {@link https://graphviz.gitlab.io/docs/attr-types/viewPort/ viewPort}
   */
  export type ViewPort =
    | `${Double},${Double},${Double},${Double},${Double}`
    | `${Double},${Double},${Double},${string}`;

  /**
   * list of strings separated by characters from the layersep attribute (by default, colons, tabs or spaces),
   * defining layer names and implicitly numbered 1,2,…
   *
   * @see {@link https://graphviz.gitlab.io/docs/attr-types/layerList/ layerList}
   */
  export type LayerList = string;

  /**
   * specifies a list of layers defined by the layers attribute.
   *
   * @see {@link https://graphviz.gitlab.io/docs/attr-types/layerRange/ layerRange}
   */
  export type LayerRange = string;

  /**
   * String with Escape Sequences
   *
   * A string allowing escape sequences which are replaced according to the context.
   *
   * For node attributes, the substring `"\N"` is replaced by the name of the node,
   * and the substring `"\G"` by the name of the graph.
   *
   * For graph or cluster attributes, the substring `"\G"` is replaced by the name of the graph or cluster.
   *
   * For edge attributes, the substring `"\E"` is replaced by the name of the edge, the substring `"\G"` is replaced by the name of the graph or cluster,
   * and the substrings `"\T"` and `"\H"` by the names of the tail and head nodes,
   * respectively.
   *
   * The name of an edge is the string formed from the name of the tail node,
   * the appropriate edge operator (`"--"` or `"->"`) and the name of the head node.
   *
   * In all cases, the substring `"\L"` is replaced by the object's label attribute.
   * @see {@link https://graphviz.gitlab.io/docs/attr-types/escString/ escString}
   */
  export type EscString = string;

  /**
   * @see {@link https://graphviz.org/doc/info/shapes.html#html HTML-Like Labels}
   */
  export type HTMLLikeLabel = `<${string}>`;

  /**
   * An escString or an HTML label.
   *
   * @see {@link https://graphviz.gitlab.io/docs/attr-types/lblString/ lblString}
   */
  export type LblString = HTMLLikeLabel | EscString;

  /**
   * `"%f,%f('!')?"` representing the point (x,y).
   *
   * The optional `'!'` indicates the node position should not change (input-only).
   *
   * If dim=3, point may also have the format `"%f,%f,%f('!')?"` to represent the point (x,y,z).
   */
  export type Point = Point.position | `${Point.position}!`;

  export namespace Point {
    export type position =
      | `%${Double},%${Double}`
      | `%${Double},%${Double},%${Double}`
      | `%${Double},%${Double},%${Double},%${Double},%${Double}`
      | `%${Double},%${Double},%${Double},%${Double},%${Double},%${Double}`
      | `%${Double},%${Double},%${Double},%${Double},%${Double},%${Double},%${Double}`
      | `%${Double},%${Double},%${Double},%${Double},%${Double},%${Double},%${Double},%${Double}`
      | `%${Double},%${Double},%${Double},%${Double},%${Double},%${Double},%${Double},%${Double},%${Double}`
      | `%${Double},%${Double},%${Double},%${Double},%${Double},%${Double},%${Double},%${Double},%${Double},%${number}`;
  }

  /**
   * A point with an optional prefix `'+'`.
   *
   * @see {@link https://graphviz.gitlab.io/docs/attr-types/addPoint/ addPoint}
   */
  export type AddPoint = `+${Point}`;

  /**
   * @see {@link https://graphviz.gitlab.io/docs/attr-types/pointList/ pointList}
   */
  export type PointList =
    | Point
    | `${Point} ${Point}`
    | `${Point} ${Point} ${Point}`
    | `${Point} ${Point} ${Point} ${Point}`;

  /**
   * These specify the order in which nodes and edges are drawn in concrete output.
   *
   * - The default `"breadthfirst"` is the simplest, but when the graph layout does not avoid edge-node overlap, this mode will sometimes have edges drawn over nodes and sometimes on top of nodes.
   * - If the mode `"nodesfirst"` is chosen, all nodes are drawn first, followed by the edges. This guarantees an edge-node overlap will not be mistaken for an edge ending at a node.
   * - On the other hand, usually for aesthetic reasons, it may be desirable that all edges appear beneath nodes, even if the resulting drawing is ambiguous. This can be achieved by choosing `"edgesfirst"`.
   *
   * @see {@link https://graphviz.gitlab.io/docs/attr-types/outputMode/ outputMode}
   */
  export type OutputMode = 'breadthfirst' | 'nodesfirst' | 'edgesfirst';

  /**
   * @see {@link https://graphviz.org/docs/attr-types/packMode/ packMode}
   */
  export type PackMode = 'node' | 'clust' | 'graph' | `array${string}`;

  /**
   * Using `"fast"` gives about a 2-4 times overall speedup compared with `"normal"`,
   * though layout quality can suffer a little.
   *
   * @see {@link https://graphviz.gitlab.io/docs/attr-types/quadType/ quadType}
   */
  export type QuadType = 'normal' | 'fast' | 'none';

  /**
   * Rank Direction
   *
   * Corresponding to directed graphs drawn from top to bottom,
   * from left to right, from bottom to top, and from right to left, respectively.
   *
   * @see {@link https://graphviz.gitlab.io/docs/attr-types/rankdir/ rankdir}
   */
  export type Rankdir = 'TB' | 'LR' | 'BT' | 'RL';

  /**
   * @see {@link https://graphviz.gitlab.io/docs/attr-types/rankType/ rankType}
   */
  export type RankType = 'same' | 'min' | 'source' | 'max' | 'sink';

  /**
   * `"%f,%f,%f,%f"`
   *
   * The rectangle `llx,lly,urx,ury` gives the coordinates, in points,
   * of the lower-left corner `(llx,lly)` and the upper-right corner `(urx,ury)`.
   *
   * @see {@link https://graphviz.gitlab.io/docs/attr-types/rect/ rect}
   */
  export type Rect = `${Double},${Double},${Double},${Double}`;

  /**
   * The examples above show a set of commonly used arrow shapes.
   *
   * There is a grammar of arrow shapes which can be used to describe a collection of 3,111,696 arrow
   * combinations of the 42 variations of the primitive set of 11 arrows.
   *
   * @see {@link https://graphviz.org/docs/attr-types/arrowType/ arrowType}
   */
  export type ArrowType = ArrowType.aname | `${ArrowType.aname}${ArrowType.aname}`;

  export namespace ArrowType {
    export type shape =
      | 'box'
      | 'crow'
      | 'curve'
      | 'icurve'
      | 'diamond'
      | 'dot'
      | 'inv'
      | 'none'
      | 'normal'
      | 'tee'
      | 'vee';
    export type side = 'l' | 'r';

    export type modifiers = side | 'o' | `o${side}`;

    export type aname = shape | `${modifiers}${shape}`;
  }

  /**
   * @see {@link https://graphviz.gitlab.io/docs/attr-types/clusterMode/ clusterMode}
   */
  export type ClusterMode = 'local' | 'global' | 'none';

  /**
   * @see {@link https://graphviz.gitlab.io/docs/attr-types/color/ color}
   */
  export type Color = Color.RGB_RGBA | Color.HSV | Color.ColorName | number;
  export namespace Color {
    /**
     * `"#%2x%2x%2x"` Red-Green-Blue (RGB)
     *
     * `"#%2x%2x%2x%2x"` Red-Green-Blue-Alpha (RGBA)
     * @note A type that is too complicated to express in TypeScript.
     */
    export type RGB_RGBA = `#${string}`;

    /**
     * Hue-Saturation-Value (HSV) 0.0 <= H,S,V <= 1.0
     */
    export type HSV = `${number}+${number}+${number}`;

    /**
     * Color names are resolved in the context of a color scheme.
     *
     * Graphviz currently supports the X11 scheme, the SVG scheme, and the Brewer schemes, with X11 being the default.
     * @see {@link https://graphviz.org/doc/info/colors.html Color Names}
     */
    export type ColorName =
      | 'aliceblue'
      | 'antiquewhite'
      | 'antiquewhite1'
      | 'antiquewhite2'
      | 'antiquewhite3'
      | 'antiquewhite4'
      | 'aqua'
      | 'aquamarine'
      | 'aquamarine1'
      | 'aquamarine2'
      | 'aquamarine3'
      | 'aquamarine4'
      | 'azure'
      | 'azure1'
      | 'azure2'
      | 'azure3'
      | 'azure4'
      | 'beige'
      | 'bisque'
      | 'bisque1'
      | 'bisque2'
      | 'bisque3'
      | 'bisque4'
      | 'black'
      | 'blanchedalmond'
      | 'blue'
      | 'blue1'
      | 'blue2'
      | 'blue3'
      | 'blue4'
      | 'blueviolet'
      | 'brown'
      | 'brown1'
      | 'brown2'
      | 'brown3'
      | 'brown4'
      | 'burlywood'
      | 'burlywood1'
      | 'burlywood2'
      | 'burlywood3'
      | 'burlywood4'
      | 'cadetblue'
      | 'cadetblue1'
      | 'cadetblue2'
      | 'cadetblue3'
      | 'cadetblue4'
      | 'chartreuse'
      | 'chartreuse1'
      | 'chartreuse2'
      | 'chartreuse3'
      | 'chartreuse4'
      | 'chocolate'
      | 'chocolate1'
      | 'chocolate2'
      | 'chocolate3'
      | 'chocolate4'
      | 'coral'
      | 'coral1'
      | 'coral2'
      | 'coral3'
      | 'coral4'
      | 'cornflowerblue'
      | 'cornsilk'
      | 'cornsilk1'
      | 'cornsilk2'
      | 'cornsilk3'
      | 'cornsilk4'
      | 'crimson'
      | 'cyan'
      | 'cyan1'
      | 'cyan2'
      | 'cyan3'
      | 'cyan4'
      | 'darkblue'
      | 'darkcyan'
      | 'darkgoldenrod'
      | 'darkgoldenrod1'
      | 'darkgoldenrod2'
      | 'darkgoldenrod3'
      | 'darkgoldenrod4'
      | 'darkgray'
      | 'darkgreen'
      | 'darkgrey'
      | 'darkkhaki'
      | 'darkmagenta'
      | 'darkolivegreen'
      | 'darkolivegreen1'
      | 'darkolivegreen2'
      | 'darkolivegreen3'
      | 'darkolivegreen4'
      | 'darkorange'
      | 'darkorange1'
      | 'darkorange2'
      | 'darkorange3'
      | 'darkorange4'
      | 'darkorchid'
      | 'darkorchid1'
      | 'darkorchid2'
      | 'darkorchid3'
      | 'darkorchid4'
      | 'darkred'
      | 'darksalmon'
      | 'darkseagreen'
      | 'darkseagreen1'
      | 'darkseagreen2'
      | 'darkseagreen3'
      | 'darkseagreen4'
      | 'darkslateblue'
      | 'darkslategray'
      | 'darkslategray1'
      | 'darkslategray2'
      | 'darkslategray3'
      | 'darkslategray4'
      | 'darkslategrey'
      | 'darkturquoise'
      | 'darkviolet'
      | 'deeppink'
      | 'deeppink1'
      | 'deeppink2'
      | 'deeppink3'
      | 'deeppink4'
      | 'deepskyblue'
      | 'deepskyblue1'
      | 'deepskyblue2'
      | 'deepskyblue3'
      | 'deepskyblue4'
      | 'dimgray'
      | 'dimgrey'
      | 'dodgerblue'
      | 'dodgerblue1'
      | 'dodgerblue2'
      | 'dodgerblue3'
      | 'dodgerblue4'
      | 'firebrick'
      | 'firebrick1'
      | 'firebrick2'
      | 'firebrick3'
      | 'firebrick4'
      | 'floralwhite'
      | 'forestgreen'
      | 'fuchsia'
      | 'gainsboro'
      | 'ghostwhite'
      | 'gold'
      | 'gold1'
      | 'gold2'
      | 'gold3'
      | 'gold4'
      | 'goldenrod'
      | 'goldenrod1'
      | 'goldenrod2'
      | 'goldenrod3'
      | 'goldenrod4'
      | 'gray'
      | 'gray0'
      | 'gray1'
      | 'gray10'
      | 'gray100'
      | 'gray11'
      | 'gray12'
      | 'gray13'
      | 'gray14'
      | 'gray15'
      | 'gray16'
      | 'gray17'
      | 'gray18'
      | 'gray19'
      | 'gray2'
      | 'gray20'
      | 'gray21'
      | 'gray22'
      | 'gray23'
      | 'gray24'
      | 'gray25'
      | 'gray26'
      | 'gray27'
      | 'gray28'
      | 'gray29'
      | 'gray3'
      | 'gray30'
      | 'gray31'
      | 'gray32'
      | 'gray33'
      | 'gray34'
      | 'gray35'
      | 'gray36'
      | 'gray37'
      | 'gray38'
      | 'gray39'
      | 'gray4'
      | 'gray40'
      | 'gray41'
      | 'gray42'
      | 'gray43'
      | 'gray44'
      | 'gray45'
      | 'gray46'
      | 'gray47'
      | 'gray48'
      | 'gray49'
      | 'gray5'
      | 'gray50'
      | 'gray51'
      | 'gray52'
      | 'gray53'
      | 'gray54'
      | 'gray55'
      | 'gray56'
      | 'gray57'
      | 'gray58'
      | 'gray59'
      | 'gray6'
      | 'gray60'
      | 'gray61'
      | 'gray62'
      | 'gray63'
      | 'gray64'
      | 'gray65'
      | 'gray66'
      | 'gray67'
      | 'gray68'
      | 'gray69'
      | 'gray7'
      | 'gray70'
      | 'gray71'
      | 'gray72'
      | 'gray73'
      | 'gray74'
      | 'gray75'
      | 'gray76'
      | 'gray77'
      | 'gray78'
      | 'gray79'
      | 'gray8'
      | 'gray80'
      | 'gray81'
      | 'gray82'
      | 'gray83'
      | 'gray84'
      | 'gray85'
      | 'gray86'
      | 'gray87'
      | 'gray88'
      | 'gray89'
      | 'gray9'
      | 'gray90'
      | 'gray91'
      | 'gray92'
      | 'gray93'
      | 'gray94'
      | 'gray95'
      | 'gray96'
      | 'gray97'
      | 'gray98'
      | 'gray99'
      | 'green'
      | 'green1'
      | 'green2'
      | 'green3'
      | 'green4'
      | 'greenyellow'
      | 'grey'
      | 'grey0'
      | 'grey1'
      | 'grey10'
      | 'grey100'
      | 'grey11'
      | 'grey12'
      | 'grey13'
      | 'grey14'
      | 'grey15'
      | 'grey16'
      | 'grey17'
      | 'grey18'
      | 'grey19'
      | 'grey2'
      | 'grey20'
      | 'grey21'
      | 'grey22'
      | 'grey23'
      | 'grey24'
      | 'grey25'
      | 'grey26'
      | 'grey27'
      | 'grey28'
      | 'grey29'
      | 'grey3'
      | 'grey30'
      | 'grey31'
      | 'grey32'
      | 'grey33'
      | 'grey34'
      | 'grey35'
      | 'grey36'
      | 'grey37'
      | 'grey38'
      | 'grey39'
      | 'grey4'
      | 'grey40'
      | 'grey41'
      | 'grey42'
      | 'grey43'
      | 'grey44'
      | 'grey45'
      | 'grey46'
      | 'grey47'
      | 'grey48'
      | 'grey49'
      | 'grey5'
      | 'grey50'
      | 'grey51'
      | 'grey52'
      | 'grey53'
      | 'grey54'
      | 'grey55'
      | 'grey56'
      | 'grey57'
      | 'grey58'
      | 'grey59'
      | 'grey6'
      | 'grey60'
      | 'grey61'
      | 'grey62'
      | 'grey63'
      | 'grey64'
      | 'grey65'
      | 'grey66'
      | 'grey67'
      | 'grey68'
      | 'grey69'
      | 'grey7'
      | 'grey70'
      | 'grey71'
      | 'grey72'
      | 'grey73'
      | 'grey74'
      | 'grey75'
      | 'grey76'
      | 'grey77'
      | 'grey78'
      | 'grey79'
      | 'grey8'
      | 'grey80'
      | 'grey81'
      | 'grey82'
      | 'grey83'
      | 'grey84'
      | 'grey85'
      | 'grey86'
      | 'grey87'
      | 'grey88'
      | 'grey89'
      | 'grey9'
      | 'grey90'
      | 'grey91'
      | 'grey92'
      | 'grey93'
      | 'grey94'
      | 'grey95'
      | 'grey96'
      | 'grey97'
      | 'grey98'
      | 'grey99'
      | 'honeydew'
      | 'honeydew1'
      | 'honeydew2'
      | 'honeydew3'
      | 'honeydew4'
      | 'hotpink'
      | 'hotpink1'
      | 'hotpink2'
      | 'hotpink3'
      | 'hotpink4'
      | 'indianred'
      | 'indianred1'
      | 'indianred2'
      | 'indianred3'
      | 'indianred4'
      | 'indigo'
      | 'invis'
      | 'ivory'
      | 'ivory1'
      | 'ivory2'
      | 'ivory3'
      | 'ivory4'
      | 'khaki'
      | 'khaki1'
      | 'khaki2'
      | 'khaki3'
      | 'khaki4'
      | 'lavender'
      | 'lavenderblush'
      | 'lavenderblush1'
      | 'lavenderblush2'
      | 'lavenderblush3'
      | 'lavenderblush4'
      | 'lawngreen'
      | 'lemonchiffon'
      | 'lemonchiffon1'
      | 'lemonchiffon2'
      | 'lemonchiffon3'
      | 'lemonchiffon4'
      | 'lightblue'
      | 'lightblue1'
      | 'lightblue2'
      | 'lightblue3'
      | 'lightblue4'
      | 'lightcoral'
      | 'lightcyan'
      | 'lightcyan1'
      | 'lightcyan2'
      | 'lightcyan3'
      | 'lightcyan4'
      | 'lightgoldenrod'
      | 'lightgoldenrod1'
      | 'lightgoldenrod2'
      | 'lightgoldenrod3'
      | 'lightgoldenrod4'
      | 'lightgoldenrodyellow'
      | 'lightgray'
      | 'lightgreen'
      | 'lightgrey'
      | 'lightpink'
      | 'lightpink1'
      | 'lightpink2'
      | 'lightpink3'
      | 'lightpink4'
      | 'lightsalmon'
      | 'lightsalmon1'
      | 'lightsalmon2'
      | 'lightsalmon3'
      | 'lightsalmon4'
      | 'lightseagreen'
      | 'lightskyblue'
      | 'lightskyblue1'
      | 'lightskyblue2'
      | 'lightskyblue3'
      | 'lightskyblue4'
      | 'lightslateblue'
      | 'lightslategray'
      | 'lightslategrey'
      | 'lightsteelblue'
      | 'lightsteelblue1'
      | 'lightsteelblue2'
      | 'lightsteelblue3'
      | 'lightsteelblue4'
      | 'lightyellow'
      | 'lightyellow1'
      | 'lightyellow2'
      | 'lightyellow3'
      | 'lightyellow4'
      | 'lime'
      | 'limegreen'
      | 'linen'
      | 'magenta'
      | 'magenta1'
      | 'magenta2'
      | 'magenta3'
      | 'magenta4'
      | 'maroon'
      | 'maroon1'
      | 'maroon2'
      | 'maroon3'
      | 'maroon4'
      | 'mediumaquamarine'
      | 'mediumblue'
      | 'mediumorchid'
      | 'mediumorchid1'
      | 'mediumorchid2'
      | 'mediumorchid3'
      | 'mediumorchid4'
      | 'mediumpurple'
      | 'mediumpurple1'
      | 'mediumpurple2'
      | 'mediumpurple3'
      | 'mediumpurple4'
      | 'mediumseagreen'
      | 'mediumslateblue'
      | 'mediumspringgreen'
      | 'mediumturquoise'
      | 'mediumvioletred'
      | 'midnightblue'
      | 'mintcream'
      | 'mistyrose'
      | 'mistyrose1'
      | 'mistyrose2'
      | 'mistyrose3'
      | 'mistyrose4'
      | 'moccasin'
      | 'navajowhite'
      | 'navajowhite1'
      | 'navajowhite2'
      | 'navajowhite3'
      | 'navajowhite4'
      | 'navy'
      | 'navyblue'
      | 'none'
      | 'oldlace'
      | 'olive'
      | 'olivedrab'
      | 'olivedrab1'
      | 'olivedrab2'
      | 'olivedrab3'
      | 'olivedrab4'
      | 'orange'
      | 'orange1'
      | 'orange2'
      | 'orange3'
      | 'orange4'
      | 'orangered'
      | 'orangered1'
      | 'orangered2'
      | 'orangered3'
      | 'orangered4'
      | 'orchid'
      | 'orchid1'
      | 'orchid2'
      | 'orchid3'
      | 'orchid4'
      | 'palegoldenrod'
      | 'palegreen'
      | 'palegreen1'
      | 'palegreen2'
      | 'palegreen3'
      | 'palegreen4'
      | 'paleturquoise'
      | 'paleturquoise1'
      | 'paleturquoise2'
      | 'paleturquoise3'
      | 'paleturquoise4'
      | 'palevioletred'
      | 'palevioletred1'
      | 'palevioletred2'
      | 'palevioletred3'
      | 'palevioletred4'
      | 'papayawhip'
      | 'peachpuff'
      | 'peachpuff1'
      | 'peachpuff2'
      | 'peachpuff3'
      | 'peachpuff4'
      | 'peru'
      | 'pink'
      | 'pink1'
      | 'pink2'
      | 'pink3'
      | 'pink4'
      | 'plum'
      | 'plum1'
      | 'plum2'
      | 'plum3'
      | 'plum4'
      | 'powderblue'
      | 'purple'
      | 'purple1'
      | 'purple2'
      | 'purple3'
      | 'purple4'
      | 'rebeccapurple'
      | 'red'
      | 'red1'
      | 'red2'
      | 'red3'
      | 'red4'
      | 'rosybrown'
      | 'rosybrown1'
      | 'rosybrown2'
      | 'rosybrown3'
      | 'rosybrown4'
      | 'royalblue'
      | 'royalblue1'
      | 'royalblue2'
      | 'royalblue3'
      | 'royalblue4'
      | 'saddlebrown'
      | 'salmon'
      | 'salmon1'
      | 'salmon2'
      | 'salmon3'
      | 'salmon4'
      | 'sandybrown'
      | 'seagreen'
      | 'seagreen1'
      | 'seagreen2'
      | 'seagreen3'
      | 'seagreen4'
      | 'seashell'
      | 'seashell1'
      | 'seashell2'
      | 'seashell3'
      | 'seashell4'
      | 'sienna'
      | 'sienna1'
      | 'sienna2'
      | 'sienna3'
      | 'sienna4'
      | 'silver'
      | 'skyblue'
      | 'skyblue1'
      | 'skyblue2'
      | 'skyblue3'
      | 'skyblue4'
      | 'slateblue'
      | 'slateblue1'
      | 'slateblue2'
      | 'slateblue3'
      | 'slateblue4'
      | 'slategray'
      | 'slategray1'
      | 'slategray2'
      | 'slategray3'
      | 'slategray4'
      | 'slategrey'
      | 'snow'
      | 'snow1'
      | 'snow2'
      | 'snow3'
      | 'snow4'
      | 'springgreen'
      | 'springgreen1'
      | 'springgreen2'
      | 'springgreen3'
      | 'springgreen4'
      | 'steelblue'
      | 'steelblue1'
      | 'steelblue2'
      | 'steelblue3'
      | 'steelblue4'
      | 'tan'
      | 'tan1'
      | 'tan2'
      | 'tan3'
      | 'tan4'
      | 'teal'
      | 'thistle'
      | 'thistle1'
      | 'thistle2'
      | 'thistle3'
      | 'thistle4'
      | 'tomato'
      | 'tomato1'
      | 'tomato2'
      | 'tomato3'
      | 'tomato4'
      | 'transparent'
      | 'turquoise'
      | 'turquoise1'
      | 'turquoise2'
      | 'turquoise3'
      | 'turquoise4'
      | 'violet'
      | 'violetred'
      | 'violetred1'
      | 'violetred2'
      | 'violetred3'
      | 'violetred4'
      | 'webgray'
      | 'webgreen'
      | 'webgrey'
      | 'webmaroon'
      | 'webpurple'
      | 'wheat'
      | 'wheat1'
      | 'wheat2'
      | 'wheat3'
      | 'wheat4'
      | 'white'
      | 'whitesmoke'
      | 'x11gray'
      | 'x11green'
      | 'x11grey'
      | 'x11maroon'
      | 'x11purple'
      | 'yellow'
      | 'yellow1'
      | 'yellow2'
      | 'yellow3'
      | 'yellow4'
      | 'yellowgreen'
      | 'aliceblue'
      | 'antiquewhite'
      | 'aqua'
      | 'aquamarine'
      | 'azure'
      | 'beige'
      | 'bisque'
      | 'black'
      | 'blanchedalmond'
      | 'blue'
      | 'blueviolet'
      | 'brown'
      | 'burlywood'
      | 'cadetblue'
      | 'chartreuse'
      | 'chocolate'
      | 'coral'
      | 'cornflowerblue'
      | 'cornsilk'
      | 'crimson'
      | 'cyan'
      | 'darkblue'
      | 'darkcyan'
      | 'darkgoldenrod'
      | 'darkgray'
      | 'darkgreen'
      | 'darkgrey'
      | 'darkkhaki'
      | 'darkmagenta'
      | 'darkolivegreen'
      | 'darkorange'
      | 'darkorchid'
      | 'darkred'
      | 'darksalmon'
      | 'darkseagreen'
      | 'darkslateblue'
      | 'darkslategray'
      | 'darkslategrey'
      | 'darkturquoise'
      | 'darkviolet'
      | 'deeppink'
      | 'deepskyblue'
      | 'dimgray'
      | 'dimgrey'
      | 'dodgerblue'
      | 'firebrick'
      | 'floralwhite'
      | 'forestgreen'
      | 'fuchsia'
      | 'gainsboro'
      | 'ghostwhite'
      | 'gold'
      | 'goldenrod'
      | 'gray'
      | 'grey'
      | 'green'
      | 'greenyellow'
      | 'honeydew'
      | 'hotpink'
      | 'indianred'
      | 'indigo'
      | 'ivory'
      | 'khaki'
      | 'lavender'
      | 'lavenderblush'
      | 'lawngreen'
      | 'lemonchiffon'
      | 'lightblue'
      | 'lightcoral'
      | 'lightcyan'
      | 'lightgoldenrodyellow'
      | 'lightgray'
      | 'lightgreen'
      | 'lightgrey'
      | 'lightpink'
      | 'lightsalmon'
      | 'lightseagreen'
      | 'lightskyblue'
      | 'lightslategray'
      | 'lightslategrey'
      | 'lightsteelblue'
      | 'lightyellow'
      | 'lime'
      | 'limegreen'
      | 'linen'
      | 'magenta'
      | 'maroon'
      | 'mediumaquamarine'
      | 'mediumblue'
      | 'mediumorchid'
      | 'mediumpurple'
      | 'mediumseagreen'
      | 'mediumslateblue'
      | 'mediumspringgreen'
      | 'mediumturquoise'
      | 'mediumvioletred'
      | 'midnightblue'
      | 'mintcream'
      | 'mistyrose'
      | 'moccasin'
      | 'navajowhite'
      | 'navy'
      | 'oldlace'
      | 'olive'
      | 'olivedrab'
      | 'orange'
      | 'orangered'
      | 'orchid'
      | 'palegoldenrod'
      | 'palegreen'
      | 'paleturquoise'
      | 'palevioletred'
      | 'papayawhip'
      | 'peachpuff'
      | 'peru'
      | 'pink'
      | 'plum'
      | 'powderblue'
      | 'purple'
      | 'red'
      | 'rosybrown'
      | 'royalblue'
      | 'saddlebrown'
      | 'salmon'
      | 'sandybrown'
      | 'seagreen'
      | 'seashell'
      | 'sienna'
      | 'silver'
      | 'skyblue'
      | 'slateblue'
      | 'slategray'
      | 'slategrey'
      | 'snow'
      | 'springgreen'
      | 'steelblue'
      | 'tan'
      | 'teal'
      | 'thistle'
      | 'tomato'
      | 'turquoise'
      | 'violet'
      | 'wheat'
      | 'white'
      | 'whitesmoke'
      | 'yellow'
      | 'yellowgreen';
  }

  /**
   * A colon-separated list of weighted color values: WC(:WC)* where each WC has the form C(;F)? with C a color value and the optional F a floating-point number, 0 ≤ F ≤ 1.
   *
   * The sum of the floating-point numbers in a colorList must sum to at most 1.
   *
   * @note A type that is too complicated to express in TypeScript.
   *
   * @see {@link https://graphviz.gitlab.io/docs/attr-types/colorList/}
   */
  export type ColorList = string;

  /**
   * Direction Type
   *
   * @see {@link https://graphviz.gitlab.io/docs/attr-types/dirType/ dirType}
   */
  export type DirType = 'forward' | 'back' | 'both' | 'none';

  /**
   * Page Direction
   *
   * @see {@link https://graphviz.org/docs/attr-types/pagedir/ pagedir}
   */
  export type Pagedir = `${Pagedir.TB}${Pagedir.RL}`;
  export namespace Pagedir {
    export type TB = 'T' | 'B';
    export type RL = 'R' | 'L';
  }
}

interface AttributeValueMapping {
  [attribute._background]: string;
  [attribute.area]: types.Double;
  [attribute.arrowhead]: types.ArrowType;
  [attribute.arrowsize]: types.Double;
  [attribute.arrowtail]: types.ArrowType;
  [attribute.bb]: types.Rect;
  [attribute.bgcolor]: types.Color | types.ColorList;
  [attribute.center]: boolean;
  [attribute.charset]: string;
  [attribute._class]: string;
  [attribute.clusterrank]: types.ClusterMode;
  [attribute.color]: types.Color | types.ColorList;
  [attribute.colorscheme]: string;
  [attribute.comment]: string;
  [attribute.compound]: boolean;
  [attribute.concentrate]: boolean;
  [attribute.constraint]: boolean;
  [attribute.Damping]: types.Double;
  [attribute.decorate]: boolean;
  [attribute.defaultdist]: types.Double;
  [attribute.dim]: types.Int;
  [attribute.dimen]: types.Int;
  [attribute.dir]: types.DirType;
  [attribute.diredgeconstraints]: string | boolean;
  [attribute.distortion]: types.Double;
  [attribute.dpi]: types.Double;
  [attribute.edgehref]: types.EscString;
  [attribute.edgetarget]: types.EscString;
  [attribute.edgetooltip]: types.EscString;
  [attribute.edgeURL]: types.EscString;
  [attribute.epsilon]: types.Double;
  [attribute.esep]: types.AddDouble | types.AddPoint;
  [attribute.fillcolor]: types.Color | types.ColorList;
  [attribute.fixedsize]: boolean | string;
  [attribute.fontcolor]: types.Color;
  [attribute.fontname]: string;
  [attribute.fontnames]: string;
  [attribute.fontpath]: string;
  [attribute.fontsize]: types.Double;
  [attribute.forcelabels]: boolean;
  [attribute.gradientangle]: types.Int;
  [attribute.group]: string;
  [attribute.head_lp]: types.Point;
  [attribute.headclip]: boolean;
  [attribute.headhref]: types.EscString;
  [attribute.headlabel]: types.LblString;
  [attribute.headport]: types.PortPos;
  [attribute.headtarget]: types.EscString;
  [attribute.headtooltip]: types.EscString;
  [attribute.headURL]: types.EscString;
  [attribute.height]: types.Double;
  [attribute.href]: types.EscString;
  [attribute.id]: types.EscString;
  [attribute.image]: string;
  [attribute.imagepath]: string;
  [attribute.imagepos]: string;
  [attribute.imagescale]: string | boolean;
  [attribute.inputscale]: types.Double;
  [attribute.K]: types.Double;
  [attribute.label]: types.LblString;
  [attribute.label_scheme]: types.Int;
  [attribute.labelangle]: types.Double;
  [attribute.labeldistance]: types.Double;
  [attribute.labelfloat]: boolean;
  [attribute.labelfontcolor]: types.Color;
  [attribute.labelfontname]: string;
  [attribute.labelfontsize]: types.Double;
  [attribute.labelhref]: types.EscString;
  [attribute.labeljust]: string;
  [attribute.labelloc]: string;
  [attribute.labeltarget]: types.EscString;
  [attribute.labeltooltip]: types.EscString;
  [attribute.labelURL]: types.EscString;
  [attribute.landscape]: boolean;
  [attribute.layer]: types.LayerRange;
  [attribute.layerlistsep]: string;
  [attribute.layers]: types.LayerList;
  [attribute.layerselect]: types.LayerRange;
  [attribute.layersep]: string;
  [attribute.layout]: string;
  [attribute.len]: types.Double;
  [attribute.levels]: types.Int;
  [attribute.levelsgap]: types.Double;
  [attribute.lhead]: string;
  [attribute.lheight]: types.Double;
  [attribute.lp]: types.Point;
  [attribute.ltail]: string;
  [attribute.lwidth]: types.Double;
  [attribute.margin]: types.Double | types.Point;
  [attribute.maxiter]: types.Int;
  [attribute.mclimit]: types.Double;
  [attribute.mindist]: types.Double;
  [attribute.minlen]: types.Int;
  [attribute.mode]: string;
  [attribute.model]: string;
  [attribute.mosek]: boolean;
  [attribute.newrank]: boolean;
  [attribute.nodesep]: types.Double;
  [attribute.nojustify]: boolean;
  [attribute.normalize]: types.Double | boolean;
  [attribute.notranslate]: boolean;
  [attribute.nslimit]: types.Double;
  [attribute.nslimit1]: types.Double;
  [attribute.ordering]: string;
  [attribute.orientation]: string | types.Double;
  [attribute.outputorder]: types.OutputMode;
  [attribute.overlap]: string | boolean;
  [attribute.overlap_scaling]: types.Double;
  [attribute.overlap_shrink]: boolean;
  [attribute.pack]: boolean | types.Int;
  [attribute.packmode]: types.PackMode;
  [attribute.pad]: types.Double | types.Point;
  [attribute.page]: types.Double | types.Point;
  [attribute.pagedir]: types.Pagedir;
  [attribute.pencolor]: types.Color;
  [attribute.penwidth]: types.Double;
  [attribute.peripheries]: types.Int;
  [attribute.pin]: boolean;
  [attribute.pos]: types.Point | types.SplineType;
  [attribute.quadtree]: types.QuadType | boolean;
  [attribute.quantum]: types.Double;
  [attribute.rank]: types.RankType;
  [attribute.rankdir]: types.Rankdir;
  [attribute.ranksep]: types.Double | types.DoubleList;
  [attribute.ratio]: types.Double | string;
  [attribute.rects]: types.Rect;
  [attribute.regular]: boolean;
  [attribute.remincross]: boolean;
  [attribute.repulsiveforce]: types.Double;
  [attribute.resolution]: types.Double;
  [attribute.root]: string | boolean;
  [attribute.rotate]: types.Int;
  [attribute.rotation]: types.Double;
  [attribute.samehead]: string;
  [attribute.sametail]: string;
  [attribute.samplepoints]: types.Int;
  [attribute.scale]: types.Double | types.Point;
  [attribute.searchsize]: types.Int;
  [attribute.sep]: types.AddDouble | types.AddPoint;
  [attribute.shape]: types.Shape;
  [attribute.shapefile]: string;
  [attribute.showboxes]: types.Int;
  [attribute.sides]: types.Int;
  [attribute.size]: types.Double | types.Point;
  [attribute.skew]: types.Double;
  [attribute.smoothing]: types.SmoothType;
  [attribute.sortv]: types.Int;
  [attribute.splines]: boolean | string;
  [attribute.start]: types.StartType;
  [attribute.style]: types.Style;
  [attribute.stylesheet]: string;
  [attribute.tail_lp]: string;
  [attribute.tailclip]: types.Point;
  [attribute.tailclip]: types.Point;
  [attribute.tailhref]: types.EscString;
  [attribute.taillabel]: types.LblString;
  [attribute.tailport]: types.PortPos;
  [attribute.tailtarget]: types.EscString;
  [attribute.tailtooltip]: types.EscString;
  [attribute.tailURL]: types.EscString;
  [attribute.target]: types.EscString | string;
  [attribute.tooltip]: types.EscString;
  [attribute.truecolor]: boolean;
  [attribute.URL]: types.EscString;
  [attribute.vertices]: types.PointList;
  [attribute.viewport]: types.ViewPort;
  [attribute.voro_margin]: types.Double;
  [attribute.weight]: types.Int | types.Double;
  [attribute.width]: types.Double;
  [attribute.xdotversion]: string;
  [attribute.xlabel]: types.LblString;
  [attribute.xlp]: types.Point;
  [attribute.z]: types.Double;
}

export type AttributeKey = keyof AttributeValueMapping;

export type Attribute<T extends AttributeKey> = AttributeValueMapping[T];

/**
 * An AttributesValue is one of the following:
 * - Any string of alphabetic ([a-zA-Z\200-\377]) characters, underscores ('_') or digits ([0-9]), not beginning with a digit;
 * - a numeral [-]?(.[0-9]+ | [0-9]+(.[0-9]*)? );
 * - any double-quoted string ("...") possibly containing escaped quotes (\")1;
 * - an HTML Like string (<...>).
 */
export type AttributesValue = Attribute<AttributeKey>;

export type AttributesObject<T extends AttributeKey> = {
  [key in T]?: Attribute<key>;
};

export type AttributesEntities<T extends AttributeKey> = readonly [T, AttributesValue][];

export type EdgeAttributes = AttributesObject<attribute.Edge>;
export type NodeAttributes = AttributesObject<attribute.Node>;
export type RootClusterAttributes = AttributesObject<attribute.RootCluster>;
export type ClusterSubgraphAttributes = AttributesObject<attribute.ClusterSubgraph | attribute.Subgraph>;

export interface IAttributesBase<T extends AttributeKey> {
  readonly size: number;
  readonly values: ReadonlyArray<[T, AttributesValue]>;
  get(key: T): AttributesValue | undefined;
  set(key: T, value: AttributesValue): void;
  apply(attributes: AttributesObject<T> | AttributesEntities<T>): void;
  delete(key: T): void;
  clear(): void;
}

export interface IAttributes<T extends AttributeKey = AttributeKey> extends IAttributesBase<T>, IHasComment {}

export interface IPort {
  port: string;
  compass: Compass;
}

export interface IForwardRefNode extends Partial<IPort> {
  readonly id: string;
}

export interface INode extends IHasComment, IHasAttributes<attribute.Node> {
  readonly id: string;
  port(port: string | Partial<IPort>): IForwardRefNode;
}

export interface IEdge extends IHasComment, IHasAttributes<attribute.Edge> {
  readonly targets: EdgeTargetTuple;
}

/**
 * Cluster common attribute interface.
 *
 * @hidden
 */
export interface IClusterCommonAttributes {
  /** Manage common attributes of graphs in a cluster. */
  graph: IAttributes<attribute.Subgraph | attribute.ClusterSubgraph>;
  /** Manage common attributes of edges in a cluster. */
  edge: IAttributes<attribute.Edge>;
  /** Manage common attributes of nodes in a cluster. */
  node: IAttributes<attribute.Node>;
}

export interface ICluster<T extends AttributeKey = AttributeKey> extends IHasComment, IAttributesBase<T> {
  readonly id?: string;
  readonly attributes: Readonly<IClusterCommonAttributes>;
  readonly nodes: ReadonlyArray<INode>;
  readonly edges: ReadonlyArray<IEdge>;
  readonly subgraphs: ReadonlyArray<ISubgraph>;
  /**
   * Add a Node to the cluster.
   */
  addNode(node: INode): void;
  /**
   * Add Edge to the cluster.
   */
  addEdge(edge: IEdge): void;
  /**
   * Add a Subgraph to the cluster.
   */
  addSubgraph(subgraph: ISubgraph): void;
  /**
   * Check if the Node exists in the cluster.
   */
  existNode(nodeId: string): boolean;
  /**
   * Check if the Edge exists in the cluster.
   */
  existEdge(edge: IEdge): boolean;
  /**
   * Check if the Subgraph exists in the cluster.
   */
  existSubgraph(subgraph: ISubgraph): boolean;
  /**
   * Remove Node from the cluster.
   */
  removeNode(node: INode | string): void;
  /**
   * Remove Edge from the cluster.
   */
  removeEdge(edge: IEdge): void;
  /**
   * Remove Subgraph from the cluster.
   */
  removeSubgraph(subgraph: ISubgraph): void;
  /**
   * Create a Node in the cluster.
   */
  createNode(id: string, attributes?: NodeAttributes): INode;
  /**
   * Create a Subgraph and add it to the cluster.
   */
  createSubgraph(id?: string, attributes?: ClusterSubgraphAttributes): ISubgraph;
  createSubgraph(attributes?: ClusterSubgraphAttributes): ISubgraph;
  /**
   * Get Subgraph in cluster by specifying id.
   *
   * If there is no Subgraph with the specified id in the cluster, return undefined.
   */
  getSubgraph(id: string): ISubgraph | undefined;

  /**
   * Get Node in cluster by specifying id.
   *
   * @description
   * If there is no Node with the specified id in the cluster, return undefined.
   */
  getNode(id: string): INode | undefined;
  /** Create Edge and add it to the cluster. */
  createEdge(targets: EdgeTargetLikeTuple, attributes?: EdgeAttributes): IEdge;

  /**
   * Create a subgraph by specifying its id (or get it if it already exists).
   *
   * By specifying a callback function, the target subgraph can be received and manipulated as an argument.
   *
   * ```ts
   * const G = digraph('G', (g) => {
   *   // Create a cluster with id as A.
   *   g.subgraph('A', (A) => {
   *     // Create a node with id as A1 in cluster A.
   *     A.node('A1');
   *   });
   * });
   *
   * console.log(toDot(G));
   * // digraph "G" {
   * //   subgraph "A" {
   * //     "A1";
   * //   }
   * // }
   * ```
   *
   * @param id Subgraph ID.
   * @param callback Callbacks for manipulating created or retrieved subgraph.
   */
  subgraph(id: string, callback?: (subgraph: ISubgraph) => void): ISubgraph;
  /**
   * Create a subgraph (or get one if it already exists) and adapt the attributes.
   *
   * By specifying a callback function, the target subgraph can be received and manipulated as an argument.
   *
   * ```ts
   * const G = digraph('G', (g) => {
   *   // Create a cluster with id as A and specifying its attributes.
   *   g.subgraph('A', { [attribute.color]: 'red', [attribute.label]: 'my label' }, (A) => {
   *     // Create a node with id as A1 in cluster A.
   *     A.node('A1');
   *   });
   * });
   *
   * console.log(toDot(G));
   * // digraph "G" {
   * //   subgraph "A" {
   * //     color = "red";
   * //     label = "my label";
   * //     "A1";
   * //   }
   * // }
   * ```
   *
   * @param id  Subgraph ID.
   * @param attributes Object of attributes to be adapted to the subgraph.
   * @param callback Callbacks for manipulating created or retrieved subgraph.
   */
  subgraph(id: string, attributes: ClusterSubgraphAttributes, callback?: (subgraph: ISubgraph) => void): ISubgraph;
  /**
   * Create anonymous subgraphs and and adapt the attributes.
   *
   * By specifying a callback function, the target subgraph can be received and manipulated as an argument.
   *
   * ```ts
   * const G = digraph('G', (g) => {
   *   // Create a anonymous cluster and specifying its attributes.
   *   g.subgraph({ [attribute.color]: 'red', [attribute.label]: 'my label' }, (A) => {
   *     // Create a node with id as A1 in anonymous cluster.
   *     A.node('A1');
   *   });
   * });
   *
   * console.log(toDot(G));
   * // digraph "G" {
   * //   subgraph {
   * //     color = "red";
   * //     label = "my label";
   * //     "A1";
   * //   }
   * // }
   * ```
   *
   * @param attributes Object of attributes to be adapted to the subgraph.
   * @param callback Callbacks for manipulating created or retrieved subgraph.
   */
  subgraph(attributes: ClusterSubgraphAttributes, callback?: (subgraph: ISubgraph) => void): ISubgraph;
  /**
   * Create anonymous subgraphs and manipulate them with callback functions.
   *
   * By specifying a callback function, the target subgraph can be received and manipulated as an argument.
   *
   * @param callback Callbacks for manipulating created or retrieved subgraph.
   */
  subgraph(callback?: (subgraph: ISubgraph) => void): ISubgraph;

  /**
   * Create a node by specifying its id (or get it if it already exists).
   *
   * By specifying a callback function, the target node can be received and manipulated as an argument.
   *
   * ```ts
   * const G = digraph('G', (g) => {
   *   // Create a node with id as A.
   *   g.node('A');
   * });
   *
   * console.log(toDot(G));
   * // digraph "G" {
   * //   "A";
   * // }
   * ```
   *
   * @param id Node ID.
   * @param callback Callbacks for manipulating created or retrieved node.
   */
  node(id: string, callback?: (node: INode) => void): INode;
  /**
   * Create a node (or get one if it already exists) and adapt the attributes.
   *
   * By specifying a callback function, the target node can be received and manipulated as an argument.
   *
   * ```ts
   * const G = digraph('G', (g) => {
   *   // Create a node by specifying its id and specifying its attributes.
   *   g.node('A', {
   *     [attribute.color]: 'red',
   *     [attribute.label]: 'my label',
   *   });
   * });
   *
   * console.log(toDot(G));
   * // digraph "G" {
   * //   "A" [
   * //     color = "red",
   * //     label = "my label",
   * //   ];
   * // }
   * ```
   *
   * @param id Node ID.
   * @param attributes Object of attributes to be adapted to the node.
   * @param callback Callbacks for manipulating created or retrieved node.
   */
  node(id: string, attributes: NodeAttributes, callback?: (node: INode) => void): INode;
  /**
   * Set a common attribute for the nodes in the cluster.
   *
   * ```ts
   * const G = digraph('G', (g) => {
   *   // Set a common attribute for the nodes in the cluster.
   *   g.node({
   *     [attribute.color]: 'red',
   *     [attribute.label]: 'my label',
   *   });
   * });
   *
   * console.log(toDot(G));
   * // digraph "G" {
   * //   node [
   * //     color = "red",
   * //     label = "my label",
   * //   ];
   * // }
   * ```
   *
   * @param attributes Object of attributes to be adapted to the nodes.
   */
  node(attributes: NodeAttributes): void;
  /**
   * Create a edge.
   *
   * By specifying a callback function, the target edge can be received and manipulated as an argument.
   *
   * ```ts
   * const G = digraph('G', (g) => {
   *   // Create a edge.
   *   g.edge(['a', 'b']);
   * });
   *
   * console.log(toDot(G));
   * // digraph "G" {
   * //   "a" -> "b";
   * // }
   * ```
   * @param targets Nodes.
   * @param callback Callbacks for manipulating created or retrieved edge.
   */
  edge(targets: EdgeTargetLikeTuple, callback?: (edge: IEdge) => void): IEdge;
  /**
   * Create a edge and adapt the attributes.
   *
   * By specifying a callback function, the target edge can be received and manipulated as an argument.
   *
   * ```ts
   * const G = digraph('G', (g) => {
   *   // Create a edge and specifying its attributes.
   *   g.edge(['a', 'b'], {
   *     [attribute.color]: 'red',
   *     [attribute.label]: 'my label',
   *   });
   * });
   *
   * console.log(toDot(G));
   * // digraph "G" {
   * //   "a" -> "b" [
   * //     color = "red",
   * //     label = "my label",
   * //   ];
   * // }
   * ```
   *
   * @param id Node ID.
   * @param attributes Object of attributes to be adapted to the edge.
   * @param callback Callbacks for manipulating created or retrieved edge.
   */
  edge(targets: EdgeTargetLikeTuple, attributes: EdgeAttributes, callback?: (edge: IEdge) => void): IEdge;
  /**
   * Set a common attribute for the edges in the cluster.
   *
   *
   * ```ts
   * const G = digraph('G', (g) => {
   *   // Set a common attribute for the edges in the cluster.
   *   g.edge({
   *     [attribute.color]: 'red',
   *     [attribute.label]: 'my label',
   *   });
   * });
   *
   * console.log(toDot(G));
   * // digraph "G" {
   * //   edge [
   * //     color = "red",
   * //     label = "my label",
   * //   ];
   * // }
   * ```
   * @param attributes Object of attributes to be adapted to the edges.
   */
  edge(attributes: EdgeAttributes): void;

  /**
   * Set a common attribute for the clusters in the cluster.
   *
   * ```ts
   * const G = digraph('G', (g) => {
   *   g.graph({
   *     [attribute.color]: 'red',
   *     [attribute.label]: 'my label',
   *   });
   * });
   *
   * console.log(toDot(G));
   * // digraph "G" {
   * //   graph [
   * //     color = "red",
   * //     label = "my label",
   * //   ];
   * // }
   * ```
   * @param attributes Object of attributes to be adapted to the clusters.
   */
  graph(attributes: ClusterSubgraphAttributes): void;
}

export interface ISubgraph extends ICluster<attribute.Subgraph | attribute.ClusterSubgraph> {
  isSubgraphCluster(): boolean;
}

export interface IRootCluster extends ICluster<attribute.RootCluster> {
  /**
   * Strict mode.
   *
   * @description
   * A graph may also be described as strict.
   * This forbids the creation of multi-edges, i.e., there can be at most one edge with a given tail node and head node in the directed case.
   * For undirected graphs, there can be at most one edge connected to the same two nodes.
   * Subsequent edge statements using the same two nodes will identify the edge with the previously defined one and apply any attributes given in the edge statement.
   */
  strict: boolean;
}

export type Dot = IRootCluster | ISubgraph | IEdge | INode | IAttributes | AttributesValue;
