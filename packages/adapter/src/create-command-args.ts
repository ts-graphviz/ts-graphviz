import type { Attribute, AttributeKey } from '@ts-graphviz/common';
import { ownOptions } from './own-options.js';
import type { Layout, Options } from './types.js';

/**
 * Serializes an attribute value for a Graphviz argv option.
 * spawn passes arguments directly, so shell-style quoting would become part of the value.
 * Double backslashes to keep Graphviz label escape sequences literal.
 *
 * @param value The value of an Attribute of type T that extends AttributeKey
 * @returns The attribute value prefixed by =, or an empty string for true
 */
export function escapeValue<T extends AttributeKey>(value: Attribute<T>) {
  return value === true
    ? ''
    : `=${typeof value === 'string' ? value.replace(/\\/g, '\\\\') : value}`;
}

/**
 * createCommandArgs is a function that creates command arguments from a given Options object.
 * It reads the properties of the Options object and creates corresponding command line arguments accordingly.
 *
 * @param options The Options object used to create command arguments
 * @returns A generator that yields strings for command arguments
 */
export function* createCommandArgs<T extends Layout>(
  options: Options<T>,
): Generator<string> {
  const own = ownOptions(options);
  const {
    suppressWarnings = true,
    format = 'svg',
    attributes,
    library = [],
    y = false,
    scale,
  } = own;
  if (suppressWarnings) yield '-q';
  yield `-T${format}`;
  const { graph, node, edge } = ownOptions(attributes);
  if (graph) {
    for (const [key, value] of Object.entries(graph)) {
      yield `-G${key}${escapeValue(value)}`;
    }
  }
  if (node) {
    for (const [key, value] of Object.entries(node)) {
      yield `-N${key}${escapeValue(value)}`;
    }
  }
  if (edge) {
    for (const [key, value] of Object.entries(edge)) {
      yield `-E${key}${escapeValue(value)}`;
    }
  }
  if (typeof scale === 'number' && !Number.isNaN(scale)) yield `-s${scale}`;
  // Own elements only: a hole would read an inherited index.
  if (Array.isArray(library)) {
    for (let i = 0; i < library.length; i++) {
      if (Object.hasOwn(library, i)) yield `-l${library[i]}`;
    }
  }
  if (y === true) yield '-y';

  if (typeof own.layout === 'string') {
    yield `-K${own.layout}`;
    switch (own.layout) {
      case 'neato': {
        const { reduce, noop } = own;
        if (reduce === true) yield '-x';
        if (typeof noop === 'number') yield `-n${noop}`;
        break;
      }
      case 'fdp': {
        const {
          grid,
          oldAttractive,
          iterations,
          unscaledFactor,
          overlapExpansionFactor,
          temperature,
        } = own;
        yield ['-L', grid ? '' : 'g', oldAttractive ? 'O' : ''].join('');
        if (typeof iterations === 'number') yield `-Ln${iterations}`;
        if (typeof unscaledFactor === 'number') yield `-LU${unscaledFactor}`;
        if (typeof overlapExpansionFactor === 'number')
          yield `-LC${overlapExpansionFactor}`;
        if (typeof temperature === 'number') yield `-LT${temperature}`;
        break;
      }
      default:
        break;
    }
  }
}
