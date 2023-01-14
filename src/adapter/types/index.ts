import {
  EdgeAttributesObject,
  GraphAttributesObject,
  NodeAttributesObject,
  SubgraphAttributesObject,
} from '../../common/index.js';

export type Format = 'png' | 'svg' | 'json' | 'jpg' | 'pdf' | 'xdot' | 'dot' | 'plain' | 'dot_json';

export type Layout = 'dot' | 'neato' | 'fdp' | 'sfdp' | 'circo' | 'twopi' | 'nop' | 'nop2' | 'osage' | 'patchwork';

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

export interface OtherOptions {
  /**
   * Set layout engine.
   *
   * @default 'dot'
   */
  layout?: Exclude<Layout, 'neato' | 'fdp'>;
}

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
  (T extends 'neato' ? NeatoOptions : T extends 'fdp' ? FdpOptions : OtherOptions);
