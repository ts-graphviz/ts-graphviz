import {
  $keywords,
  $keywordsValidation,
  EdgeAttributesObject,
  GraphAttributesObject,
  NodeAttributesObject,
  SubgraphAttributesObject,
} from '@ts-graphviz/common';

export type Format = Format.values;
export namespace Format {
  export type values = Exclude<keyof $values, keyof $exclude | symbol | number>;
  export interface $values
    extends $keywords<
      | 'png'
      | 'svg'
      | 'json'
      | 'jpg'
      | 'pdf'
      | 'xdot'
      | 'dot'
      | 'plain'
      | 'dot_json'
    > {}
  export interface $exclude extends $keywordsValidation {}
}

export type Layout = Layout.values;
export namespace Layout {
  export type values = Exclude<keyof $values, keyof $exclude | symbol | number>;
  export interface $values
    extends $keywords<
      | 'dot'
      | 'neato'
      | 'fdp'
      | 'sfdp'
      | 'circo'
      | 'twopi'
      | 'nop'
      | 'nop2'
      | 'osage'
      | 'patchwork'
    > {}
  export interface $exclude extends $keywordsValidation {}
}

/**
 * NeatoOptions interface provides options for the neato layout.
 */
export interface NeatoOptions {
  layout: 'neato';
  /**
   * Sets no-op flag in neato.
   */
  noop?: number;
  /**
   * Reduce graph.
   */
  reduce?: boolean;
}

/**
 * FdpOptions interface provides options for the fdp layout.
 */
export interface FdpOptions {
  layout: 'fdp';
  /**
   * Use grid.
   *
   * @default true
   */
  grid?: boolean;
  /**
   * Use old attractive force
   *
   * @default true
   */
  oldAttractive?: boolean;

  /**
   * Set number of iterations.
   */
  iterations?: number;
  /**
   * Set unscaled factor
   */
  unscaledFactor?: number;
  /**
   * Set overlap expansion factor.
   */
  overlapExpansionFactor?: number;
  /**
   * Set temperature.
   */
  temperature?: number;
}

/**
 * @description
 * This interface describes an optional parameter called "layout" which is used to set a layout engine.
 * The default value for this parameter is 'dot', and it must be an option of the Layout type,
 * excluding 'neato' and 'fdp'.
 */
export interface OtherOptions {
  /**
   * Set layout engine.
   *
   * @default 'dot'
   */
  layout?: Exclude<Layout, 'neato' | 'fdp'>;
}

/**
 * This interface represents the CommonOptions for setting output format.
 */
export interface CommonOptions {
  /**
   * Set output format.
   *
   * @default 'svg'
   */
  format?: Format;
  /**
   * If true, set level of message suppression (=1).
   *
   * @default true
   */
  suppressWarnings?: boolean;
  /**
   * Path of graphviz dot command.
   */
  dotCommand?: string;
  attributes?: {
    /**
     * Set edge attribute.
     */
    edge?: EdgeAttributesObject;
    /**
     * Set node attribute.
     */
    node?: NodeAttributesObject;
    /**
     * Set graph attribute.
     */
    graph?: GraphAttributesObject & SubgraphAttributesObject;
  };
  /**
   * Scale input
   */
  scale?: number;
  /**
   * Use external library.
   */
  library?: string[];
  /**
   * Invert y coordinate in output.
   */
  y?: boolean;
}

export type Options<T extends Layout = Layout> = CommonOptions &
  (T extends 'neato'
    ? NeatoOptions
    : T extends 'fdp'
      ? FdpOptions
      : OtherOptions);
