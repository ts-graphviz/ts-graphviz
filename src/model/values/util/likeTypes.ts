import {
  ArrowTypeValue,
  AspectTypeValue,
  BoolValue,
  ClusterModeValue,
  ColorValue,
  DirTypeValue,
  DoubleValue,
  EscStringValue,
  IntValue,
  LayerListValue,
  LayerRangeValue,
  LblStringValue,
  OutputModeValue,
  PackModeValue,
  PagedirValue,
  PointfListValue,
  PointfValue,
  PointValue,
  PortPosValue,
  QuadTypeValue,
  RankdirValue,
  RankTypeValue,
  RectValue,
  ShapeValue,
  SmoothTypeValue,
  StartTypeValue,
  StringValue,
  StyleValue,
  ViewPortValue,
} from '..';

/**
 * @category Value Like
 */
export type DampingLike = DoubleValue | number;
/**
 * @category Value Like
 */
export type KLike = DoubleValue | number;
/**
 * @category Value Like
 */
export type UrlLike = EscStringValue | string;
/**
 * @category Value Like
 */
export type AreaLike = DoubleValue | number;

/**
 * @category Static Value
 */
export type ArrowType =
  | 'normal'
  | 'inv'
  | 'dot'
  | 'invdot'
  | 'odot'
  | 'invodot'
  | 'none'
  | 'tee'
  | 'empty'
  | 'invempty'
  | 'diamond'
  | 'odiamond'
  | 'ediamond'
  | 'crow'
  | 'box'
  | 'obox'
  | 'open'
  | 'halfopen'
  | 'vee';
/**
 * @category Value Like
 */
export type ArrowheadLike = ArrowTypeValue | ArrowType | string;
/**
 * @category Value Like
 */
export type ArrowsizeLike = DoubleValue | number;
/**
 * @category Value Like
 */
export type ArrowtailLike = ArrowTypeValue | ArrowType | string;
/**
 * @category Value Like
 */
export type AspectLike = AspectTypeValue;
/**
 * @category Value Like
 */
export type BbLike = RectValue | string;
/**
 * @category Value Like
 */
export type BgcolorLike = ColorValue | string;
/**
 * @category Value Like
 */
export type CenterLike = BoolValue | boolean;
/**
 * @category Value Like
 */
export type CharsetLike = StringValue | string;
/**
 * @category Static Value
 */
export type Clusterrank = 'local' | 'global' | 'none';
/**
 * @category Value Like
 */
export type ClusterrankLike = ClusterModeValue | Clusterrank | string;
/**
 * @category Value Like
 */
export type ColorLike = ColorValue | string;
/**
 * @category Value Like
 */
export type ColorschemeLike = StringValue | string;
/**
 * @category Value Like
 */
export type CommentLike = StringValue | string;
/**
 * @category Value Like
 */
export type CompoundLike = BoolValue | boolean;
/**
 * @category Value Like
 */
export type ConcentrateLike = BoolValue | boolean;
/**
 * @category Value Like
 */
export type ConstraintLike = BoolValue | boolean;
/**
 * @category Value Like
 */
export type DecorateLike = BoolValue | boolean;
/**
 * @category Value Like
 */
export type DefaultdistLike = DoubleValue | number;
/**
 * @category Value Like
 */
export type DimLike = IntValue | number;
/**
 * @category Value Like
 */
export type DimenLike = IntValue | number;
/**
 * @category Static Value
 */
export type DirType = 'forward' | 'back' | 'both' | 'none';
/**
 * @category Value Like
 */
export type DirLike = DirTypeValue | DirType | string;
/**
 * @category Value Like
 */
export type DiredgeconstraintsLike = StringValue | string;
/**
 * @category Value Like
 */
export type DistortionLike = DoubleValue | number;
/**
 * @category Value Like
 */
export type DpiLike = DoubleValue | number;
/**
 * @category Value Like
 */
export type EdgeUrlLike = EscStringValue | string;
/**
 * @category Value Like
 */
export type EdgehrefLike = EscStringValue | string;
/**
 * @category Value Like
 */
export type EdgetargetLike = EscStringValue | string;
/**
 * @category Value Like
 */
export type EdgetooltipLike = EscStringValue | string;
/**
 * @category Value Like
 */
export type EpsilonLike = DoubleValue | number;
/**
 * @category Value Like
 */
export type EsepLike = DoubleValue | number;
/**
 * @category Value Like
 */
export type FillcolorLike = ColorValue | string;
/**
 * @category Value Like
 */
export type FixedsizeLike = BoolValue | boolean;
/**
 * @category Value Like
 */
export type FontcolorLike = ColorValue | string;
/**
 * @category Value Like
 */
export type FontnameLike = StringValue | string;
/**
 * @category Value Like
 */
export type FontnamesLike = StringValue | string;
/**
 * @category Value Like
 */
export type FontpathLike = StringValue | string;
/**
 * @category Value Like
 */
export type FontsizeLike = DoubleValue | number;
/**
 * @category Value Like
 */
export type GroupLike = StringValue | string;
/**
 * @category Value Like
 */
export type HeadUrlLike = EscStringValue | string;
/**
 * @category Value Like
 */
export type HeadclipLike = BoolValue | boolean;
/**
 * @category Value Like
 */
export type HeadhrefLike = EscStringValue | string;
/**
 * @category Value Like
 */
export type HeadlabelLike = LblStringValue | string;
/**
 * @category Static Value
 */
export type PortPos = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw' | 'c' | '_';
/**
 * @category Value Like
 */
export type HeadportLike = PortPosValue | PortPos | string;
/**
 * @category Value Like
 */
export type HeadtargetLike = EscStringValue | string;
/**
 * @category Value Like
 */
export type HeadtooltipLike = EscStringValue | string;
/**
 * @category Value Like
 */
export type HeightLike = DoubleValue | number;
/**
 * @category Value Like
 */
export type HrefLike = EscStringValue | string;
/**
 * @category Value Like
 */
export type IdLike = LblStringValue | string;
/**
 * @category Value Like
 */
export type ImageLike = StringValue | string;
/**
 * @category Value Like
 */
export type ImagepathLike = StringValue | string;
/**
 * @category Value Like
 */
export type ImagescaleLike = StringValue | string;
/**
 * @category Value Like
 */
export type LabelLike = LblStringValue | string;
/**
 * @category Value Like
 */
export type LabelUrlLike = EscStringValue | string;
/**
 * @category Value Like
 */
export type LabelangleLike = DoubleValue | number;
/**
 * @category Value Like
 */
export type LabeldistanceLike = DoubleValue | number;
/**
 * @category Value Like
 */
export type LabelfloatLike = BoolValue | boolean;
/**
 * @category Value Like
 */
export type LabelfontcolorLike = ColorValue | string;
/**
 * @category Value Like
 */
export type LabelfontnameLike = StringValue | string;
/**
 * @category Value Like
 */
export type LabelfontsizeLike = DoubleValue | number;
/**
 * @category Value Like
 */
export type LabelhrefLike = EscStringValue | string;
/**
 * @category Value Like
 */
export type LabeljustLike = StringValue | string;
/**
 * @category Value Like
 */
export type LabellocLike = StringValue | string;
/**
 * @category Value Like
 */
export type LabeltargetLike = EscStringValue | string;
/**
 * @category Value Like
 */
export type LabeltooltipLike = EscStringValue | string;
/**
 * @category Value Like
 */
export type LandscapeLike = BoolValue | boolean;
/**
 * @category Value Like
 */
export type LayerLike = LayerRangeValue;
/**
 * @category Value Like
 */
export type LayerlistsepLike = StringValue | string;
/**
 * @category Value Like
 */
export type LayersLike = LayerListValue;
/**
 * @category Value Like
 */
export type LayerselectLike = LayerRangeValue;
/**
 * @category Value Like
 */
export type LayersepLike = StringValue | string;
/**
 * @category Value Like
 */
export type LayoutLike = StringValue | string;
/**
 * @category Value Like
 */
export type LenLike = DoubleValue | number;
/**
 * @category Value Like
 */
export type LevelsLike = IntValue | number;
/**
 * @category Value Like
 */
export type LevelsgapLike = DoubleValue | number;
/**
 * @category Value Like
 */
export type LheadLike = StringValue | string;
/**
 * @category Value Like
 */
export type LheightLike = DoubleValue | number;
/**
 * @category Value Like
 */
export type LpLike = PointValue | string;
/**
 * @category Value Like
 */
export type LtailLike = StringValue | string;
/**
 * @category Value Like
 */
export type LwidthLike = DoubleValue | number;
/**
 * @category Value Like
 */
export type MarginLike = PointfValue | string;
/**
 * @category Value Like
 */
export type MaxiterLike = IntValue | number;
/**
 * @category Value Like
 */
export type MclimitLike = DoubleValue | number;
/**
 * @category Value Like
 */
export type MindistLike = DoubleValue | number;
/**
 * @category Value Like
 */
export type MinlenLike = IntValue | number;
/**
 * @category Value Like
 */
export type ModeLike = StringValue | string;
/**
 * @category Value Like
 */
export type ModelLike = StringValue | string;
/**
 * @category Value Like
 */
export type MosekLike = BoolValue | boolean;
/**
 * @category Value Like
 */
export type NodesepLike = DoubleValue | number;
/**
 * @category Value Like
 */
export type NojustifyLike = BoolValue | boolean;
/**
 * @category Value Like
 */
export type NormalizeLike = BoolValue | boolean;
/**
 * @category Value Like
 */
export type NslimitLike = DoubleValue | number;
/**
 * @category Value Like
 */
export type Nslimit1Like = DoubleValue | number;
/**
 * @category Value Like
 */
export type OrderingLike = StringValue | string;
/**
 * @category Value Like
 */
export type OrientationLike = StringValue | string;
/**
 * @category Value Like
 */
export type OutputorderLike = OutputModeValue;
/**
 * @category Value Like
 */
export type OverlapLike = StringValue | string;
/**
 * @category Value Like
 */
export type OverlapScalingLike = DoubleValue | number;
/**
 * @category Value Like
 */
export type PackLike = IntValue | number;
// "node", "clust" , "graph" , "array(_flags)?(%d)?"
/**
 * @category Static Value
 */
export type Packmode = 'node' | 'clust' | 'graph';
/**
 * @category Value Like
 */
export type PackmodeLike = PackModeValue | Packmode | string;
/**
 * @category Value Like
 */
export type PadLike = PointfValue | string;
/**
 * @category Value Like
 */
export type PageLike = PointfValue | string;
/**
 * @category Static Value
 */
export type Pagedir = 'BL' | 'BR' | 'TL' | 'TR' | 'RB' | 'RT' | 'LB' | 'LT';
/**
 * @category Value Like
 */
export type PagedirLike = PagedirValue | Pagedir | string;
/**
 * @category Value Like
 */
export type PencolorLike = ColorValue | string;
/**
 * @category Value Like
 */
export type PenwidthLike = DoubleValue | number;
/**
 * @category Value Like
 */
export type PeripheriesLike = IntValue | number;
/**
 * @category Value Like
 */
export type PinLike = BoolValue | boolean;
/**
 * @category Value Like
 */
export type PosLike = PointValue | string;
/**
 * @category Static Value
 */
export type QuadType = 'normal' | 'fast' | 'none';
/**
 * @category Value Like
 */
export type QuadtreeLike = QuadTypeValue | QuadType | string;
/**
 * @category Value Like
 */
export type QuantumLike = DoubleValue | number;
/**
 * @category Static Value
 */
export type Rank = 'same' | 'min' | 'source' | 'max' | 'sink';
/**
 * @category Value Like
 */
export type RankLike = RankTypeValue | Rank | string;
/**
 * @category Static Value
 */
export type Rankdir = 'TB' | 'LR' | 'BT' | 'RL';
/**
 * @category Value Like
 */
export type RankdirLike = RankdirValue | Rankdir | string;
/**
 * @category Value Like
 */
export type RanksepLike = DoubleValue | number;
/**
 * @category Value Like
 */
export type RatioLike = StringValue | string;
/**
 * @category Value Like
 */
export type RectsLike = RectValue | string;
/**
 * @category Value Like
 */
export type RegularLike = BoolValue | boolean;
/**
 * @category Value Like
 */
export type RemincrossLike = BoolValue | boolean;
/**
 * @category Value Like
 */
export type RepulsiveforceLike = DoubleValue | number;
/**
 * @category Value Like
 */
export type ResolutionLike = DoubleValue | number;
/**
 * @category Value Like
 */
export type RootLike = StringValue | string;
/**
 * @category Value Like
 */
export type RotateLike = IntValue | number;
/**
 * @category Value Like
 */
export type RotationLike = DoubleValue | number;
/**
 * @category Value Like
 */
export type SameheadLike = StringValue | string;
/**
 * @category Value Like
 */
export type SametailLike = StringValue | string;
/**
 * @category Value Like
 */
export type SamplepointsLike = IntValue | number;
/**
 * @category Value Like
 */
export type ScaleLike = DoubleValue | number;
/**
 * @category Value Like
 */
export type SearchsizeLike = IntValue | number;
/**
 * @category Value Like
 */
export type SepLike = DoubleValue | number;
export type Shape =
  | 'assembly'
  | 'box'
  | 'box3d'
  | 'cds'
  | 'circle'
  | 'component'
  | 'cylinder'
  | 'diamond'
  | 'doublecircle'
  | 'doubleoctagon'
  | 'egg'
  | 'ellipse'
  | 'fivepoverhang'
  | 'folder'
  | 'hexagon'
  | 'house'
  | 'insulator'
  | 'invhouse'
  | 'invtrapezium'
  | 'invtriangle'
  | 'larrow'
  | 'lpromoter'
  | 'Mcircle'
  | 'Mdiamond'
  | 'Msquare'
  | 'none'
  | 'note'
  | 'noverhang'
  | 'octagon'
  | 'oval'
  | 'parallelogram'
  | 'pentagon'
  | 'plain'
  | 'plaintext'
  | 'point'
  | 'polygon'
  | 'primersite'
  | 'promoter'
  | 'proteasesite'
  | 'proteinstab'
  | 'rarrow'
  | 'rect'
  | 'rectangle'
  | 'restrictionsite'
  | 'ribosite'
  | 'rnastab'
  | 'rpromoter'
  | 'septagon'
  | 'signature'
  | 'square'
  | 'star'
  | 'tab'
  | 'terminator'
  | 'threepoverhang'
  | 'trapezium'
  | 'triangle'
  | 'tripleoctagon'
  | 'underline'
  | 'utr';
/**
 * @category Value Like
 */
export type ShapeLike = ShapeValue | Shape | string;
/**
 * @category Value Like
 */
export type ShapefileLike = StringValue | string;
/**
 * @category Value Like
 */
export type ShowboxesLike = IntValue | number;
/**
 * @category Value Like
 */
export type SidesLike = IntValue | number;
/**
 * @category Value Like
 */
export type SizeLike = PointfValue | string;
/**
 * @category Value Like
 */
export type SkewLike = DoubleValue | number;
/**
 * @category Value Like
 */
export type SmoothingLike = SmoothTypeValue;
/**
 * @category Value Like
 */
export type SortvLike = IntValue | number;
/**
 * @category Value Like
 */
export type SplinesLike = StringValue | string;
/**
 * @category Value Like
 */
export type StartLike = StartTypeValue;
/**
 * @category Value Like
 */
export type StyleLike = StyleValue;
/**
 * @category Value Like
 */
export type StylesheetLike = StringValue | string;
/**
 * @category Value Like
 */
export type TailLpLike = PointfValue | string;
/**
 * @category Value Like
 */
export type TailUrlLike = EscStringValue | string;
/**
 * @category Value Like
 */
export type TailclipLike = BoolValue | boolean;
/**
 * @category Value Like
 */
export type TailhrefLike = EscStringValue | string;
/**
 * @category Value Like
 */
export type TaillabelLike = LblStringValue | string;
/**
 * @category Value Like
 */
export type TailportLike = PortPosValue | PortPos | string;
/**
 * @category Value Like
 */
export type TailtargetLike = EscStringValue | string;
/**
 * @category Value Like
 */
export type TailtooltipLike = EscStringValue | string;
/**
 * @category Value Like
 */
export type TargetLike = EscStringValue | string;
/**
 * @category Value Like
 */
export type TooltipLike = EscStringValue | string;
/**
 * @category Value Like
 */
export type TruecolorLike = BoolValue | boolean;
/**
 * @category Value Like
 */
export type VerticesLike = PointfListValue | string;
/**
 * @category Value Like
 */
export type ViewportLike = ViewPortValue;
/**
 * @category Value Like
 */
export type VoroMarginLike = DoubleValue | number;
/**
 * @category Value Like
 */
export type WeightLike = DoubleValue | number;
/**
 * @category Value Like
 */
export type WidthLike = DoubleValue | number;
/**
 * @category Value Like
 */
export type XlabelLike = LblStringValue | string;
/**
 * @category Value Like
 */
export type ZLike = DoubleValue | number;
