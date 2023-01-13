import { Layout, Options } from '../types/index.js';

function* args<T extends Layout>(options: Options<T>): Generator<string> {
  const { suppressWarnings = true, format = 'svg', attributes = {}, library = [], y = false, scale } = options;
  if (suppressWarnings) yield '-q';
  yield `-T${format}`;
  if (attributes.graph) {
    for (const [key, value] of Object.entries(attributes.graph)) {
      if (value === true) yield `-G${key}`;
      else yield `-G${key}="${value}"`;
    }
  }
  if (attributes.node) {
    for (const [key, value] of Object.entries(attributes.node)) {
      if (value === true) yield `-N${key}`;
      else yield `-N${key}="${value}"`;
    }
  }
  if (attributes.edge) {
    for (const [key, value] of Object.entries(attributes.edge)) {
      if (value === true) yield `-E${key}`;
      else yield `-E${key}="${value}"`;
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

export function commandBuilder<T extends Layout>(options: Options<T>): [command: string, args: string[]] {
  return [options.dotCommand ?? 'dot', Array.from(args(options))];
}
