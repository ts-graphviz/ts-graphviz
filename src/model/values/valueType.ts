import { GraphvizObject } from '../../common/abstract';
import { IDot } from '../../common/interface';

// tslint:disable:max-classes-per-file
// tslint:disable: prettier

export abstract class GraphvizValue extends GraphvizObject implements IDot {
  // tslint:disable-next-line: ban-types
  constructor(protected value: Object) {
    super();
  }
  public toDot(): string {
    return this.value.toString();
  }
}

export class ArrowTypeValue extends GraphvizValue {
  constructor(value: string);
  constructor(value: any) { super(value); }

}
export class AspectTypeValue extends GraphvizValue {
}
export class BoolValue extends GraphvizValue {
}
export class ClusterModeValue extends GraphvizValue {
}
export class ColorValue extends GraphvizValue {
  constructor(value: string);
  constructor(value: any) { super(value); }
  public toDot(): string {
    return `"${this.value}"`;
  }
}
export class DirTypeValue extends GraphvizValue {
}
export class DoubleValue extends GraphvizValue {
}
export class EscStringValue extends GraphvizValue {
}
export class IntValue extends GraphvizValue {
}
export class LayerListValue extends GraphvizValue {
}
export class LayerRangeValue extends GraphvizValue {
}
export class LblStringValue extends GraphvizValue {
  constructor(value: string);
  constructor(value: any) { super(value); }
  public toDot(): string {
    return `"${this.value}"`;
  }
}
export class OutputModeValue extends GraphvizValue {
}
export class PackModeValue extends GraphvizValue {
}
export class PagedirValue extends GraphvizValue {
}
export class PointValue extends GraphvizValue {
}
export class PointfValue extends GraphvizValue {
}
export class PointfListValue extends GraphvizValue {
}
export class PortPosValue extends GraphvizValue {
}
export class QuadTypeValue extends GraphvizValue {
}
export class RankdirValue extends GraphvizValue {
  constructor(value: 'TB' | 'BT' | 'LR' | 'RL');
  constructor(value: any) { super(value); }
}
export class RankTypeValue extends GraphvizValue {
  constructor(value: 'same' | 'min' | 'source' | 'max' | 'sink');
  constructor(value: any) { super(value); }
}
export class RectValue extends GraphvizValue {
}
export class ShapeValue extends GraphvizValue {
}
export class SmoothTypeValue extends GraphvizValue {
}
export class StartTypeValue extends GraphvizValue {
}
export class StringValue extends GraphvizValue {
  constructor(value: string);
  constructor(value: any) { super(value); }
  public toDot(): string {
    return `"${this.value}"`;
  }
}
export class StyleValue extends GraphvizValue {
}
export class ViewPortValue extends GraphvizValue {
}
