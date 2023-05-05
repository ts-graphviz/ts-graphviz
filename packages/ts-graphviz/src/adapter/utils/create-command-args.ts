import { Attribute, AttributeKey } from '../../common/index.js';
import { Layout, Options } from '../types/index.js';

/**
 * escapeValue is a function that escapes a given Attribute value of a given AttributeKey.
 * It checks the type of the value and adds quotes if the value is of type string and contains whitespace.
 *
 * @param value The value of an Attribute of type T that extends AttributeKey
 * @returns The escaped Attribute value
 */
export function escapeValue<T extends AttributeKey>(value: Attribute<T>) {
  if (value !== true) {
    if (typeof value === 'string' && /\s/g.test(value)) {
      return `="${value}"`;
    } else {
      return `=${value}`;
    }
  }
  return '';
}

/**
 * createCommandArgs is a function that creates command arguments from a given Options object.
 * It reads the properties of the Options object and creates corresponding command line arguments accordingly.
 *
 * @param options The Options object used to create command arguments
 * @returns A generator that yields strings for command arguments
 */
export function* createCommandArgs<T extends Layout>(options: Options<T>): Generator<string> {
  const { suppressWarnings = true, format = 'svg', attributes = {}, library = [], y = false, scale } = options;
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
  if (y === true) yield `-y`;

  if (typeof options.layout === 'string') {
    yield `-K${options.layout}`;
    switch (options.layout) {
      case 'neato':
        const { reduce, noop } = options;
        if (reduce === true) yield '-x';
        if (typeof noop === 'number') yield `-n${noop}`;
        break;
      case 'fdp':
        const { grid, oldAttractive, iterations, unscaledFactor, overlapExpansionFactor, temperature } = options;
        yield ['-L', grid ? '' : 'g', oldAttractive ? 'O' : ''].join('');
        if (typeof iterations === 'number') yield `-Ln${iterations}`;
        if (typeof unscaledFactor === 'number') yield `-LU${unscaledFactor}`;
        if (typeof overlapExpansionFactor === 'number') yield `-LC${overlapExpansionFactor}`;
        if (typeof temperature === 'number') yield `-LT${temperature}`;
      default:
        break;
    }
  }
}
