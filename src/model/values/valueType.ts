// tslint:disable:max-classes-per-file
// tslint:disable: prettier

export abstract class GraphVizValue {
  constructor(protected value: any) {}
  public toDot(): string {
    return this.value.toString();
  }
}

export class ArrowTypeValue extends GraphVizValue {
}
const a = new ArrowTypeValue({});
export class AspectTypeValue extends GraphVizValue {
}
export class BoolValue extends GraphVizValue {
}
export class ClusterModeValue extends GraphVizValue {
}
export class ColorValue extends GraphVizValue {
}
export class DirTypeValue extends GraphVizValue {
}
export class DoubleValue extends GraphVizValue {
}
export class EscStringValue extends GraphVizValue {
}
export class IntValue extends GraphVizValue {
}
export class LayerListValue extends GraphVizValue {
}
export class LayerRangeValue extends GraphVizValue {
}
export class LblStringValue extends GraphVizValue {
}
export class OutputModeValue extends GraphVizValue {
}
export class PackModeValue extends GraphVizValue {
}
export class PagedirValue extends GraphVizValue {
}
export class PointValue extends GraphVizValue {
}
export class PointfValue extends GraphVizValue {
}
export class PointfListValue extends GraphVizValue {
}
export class PortPosValue extends GraphVizValue {
}
export class QuadTypeValue extends GraphVizValue {
}
export class RankdirValue extends GraphVizValue {
}
export class RankTypeValue extends GraphVizValue {
}
export class RectValue extends GraphVizValue {
}
export class ShapeValue extends GraphVizValue {
}
export class SmoothTypeValue extends GraphVizValue {
}
export class StartTypeValue extends GraphVizValue {
}
export class StringValue extends GraphVizValue {
}
export class StyleValue extends GraphVizValue {
}
export class ViewPortValue extends GraphVizValue {
}
