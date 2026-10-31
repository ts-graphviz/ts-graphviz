import type { SanitizeOptions } from '@ts-graphviz/ast';
import type {
  EdgeAttributesObject,
  GraphAttributesObject,
  NodeAttributesObject,
  SubgraphAttributesObject,
} from '@ts-graphviz/common';

/**
 * An output format of Graphviz (`-T`).
 *
 * The formats that write to a file or stream, as listed in
 * {@link https://graphviz.org/docs/outputs/ Output Formats}; the interactive
 * ones (`gtk`, `x11`, `xlib`) are left out. Which ones work depends on how
 * Graphviz was built.
 *
 * The adapter accepts exactly these names at run time (check a format chosen
 * by a request with `isFormat`); anything else, including a `:renderer`
 * suffix such as `png:cairo`, is rejected before the command starts.
 * Formats a plugin adds are named per call with `customFormats`.
 */
export type Format =
  | 'bmp'
  | 'canon'
  | 'cmap'
  | 'cmapx'
  | 'cmapx_np'
  | 'dot'
  | 'dot_json'
  | 'eps'
  | 'exr'
  | 'fig'
  | 'gd'
  | 'gd2'
  | 'gif'
  | 'gv'
  | 'ico'
  | 'imap'
  | 'imap_np'
  | 'ismap'
  | 'jp2'
  | 'jpe'
  | 'jpeg'
  | 'jpg'
  | 'json'
  | 'json0'
  | 'kitty'
  | 'kittyz'
  | 'mp'
  | 'pct'
  | 'pdf'
  | 'pic'
  | 'pict'
  | 'plain'
  | 'plain-ext'
  | 'png'
  | 'pov'
  | 'ps'
  | 'ps2'
  | 'psd'
  | 'sgi'
  | 'svg'
  | 'svg_inline'
  | 'svgz'
  | 'tga'
  | 'tif'
  | 'tiff'
  | 'tk'
  | 'vdx'
  | 'vml'
  | 'vmlz'
  | 'vrml'
  | 'wbmp'
  | 'webp'
  | 'xdot'
  | 'xdot1.2'
  | 'xdot1.4'
  | 'xdot_json';

/**
 * A layout engine of Graphviz (`-K`).
 *
 * The adapter accepts exactly these names at run time (check a layout
 * chosen by a request with `isLayout`); anything else is rejected before
 * the command starts. Layout engines a plugin adds are named per call with
 * `customLayouts`.
 */
export type Layout =
  | 'dot'
  | 'neato'
  | 'fdp'
  | 'sfdp'
  | 'circo'
  | 'twopi'
  | 'nop'
  | 'nop2'
  | 'osage'
  | 'patchwork';

/**
 * NeatoOptions interface provides options for the neato layout.
 * @public
 */
export interface NeatoOptions {
  layout: 'neato';
  /**
   * Sets no-op flag in neato (`-n`): a non-negative integer.
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
   * Set number of iterations (`-Ln`): a non-negative integer.
   */
  iterations?: number;
  /**
   * Set unscaled factor (`-LU`): a finite, non-negative number.
   */
  unscaledFactor?: number;
  /**
   * Set overlap expansion factor (`-LC`): a finite, non-negative number.
   */
  overlapExpansionFactor?: number;
  /**
   * Set temperature (`-LT`): a finite, non-negative number.
   */
  temperature?: number;
}

/**
 * This interface describes an optional parameter called "layout" which is used to set a layout engine.
 * The default value for this parameter is 'dot', and it must be an option of the Layout type,
 * excluding 'neato' and 'fdp'.
 * @public
 */
export interface OtherOptions<L extends string = never> {
  /**
   * Set layout engine: one of the {@link Layout} names other than `neato` and
   * `fdp`, or of `customLayouts`.
   *
   * @default 'dot'
   */
  layout?: Exclude<Layout, 'neato' | 'fdp'> | NoInfer<L>;
}

/**
 * `T`, without letting this position infer it: TypeScript 5.0 has no
 * built-in `NoInfer`. A custom name is then accepted only when it is listed
 * in `customFormats` / `customLayouts`, not because it was written as the
 * `format` / `layout` itself.
 */
type NoInfer<T> = [T][T extends unknown ? 0 : never];

/**
 * The options every layout takes.
 *
 * The options that are data (`format`, `layout`, `attributes`, the numbers
 * and flags, `maxOutputSize`, `sanitize`) are checked at run time, so they
 * may come from a request: a value outside the documented type or range is
 * rejected before the command starts with a `TypeError` or `RangeError`
 * whose `code` is `TSG_ERR_INVALID_OPTION` (`TSG_ERR_OUTPUT_LIMIT_EXCEEDED`
 * for `maxOutputSize`). `dotCommand`, `library`, `customFormats` and
 * `customLayouts` choose code to run or what it may be asked to do: they are
 * trusted configuration, checked for their type only (and, on Windows,
 * `dotCommand` must not be a `.bat` or `.cmd` script).
 * @public
 */
export interface CommonOptions<
  F extends string = never,
  L extends string = never,
> {
  /**
   * Set output format: exactly one of the {@link Format} names (see
   * `isFormat`), without a `:renderer` suffix, or of `customFormats`.
   *
   * @default 'svg'
   */
  format?: Format | NoInfer<F>;
  /**
   * If true, set level of message suppression (=1).
   *
   * @default true
   */
  suppressWarnings?: boolean;
  /**
   * Path of graphviz dot command: a non-empty string.
   *
   * **This should be a trusted, hardcoded path in your application configuration. Do not derive this value from end-user input.**
   * Apart from its type and the Windows check below it is not checked; the adapter runs whatever it names.
   *
   * On Windows it must name an executable (`dot.exe`), not a `.bat` or `.cmd` script: Windows runs a script through `cmd.exe`, which parses the arguments again, so such a command is rejected with `CommandExecutionError` before it starts.
   *
   * @defaultValue 'dot'
   */
  dotCommand?: string;
  /**
   * Graph, node and edge attributes given to the command as `-G` / `-N` /
   * `-E` arguments. Each record maps attribute names (not empty, without
   * `=` or a NUL character) to strings (without a NUL character), finite
   * numbers or booleans; `escString()` and `htmlLike()` values cannot be
   * given on the command line, put them in the DOT source. While `sanitize`
   * is on, the arguments are also checked by the same rules as the source.
   */
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
   * Scale input (`-s`): a finite number greater than 0.
   */
  scale?: number;
  /**
   * Use external library.
   *
   * **These should be trusted library names defined in your application code. Do not derive these values from end-user input.**
   * They are checked to be an array of strings only.
   */
  library?: string[];
  /**
   * Output formats a Graphviz plugin adds, accepted as `format` besides the
   * documented {@link Format} names, for this call only (`isFormat` still
   * answers for the documented names only). The names also widen the type
   * of `format` for this call: `toBlob(dot, { customFormats: ['mp4'],
   * format: 'mp4' })`.
   *
   * **These are trusted configuration defined in your application code. Do
   * not derive them from end-user input.** They are checked to be non-empty
   * strings without a NUL character only. While `sanitize` is on, a format
   * is refused unless its name before any `:renderer` suffix is one it has
   * checked: a new format (`'mp4'`) needs `sanitize: false`, while a renderer
   * of a checked one (`'png:cairo'`) is checked as that format.
   */
  customFormats?: readonly F[];
  /**
   * Layout engines a Graphviz plugin adds, accepted as `layout` besides the
   * documented {@link Layout} names, for this call only (`isLayout` still
   * answers for the documented names only). The names also widen the type
   * of `layout` for this call.
   *
   * **These are trusted configuration defined in your application code. Do
   * not derive them from end-user input.** They are checked to be non-empty
   * strings without a NUL character only.
   */
  customLayouts?: readonly L[];
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
   * The output is kept in memory until the returned `Blob` is released, so
   * this is also the bound of that memory.
   *
   * @default 134217728 (128 MiB)
   */
  maxOutputSize?: number;
  /**
   * Check the DOT source with `sanitize` from `@ts-graphviz/ast` and render
   * the checked text. The call rejects with a `DOMException` named
   * `SecurityError` (`code` `TSG_ERR_UNSAFE_DOT`) when the source makes
   * Graphviz read a file (`image`, `shapefile`, `<IMG>`, …) or write an
   * unsafe link (`URL="javascript:…"`, …), and with a `DotSyntaxError` when
   * it does not parse. Pass options as an object: parser limits, or
   * `policy: 'strict'` to allow only the attributes and HTML-like tags
   * Graphviz defines, with plain values. The adapter rejects any other
   * value, a `policy` other than `'default'` / `'strict'`, and parser
   * limits that are not non-negative numbers (finite, for the depth
   * limits).
   *
   * Set `false` only for sources you trust, e.g. to render your own images.
   *
   * @default true
   */
  sanitize?: boolean | SanitizeOptions;
}

/**
 * The options of `toBlob`. `F` and `L` are the names listed in
 * `customFormats` and `customLayouts`, inferred from them.
 */
export type Options<
  T extends string = Layout,
  F extends string = never,
  L extends string = never,
> = CommonOptions<F, L> &
  ListedNames<F, L> &
  (T extends 'neato'
    ? NeatoOptions
    : T extends 'fdp'
      ? FdpOptions
      : OtherOptions<L>);

/**
 * Custom names must be listed: with custom format or layout names in the
 * type (inferred from the lists, or given as type arguments), the matching
 * list is required.
 */
type ListedNames<F extends string, L extends string> = ([F] extends [never]
  ? unknown
  : { customFormats: readonly F[] }) &
  ([L] extends [never] ? unknown : { customLayouts: readonly L[] });
