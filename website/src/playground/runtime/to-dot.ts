import { isRootGraphModel, modelOf, toDot } from 'ts-graphviz';
import type { Evaluation } from './evaluate';

/**
 * Pick the graph a script produced and render it as DOT.
 *
 * A script produces its graph either as the value of its last expression
 * (`digraph('G', (g) => { … })`) or as its default export. Either can be a
 * graph (its DSL or its model) or a DOT string; the default export wins
 * when both exist.
 */
export function resultToDot({ completion, exports }: Evaluation): string {
  const value = exports.default !== undefined ? exports.default : completion;
  if (typeof value === 'string') {
    return value;
  }
  // digraph(…) gives the graph's DSL; the model is under it.
  const model = modelOf(value);
  if (isRootGraphModel(model)) {
    return toDot(model);
  }
  throw new TypeError(
    value === undefined
      ? 'The script did not produce a graph. End it with an expression such as digraph(…), or export default a graph or a DOT string.'
      : `The script produced ${describeValue(value)}, not a graph. End it with an expression such as digraph(…), or export default a graph or a DOT string.`,
  );
}

function describeValue(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'an array';
  if (typeof value === 'object') return 'an object';
  return `a ${typeof value}`;
}
