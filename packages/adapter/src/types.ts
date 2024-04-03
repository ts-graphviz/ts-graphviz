import type {
  $keywords,
  $keywordsValidation,
  EdgeAttributesObject,
  GraphAttributesObject,
  NodeAttributesObject,
  SubgraphAttributesObject,
} from '@ts-graphviz/common';

/**
 * Export file format of a graph visualization.
 * @public
 */
export type Format = Format.values;
/**
 * @public
 */
export namespace Format {
  /**
   * @public
   */
  export type values = Exclude<keyof $values, keyof $exclude | symbol | number>;
  /**
   * Type that contains all possible values for the Format type.
   * @public
   */
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

/**
 * Layout engine for a graph visualization.
 * @public
 */
export type Layout = Layout.values;
/**
 * @public
 */
export namespace Layout {
  /**
   * @public
   */
  export type values = Exclude<keyof $values, keyof $exclude | symbol | number>;
  /**
   * @public
   */
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
 * @beta
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
 * @beta
 */
export interface FdpOptions {
  layout: 'fdp';
  /**
   * Use grid.
   *
   * @defaultValue true
   */
  grid?: boolean;
  /**
   * Use old attractive force
   *
   * @defaultValue true
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
 * This interface describes an optional parameter called "layout" which is used to set a layout engine.
 * The defaultValue value for this parameter is 'dot', and it must be an option of the Layout type,
 * excluding 'neato' and 'fdp'.
 * @beta
 */
export interface OtherOptions {
  /**
   * Set layout engine.
   *
   * @defaultValue 'dot'
   */
  layout?: Exclude<Layout, 'neato' | 'fdp'>;
}

/**
 * This interface represents the CommonOptions for setting output format.
 * @beta
 */
export interface CommonOptions {
  /**
   * Set output format.
   *
   * @defaultValue 'svg'
   */
  format?: Format;
  /**
   * If true, set level of message suppression (=1).
   *
   * @defaultValue true
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

/**
 * Options for setting layout engine and output format.
 * @beta
 */
export type Options<T extends Layout = Layout> = CommonOptions &
  (T extends 'neato'
    ? NeatoOptions
    : T extends 'fdp'
      ? FdpOptions
      : OtherOptions);
