import type { Color } from '@ts-graphviz/common';

/**
 * The canvasColor type is used to encode color data for nodes and edges.
 * Colors attributes expect a string.
 *
 * Colors can be specified in hex format e.g. "#FF0000", or using one of the preset colors, e.g. "1" for red.
 *
 * @example
 * ```ts
 * const color: CanvasColor = "1";
 * const color: CanvasColor = "#FF0000";
 * ```
 */
export type CanvasColor = Color.RGB_RGBA | CanvasColor.Preset;
/**
 * Namespace for the {@link CanvasColor} type.
 * @example Get the value of a color preset.
 * ```ts
 * import { CanvasColor } from '@ts-graphviz/jsoncanvas';
 * console.log(CanvasColor.red);
 * // Output: "1"
 * console.log(CanvasColor.RED);
 * // Output: "1"
 * ```
 */
export namespace CanvasColor {
  /**
   * The preset red color in JSONCanvas.
   * @example
   * ```ts
   * import { CanvasColor } from '@ts-graphviz/jsoncanvas';
   * console.log(CanvasColor.red);
   * // Output: "1"
   * ```
   */
  export const red = '1';
  /**
   * The preset orange color in JSONCanvas.
   * @example
   * ```ts
   * import { CanvasColor } from '@ts-graphviz/jsoncanvas';
   * console.log(CanvasColor.orange);
   * // Output: "2"
   * ```
   */
  export const orange = '2';
  /**
   * The preset yellow color in JSONCanvas.
   * @example
   * ```ts
   * import { CanvasColor } from '@ts-graphviz/jsoncanvas';
   * console.log(CanvasColor.yellow);
   * // Output: "3"
   * ```
   */
  export const yellow = '3';

  /**
   * The preset green color in JSONCanvas.
   * @example
   * ```ts
   * import { CanvasColor } from '@ts-graphviz/jsoncanvas';
   * console.log(CanvasColor.green);
   * // Output: "4"
   * ```
   */
  export const green = '4';

  /**
   * The preset cyan color in JSONCanvas.
   * @example
   * ```ts
   * import { CanvasColor } from '@ts-graphviz/jsoncanvas';
   * console.log(CanvasColor.cyan);
   * // Output: "5"
   * ```
   */
  export const cyan = '5';

  /**
   * The preset purple color in JSONCanvas.
   * @example
   * ```ts
   * import { CanvasColor } from '@ts-graphviz/jsoncanvas';
   * console.log(CanvasColor.purple);
   * // Output: "6"
   * ```
   */
  export const purple = '6';

  /**
   * Color preset.
   */
  export type Preset =
    | typeof red
    | typeof orange
    | typeof yellow
    | typeof green
    | typeof cyan
    | typeof purple;

  /**
   * Assert that a string is a {@link CanvasColor}.
   * @param color - The string to assert.
   * @throws {Error} If the string is not a {@link CanvasColor}.
   *
   * @example
   * ```ts
   * CanvasColor.assert('1');
   * CanvasColor.assert('#123456');
   * CanvasColor.assert('#abcdef');
   * CanvasColor.assert('#ABCDEF');
   * ```
   */
  export function assert(color: string): asserts color is CanvasColor {
    if (!/^([1-6]|\#[\dA-F]{6})$/i.test(color)) {
      throw new Error(`Invalid CanvasColor: ${color}`);
    }
  }
}

/**
 * Valid values:
 * - `cover` fills the entire width and height of the node.
 * - `ratio` maintains the aspect ratio of the background image.
 * - `repeat` repeats the image as a pattern in both x/y directions.
 */
export type BackgroundStyle =
  | typeof BackgroundStyle.cover
  | typeof BackgroundStyle.ratio
  | typeof BackgroundStyle.repeat;
/**
 * Namespace for the {@link BackgroundStyle} type.
 */
export namespace BackgroundStyle {
  /**
   * The `cover` value of {@link BackgroundStyle}.
   *
   * `cover` fills the entire width and height of the node.
   *
   * @example
   * ```ts
   * import { BackgroundStyle } from '@ts-graphviz/jsoncanvas';
   * console.log(BackgroundStyle.cover);
   * // Output: "cover"
   * ```
   */
  export const cover = 'cover';
  /**
   * The `ratio` value of {@link BackgroundStyle}
   *
   * `ratio` maintains the aspect ratio of the background image.
   *
   * @example
   * ```ts
   * import { BackgroundStyle } from '@ts-graphviz/jsoncanvas';
   * console.log(BackgroundStyle.ratio);
   * // Output: "ratio"
   * ```
   */
  export const ratio = 'ratio';
  /**
   * The `repeat` value of {@link BackgroundStyle}
   *
   * `repeat` repeats the image as a pattern in both x/y directions.
   *
   * @example
   * ```ts
   * import { BackgroundStyle } from '@ts-graphviz/jsoncanvas';
   * console.log(BackgroundStyle.repeat);
   * // Output: "repeat"
   * ```
   */
  export const repeat = 'repeat';

  /**
   * Asserts that a value is of type {@link BackgroundStyle}.
   * @param value - The value to assert.
   * @throws If the value is not a valid {@link BackgroundStyle}.
   * @returns The asserted value.
   */
  export function assert(value: unknown): asserts value is BackgroundStyle {
    if (!validate(value)) {
      throw new Error(`Invalid group node background style: ${value}`);
    }
  }

  /**
   * Validates if a value is of type {@link BackgroundStyle}.
   * @param value - The value to validate.
   * @returns True if the value is a valid {@link BackgroundStyle}, false otherwise.
   */
  export function validate(value: unknown): value is BackgroundStyle {
    switch (value) {
      case cover:
      case ratio:
      case repeat:
        return true;
      default:
        return false;
    }
  }
}

/**
 * The side of an edge in a graph.
 * Possible values are "top", "right", "bottom", and "left".
 */
export type EdgeSide =
  | typeof EdgeSide.top
  | typeof EdgeSide.right
  | typeof EdgeSide.bottom
  | typeof EdgeSide.left;

/**
 * Namespace for the {@link EdgeSide} type.
 */
export namespace EdgeSide {
  /**
   * The top side of an edge.
   */
  export const top = 'top';
  /**
   * The right side of an edge.
   */
  export const right = 'right';
  /**
   * The bottom side of an edge.
   */
  export const bottom = 'bottom';
  /**
   * The left side of an edge.
   */
  export const left = 'left';

  /**
   * Asserts that a value is of type {@link EdgeSide}
   * @param value - The value to assert.
   * @throws If the value is not a valid {@link EdgeSide}.
   * @returns The asserted value.
   * @example
   * ```ts
   * import { EdgeSide } from '@ts-graphviz/jsoncanvas';
   * EdgeSide.assert('top');
   * EdgeSide.assert('right');
   * EdgeSide.assert('bottom');
   * EdgeSide.assert('left');
   * ```
   * @example
   * ```ts
   * import { EdgeSide } from '@ts-graphviz/jsoncanvas';
   *
   * try {
   *  EdgeSide.assert('invalid');
   * } catch (error) {
   * console.error(error.message);
   * // Output: Invalid edge side: invalid
   * ```
   */
  export function assert(value: unknown): asserts value is EdgeSide {
    if (!validate(value)) {
      throw new Error(`Invalid edge side: ${value}`);
    }
  }

  /**
   * Validates if a value is of type {@link EdgeSide}
   * @param value - The value to validate.
   * @returns True if the value is a valid {@link EdgeSide}, false otherwise.
   * @example
   * ```ts
   * import { EdgeSide } from '@ts-graphviz/jsoncanvas';
   * console.log(EdgeSide.validate('top'));
   * // Output: true
   * ```
   */
  export function validate(value: unknown): value is EdgeSide {
    switch (value) {
      case top:
      case right:
      case bottom:
      case left:
        return true;
      default:
        return false;
    }
  }
}

/**
 * Represents the possible types of edge ends.
 * - "none": No end decoration.
 * - "arrow": An arrowhead decoration at the end of the edge.
 */
export type EdgeEnd = 'none' | 'arrow';
/**
 * Namespace for the {@link EdgeEnd} type.
 */
export namespace EdgeEnd {
  /**
   * The none value of {@link EdgeEnd}.
   */
  export const none = 'none';
  /**
   * The arrow value of {@link EdgeEnd}.
   */
  export const arrow = 'arrow';

  /**
   * Asserts that a value is of type {@link EdgeEnd}
   * @param value - The value to assert.
   * @throws If the value is not a valid {@link EdgeEnd}.
   * @returns The asserted value.
   * @example
   * ```ts
   * import { EdgeEnd } from '@ts-graphviz/jsoncanvas';
   * EdgeEnd.assert('none');
   * EdgeEnd.assert('arrow');
   * ```
   */
  export function assert(value: unknown): asserts value is EdgeEnd {
    if (!validate(value)) {
      throw new Error(`Invalid edge end: ${value}`);
    }
  }

  /**
   * Validates if a value is of type {@link EdgeEnd}
   * @param value - The value to validate.
   * @returns True if the value is a valid {@link EdgeEnd}, false otherwise.
   * @example
   * ```ts
   * import { EdgeEnd } from '@ts-graphviz/jsoncanvas';
   * console.log(EdgeEnd.validate('none'));
   * // Output: true
   * ```
   */
  export function validate(value: unknown): value is EdgeEnd {
    return value === none || value === arrow;
  }
}
