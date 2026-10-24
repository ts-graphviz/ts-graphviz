import type {
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
 * @public
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
 * @public
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
   * Use old attractive force (`-LO`).
   *
   * @default false
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
 * The default value for this parameter is 'dot', and it must be an option of the Layout type,
 * excluding 'neato' and 'fdp'.
 * @public
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
 * @public
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
   *
   * **This should be a trusted, hardcoded path in your application configuration. Do not derive this value from end-user input.**
   *
   * @defaultValue 'dot'
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
   *
   * **These should be trusted library names defined in your application code. Do not derive these values from end-user input.**
   */
  library?: string[];
  /**
   * Invert y coordinate in output.
   */
  y?: boolean;
  /**
   * Stop the command: when the signal aborts, the process is killed and the
   * call rejects with `signal.reason` (an `AbortError`, or a `TimeoutError`
   * for `AbortSignal.timeout(ms)`).
   *
   * Layout cost depends on the DOT source, so set a time limit when the
   * source is not your own, e.g. `signal: AbortSignal.timeout(10_000)`.
   */
  signal?: AbortSignal;
  /**
   * Maximum size of the output in bytes. When the command writes more, it is
   * killed and the call rejects with a `RangeError` whose `code` is
   * `TSG_ERR_OUTPUT_LIMIT_EXCEEDED`. `0` disables the limit.
   *
   * @default 134217728 (128 MiB)
   */
  maxOutputSize?: number;
}

export type Options<T extends Layout = Layout> = CommonOptions &
  (T extends 'neato'
    ? NeatoOptions
    : T extends 'fdp'
      ? FdpOptions
      : OtherOptions);
