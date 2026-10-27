import type {
  AddDouble,
  AddPoint,
  ArrowType,
  Blank,
  ClusterMode,
  Color,
  ColorList,
  Compass,
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
  QuadType,
  Rankdir,
  RankType,
  Rect,
  Shape,
  SmoothType,
  SplineType,
  StartType,
  Style,
  TBbalanceType,
  ViewPort,
} from './types.js';

/**
 * The value types that a {@link Schema} can extend or override (its `types`),
 * by name, with their built-in types.
 *
 * Changing one changes every attribute that uses it
 * ({@link AttributeValueTypeNames} says which). A name stands for the words
 * Graphviz builds the value from where there is such a list:
 *
 * - `style`: one style item; a `style` value is a comma-separated list of
 *   items, so `values.extend<'my-style'>()` also allows `'filled,my-style'`;
 * - `arrowType`: one arrow shape; modifiers (`o`, `l`, `r`) and pairs of
 *   shapes are built from it, as for the built-in shapes;
 * - `compass`: one compass point; ports (`headport`, `tailport`) are built
 *   from it.
 *
 * @group Attribute
 */
export interface ValueTypes {
  arrowType: ArrowType.shape;
  clusterMode: ClusterMode;
  color: Color;
  compass: Compass;
  dirType: DirType;
  outputMode: OutputMode;
  packMode: PackMode;
  pagedir: Pagedir;
  quadType: QuadType;
  rankdir: Rankdir;
  rankType: RankType;
  shape: Shape;
  smoothType: SmoothType;
  startType: StartType;
  style: Style.styleItem;
  tbBalanceType: TBbalanceType;
}

/**
 * The name of a value type that a {@link Schema} can change.
 * @group Attribute
 */
export type ValueTypeName = keyof ValueTypes;

/**
 * The `style` values built from the style items `I`, as {@link Style} is
 * built from the built-in ones.
 * @group Attribute
 */
export type StyleOf<I extends string> =
  | I
  | `${I},${I}`
  | `${I},${I},${I}`
  | `${I},${I},${I},${I}`;

/**
 * The arrow types built from the arrow shapes `S`, as {@link ArrowType} is
 * built from the built-in ones.
 * @group Attribute
 */
export type ArrowTypeOf<S extends string> =
  | ArrowNameOf<S>
  | `${ArrowNameOf<S>}${ArrowNameOf<S>}`;

type ArrowNameOf<S extends string> = S | `${ArrowType.modifiers}${S}`;

/**
 * The port positions built from the compass points `C`, as
 * {@link PortPos} is built from the built-in ones.
 * @group Attribute
 */
export type PortPosOf<C extends string> = `${string}:${C}` | C;

/**
 * Every value type by type name (the names in
 * {@link AttributeValueTypeNames}), with the changeable ones taken from `V`.
 * With the default `V` it gives the built-in value types, so
 * `AttributeValueTypes[AttributeValueTypeNames[K]]` is `Attribute<K>`.
 * @group Attribute
 */
export interface AttributeValueTypes<
  V extends Record<ValueTypeName, unknown> = ValueTypes,
> {
  addDouble: AddDouble;
  addPoint: AddPoint;
  arrowType: ArrowTypeOf<V['arrowType'] & string>;
  blank: Blank;
  bool: boolean;
  clusterMode: V['clusterMode'];
  color: V['color'];
  colorList: ColorList;
  dirType: V['dirType'];
  double: Double;
  doubleList: DoubleList;
  escString: EscString;
  int: Int;
  layerList: LayerList;
  layerRange: LayerRange;
  lblString: LblString;
  outputMode: V['outputMode'];
  packMode: V['packMode'];
  pagedir: V['pagedir'];
  point: Point;
  pointList: PointList;
  portPos: PortPosOf<V['compass'] & string>;
  quadType: V['quadType'];
  rankdir: V['rankdir'];
  rankType: V['rankType'];
  rect: Rect;
  shape: V['shape'];
  smoothType: V['smoothType'];
  splineType: SplineType;
  startType: V['startType'];
  string: string;
  style: StyleOf<V['style'] & string>;
  tbBalanceType: V['tbBalanceType'];
  viewPort: ViewPort;
  xdot: string;
}

/**
 * The type names in {@link AttributeValueTypes} whose types change when the
 * value types `N` (names of {@link ValueTypes}) change.
 * @group Attribute
 */
export type ValueTypeNamesUsing<N extends ValueTypeName> =
  | N
  | ('compass' extends N ? 'portPos' : never);
