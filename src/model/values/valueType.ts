import { GraphvizObject, IDot } from '../../common';

// tslint:disable:max-classes-per-file
// tslint:disable: prettier

/**
 * @category Values
 */
export abstract class GraphvizValue extends GraphvizObject implements IDot {
  // tslint:disable-next-line: ban-types
  constructor(protected value: Object) {
    super();
  }
  public toDot(): string {
    return this.value.toString();
  }
}

/**
 * @category Values
 */
export class ArrowTypeValue extends GraphvizValue {
  constructor(value: string);
  constructor(value: any) { super(value); }

}
/**
 * @category Values
 */
export class AspectTypeValue extends GraphvizValue {
}
/**
 * @category Values
 */
export class BoolValue extends GraphvizValue {
}
/**
 * @category Values
 */
export class ClusterModeValue extends GraphvizValue {
}
/**
 * @category Values
 */
export class ColorValue extends GraphvizValue {
  constructor(value: string);
  constructor(value: any) { super(value); }
  public toDot(): string {
    return `"${this.value}"`;
  }
}
/**
 * @category Values
 */
export class DirTypeValue extends GraphvizValue {
}
/**
 * @category Values
 */
export class DoubleValue extends GraphvizValue {
}
/**
 * @category Values
 */
export class EscStringValue extends GraphvizValue {
}
/**
 * @category Values
 */
export class IntValue extends GraphvizValue {
}
/**
 * @category Values
 */
export class LayerListValue extends GraphvizValue {
}
/**
 * @category Values
 */
export class LayerRangeValue extends GraphvizValue {
}
/**
 * @category Values
 */
export class LblStringValue extends GraphvizValue {
  private isHTMLLike: boolean;
  constructor(value: string);
  constructor(value: any) {
    const trimmed = value.trim();
    const isHTMLLike = /^<.+>$/ms.test(trimmed);
    super(isHTMLLike ? trimmed : value);
    this.isHTMLLike = isHTMLLike;
  }
  public toDot(): string {
    if (this.isHTMLLike) {
      return this.value.toString();
    }
    return `"${this.value}"`;
  }
}
/**
 * @category Values
 */
export class OutputModeValue extends GraphvizValue {
}
/**
 * @category Values
 */
export class PackModeValue extends GraphvizValue {
}
/**
 * @category Values
 */
export class PagedirValue extends GraphvizValue {
}
/**
 * @category Values
 */
export class PointValue extends GraphvizValue {
}
/**
 * @category Values
 */
export class PointfValue extends GraphvizValue {
}
/**
 * @category Values
 */
export class PointfListValue extends GraphvizValue {
}
/**
 * @category Values
 */
export class PortPosValue extends GraphvizValue {
}
/**
 * @category Values
 */
export class QuadTypeValue extends GraphvizValue {
}
/**
 * @category Values
 */
export class RankdirValue extends GraphvizValue {
  constructor(value: 'TB' | 'BT' | 'LR' | 'RL');
  constructor(value: any) { super(value); }
}
/**
 * @category Values
 */
export class RankTypeValue extends GraphvizValue {
  constructor(value: 'same' | 'min' | 'source' | 'max' | 'sink');
  constructor(value: any) { super(value); }
}
/**
 * @category Values
 */
export class RectValue extends GraphvizValue {
}
/**
 * @category Values
 */
export class ShapeValue extends GraphvizValue {
}
/**
 * @category Values
 */
export class SmoothTypeValue extends GraphvizValue {
}
/**
 * @category Values
 */
export class StartTypeValue extends GraphvizValue {
}
/**
 * @category Values
 */
export class StringValue extends GraphvizValue {
  constructor(value: string);
  constructor(value: any) { super(value); }
  public toDot(): string {
    return `"${this.value}"`;
  }
}
/**
 * @category Values
 */
export class StyleValue extends GraphvizValue {
}
/**
 * @category Values
 */
export class ViewPortValue extends GraphvizValue {
}
