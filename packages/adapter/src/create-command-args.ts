import type { Attribute, AttributeKey } from '@ts-graphviz/common';
import type { Layout, Options } from './types.js';

/**
 * escapeValue is a function that escapes a given Attribute value of a given AttributeKey.
 * It checks the type of the value and adds quotes if the value is of type string and contains whitespace.
 *
 * @param value The value of an Attribute of type T that extends AttributeKey
 * @returns The escaped Attribute value
 */
/**
 * The `=value` part of a `-G`/`-N`/`-E` argument.
 *
 * The arguments reach Graphviz as an argv array (no shell), and Graphviz takes
 * the text after `=` verbatim, so the value needs no quoting or escaping:
 * `-Glabel=a b` sets the label to `a b`, and a quote in the value is just a
 * quote. `true` is written as a bare key (`-Gcenter`).
 */
export function escapeValue<T extends AttributeKey>(value: Attribute<T>) {
  if (value === true) return '';
  return `=${value}`;
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
  const {
    suppressWarnings = true,
    format = 'svg',
    attributes = {},
    library = [],
    y = false,
    scale,
  } = options;
  if (suppressWarnings) yield '-q';
  yield `-T${format}`;
  if (attributes.graph) {
    for (const [key, value] of Object.entries(attributes.graph)) {
      yield `-G${key}${escapeValue(value)}`;
    }
  }
  if (attributes.node) {
    for (const [key, value] of Object.entries(attributes.node)) {
      yield `-N${key}${escapeValue(value)}`;
    }
  }
  if (attributes.edge) {
    for (const [key, value] of Object.entries(attributes.edge)) {
      yield `-E${key}${escapeValue(value)}`;
    }
  }
  if (typeof scale === 'number' && !Number.isNaN(scale)) yield `-s${scale}`;
  if (Array.isArray(library)) for (const lib of library) yield `-l${lib}`;
  if (y === true) yield '-y';

  if (typeof options.layout === 'string') {
    yield `-K${options.layout}`;
    switch (options.layout) {
      case 'neato': {
        const { reduce, noop } = options;
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
        } = options;
        // Graphviz defaults: grid on (`-Lg` turns it off), old attractive
        // force off (`-LO` turns it on). Only emit the flag when it differs.
        const flags = `${grid === false ? 'g' : ''}${oldAttractive === true ? 'O' : ''}`;
        if (flags) yield `-L${flags}`;
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
