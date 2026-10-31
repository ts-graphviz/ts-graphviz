import {
  type Attribute,
  type AttributeKey,
  ownOptions,
} from '@ts-graphviz/common';
import type { AnyOptions } from './options.js';

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
export function escapeValue<T extends AttributeKey>(
  value: Attribute<T>,
): string {
  if (value === true) return '';
  return `=${value}`;
}

/**
 * The `-G` / `-N` / `-E` arguments of `attributes`, without the leading
 * `-G` / `-N` / `-E`: exactly the text Graphviz gets. The command line and
 * the check of `options.attributes` (see `sourceToRender`) both use these.
 * @internal
 */
export function* attributeArgs(
  attributes: AnyOptions['attributes'],
): Generator<[flag: 'G' | 'N' | 'E', arg: string]> {
  // Own properties only, also when no attributes are given (#1757).
  const { graph, node, edge } = ownOptions(attributes);
  for (const [flag, record] of [
    ['G', graph],
    ['N', node],
    ['E', edge],
  ] as const) {
    if (!record) continue;
    for (const [key, value] of Object.entries(record)) {
      yield [flag, `${key}${escapeValue(value as Attribute<AttributeKey>)}`];
    }
  }
}

/**
 * createCommandArgs is a function that creates command arguments from a given Options object.
 * It reads the properties of the Options object and creates corresponding command line arguments accordingly.
 *
 * @param options The Options object used to create command arguments
 * @returns A generator that yields strings for command arguments
 */
export function* createCommandArgs(options: AnyOptions): Generator<string> {
  // Own properties only, whoever calls this (#1757).
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
  for (const [flag, arg] of attributeArgs(attributes)) yield `-${flag}${arg}`;
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
        // Graphviz defaults: grid on (`-Lg` turns it off), old attractive
        // force off (`-LO` turns it on). Only emit a flag when the option
        // differs, one `-L` argument per flag (Graphviz reads one per `-L`).
        if (grid === false) yield '-Lg';
        if (oldAttractive === true) yield '-LO';
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
