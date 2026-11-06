/**
 * The check behind {@link ArrowType.build}.
 *
 * @module
 */
import { withCode } from './errors.js';

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

/** Every `ArrowType.aname`, as Graphviz's table of arrow shapes has it. */
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
 * Joins the shapes into an arrow name.
 * @throws RangeError (`TSG_ERR_INVALID_ARROW`) if a shape is not one of
 * Graphviz's, there are none or more than four, or the last of two or more
 * is `none`.
 * @internal
 */
export function buildArrow(names: readonly unknown[]): string {
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
  return names.join('');
}
