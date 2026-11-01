/**
 * Arrow names of any length.
 *
 * `ArrowType` lists the arrow names of one or two shapes as string
 * literals. Graphviz takes up to four, but the literals of three or four
 * shapes would be millions, more than TypeScript can hold in a union; the
 * longer names are made with {@link arrow}, which checks each shape.
 *
 * @module
 */
import type { ArrowType } from './attributes/types.js';
import { withCode } from './errors.js';

/**
 * The brand of {@link ArrowName}: a symbol that exists only in the types and
 * is not exported, so no value but what {@link arrow} returns has it.
 */
declare const arrowName: unique symbol;

/**
 * An arrow name made by {@link arrow}. At run time it is the name itself,
 * a string; the type marks that its shapes were checked.
 * @group Attribute Types
 */
export type ArrowName = string & { readonly [arrowName]: true };

/**
 * The shapes of an arrow name: one to four; of two or more, the last is
 * not `none`.
 * @group Attribute Types
 */
export type ArrowShapes =
  | readonly [ArrowType.aname]
  | readonly [ArrowType.aname, ArrowType.last]
  | readonly [ArrowType.aname, ArrowType.aname, ArrowType.last]
  | readonly [
      ArrowType.aname,
      ArrowType.aname,
      ArrowType.aname,
      ArrowType.last,
    ];

const OPEN_SHAPES = ['box', 'diamond', 'dot', 'inv', 'normal'];
const SIDED_SHAPES = [
  'box',
  'crow',
  'curve',
  'diamond',
  'icurve',
  'inv',
  'normal',
  'tee',
  'vee',
];

/** Every {@link ArrowType.aname}, as Graphviz's table of arrow shapes has it. */
const ANAMES: ReadonlySet<string> = new Set([
  'none',
  ...new Set([...OPEN_SHAPES, ...SIDED_SHAPES]),
  ...OPEN_SHAPES.map((shape) => `o${shape}`),
  ...['l', 'r'].flatMap((side) => [
    ...SIDED_SHAPES.map((shape) => `${side}${shape}`),
    ...OPEN_SHAPES.filter((shape) => SIDED_SHAPES.includes(shape)).map(
      (shape) => `o${side}${shape}`,
    ),
  ]),
]);

/**
 * An arrow name of one to four shapes, for `arrowhead` and `arrowtail`.
 *
 * Each shape is a shape name with its modifiers, as in Graphviz's table:
 * `o` (open) on `box`, `diamond`, `dot`, `inv` and `normal`, `l` or `r`
 * (one side) on any shape but `dot` and `none`. `none` takes no modifier;
 * alone it means no arrow, and after other shapes it cannot come last.
 *
 * @example
 * ```ts
 * edge.attributes.set('arrowhead', arrow('obox', 'ltee', 'vee'));
 * // arrowhead = "oboxlteevee"
 * ```
 * @see {@link https://graphviz.org/doc/info/arrows.html Arrow Shapes}
 * @throws RangeError (`TSG_ERR_INVALID_ARROW`) if a shape is not one of
 * Graphviz's, there are none or more than four, or the last of two or more
 * is `none`.
 * @group Attribute Types
 */
export function arrow(...shapes: ArrowShapes): ArrowName {
  const names: readonly unknown[] = shapes;
  if (
    names.length < 1 ||
    names.length > 4 ||
    names.some((name) => typeof name !== 'string' || !ANAMES.has(name)) ||
    (names.length > 1 && names[names.length - 1] === 'none')
  ) {
    throw withCode(
      new RangeError(
        'An arrow takes one to four of Graphviz’s arrow shapes, and does not end in "none" after another',
      ),
      'TSG_ERR_INVALID_ARROW',
    );
  }
  return names.join('') as ArrowName;
}
