import { ownOptions, withCode } from '@ts-graphviz/common';
import { isFormat, isLayout } from './formats.js';
import type {
  CommonOptions,
  FdpOptions,
  NeatoOptions,
  OtherOptions,
} from './types.js';

/**
 * The options as the adapter reads them once the public signature has
 * checked the call: any custom format; a custom layout is read as a
 * `Layout` (it gets no layout-specific arguments).
 */
export type AnyOptions = CommonOptions<string> &
  (NeatoOptions | FdpOptions | OtherOptions);

/**
 * The options as given, without anything inherited, and checked: the options
 * object, its `attributes` (and their `graph` / `node` / `edge` records) and
 * a `sanitize` options object are read from their own properties only, so a
 * polluted `Object.prototype` cannot choose the command, turn `sanitize` off
 * or add arguments (#1757); then every option is checked by
 * {@link checkOptions}, so nothing reaches the command line that its type
 * does not allow.
 *
 * @throws `TypeError` or `RangeError` with `code` `TSG_ERR_INVALID_OPTION`.
 */
export function ownAdapterOptions(options: AnyOptions | undefined): AnyOptions {
  if (options !== undefined) {
    expectObject(options, 'options');
  }
  const own = ownOptions(options);
  if (own.attributes !== undefined) {
    expectObject(own.attributes, 'attributes');
    const { graph, node, edge } = ownOptions(own.attributes);
    // Shapes first: copying a record runs its getters.
    for (const [list, record] of [
      ['graph', graph],
      ['node', node],
      ['edge', edge],
    ] as const) {
      if (record !== undefined) expectObject(record, `attributes.${list}`);
    }
    own.attributes = ownOptions({
      ...(graph !== undefined && { graph: ownOptions(graph) }),
      ...(node !== undefined && { node: ownOptions(node) }),
      ...(edge !== undefined && { edge: ownOptions(edge) }),
    });
  }
  // Copies of the elements the arrays own (a hole would read an inherited
  // index), read once: the copy is what is checked and used.
  for (const key of ['library', 'customFormats', 'customLayouts'] as const) {
    const list: unknown = own[key];
    if (Array.isArray(list)) {
      const copy: unknown[] = [];
      for (let i = 0; i < list.length; i++) {
        if (Object.hasOwn(list, i)) copy.push(list[i]);
      }
      (own as Record<string, unknown>)[key] = copy;
    }
  }
  if (typeof own.sanitize === 'object' && own.sanitize !== null) {
    expectObject(own.sanitize, 'sanitize');
    own.sanitize = ownOptions(own.sanitize);
  }
  checkOptions(own);
  return own;
}

function invalidType(message: string): TypeError {
  return withCode(new TypeError(message), 'TSG_ERR_INVALID_OPTION');
}

function invalidValue(message: string): RangeError {
  return withCode(new RangeError(message), 'TSG_ERR_INVALID_OPTION');
}

/**
 * For messages: the value, as far as it can be shown without running code
 * of its own (no `String()` on objects) and at a bounded length.
 */
function show(value: unknown): string {
  if (typeof value === 'string') {
    return value.length > 64
      ? `${JSON.stringify(value.slice(0, 64))}…`
      : JSON.stringify(value);
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'an array';
  return `a value of type ${typeof value}`;
}

function expectObject(value: unknown, name: string): void {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw invalidType(`${name} must be an object, not ${show(value)}.`);
  }
}

function expectBoolean(value: unknown, name: string): void {
  if (value !== undefined && typeof value !== 'boolean') {
    throw invalidType(`${name} must be a boolean, not ${show(value)}.`);
  }
}

/**
 * `value` must be undefined, or a number that is finite (unless
 * `infinite`), at least `min` (or above it, with `exclusive`), and an
 * integer when `integer` is set.
 */
function expectNumber(
  value: unknown,
  name: string,
  range: {
    min: number;
    exclusive?: boolean;
    integer?: boolean;
    infinite?: boolean;
  },
): void {
  if (value === undefined) return;
  if (typeof value !== 'number') {
    throw invalidType(`${name} must be a number, not ${show(value)}.`);
  }
  const {
    min,
    exclusive = false,
    integer = false,
    infinite = false,
  } = ownOptions(range);
  const ok =
    (infinite ? value === Number.POSITIVE_INFINITY : false) ||
    (Number.isFinite(value) &&
      (exclusive ? value > min : value >= min) &&
      (!integer || Number.isInteger(value)));
  if (!ok) {
    const what = [
      infinite ? undefined : 'finite',
      integer ? 'integer' : 'number',
    ]
      .filter(Boolean)
      .join(' ');
    throw invalidValue(
      `${name} must be a ${what} ${exclusive ? 'greater than' : 'of at least'} ${min}, not ${show(value)}.`,
    );
  }
}

/** One `-G` / `-N` / `-E` key: Graphviz splits its argument at the first `=`. */
function checkAttributeKey(key: string, name: string): void {
  if (key === '' || key.includes('=') || key.includes('\0')) {
    throw invalidValue(
      `${name} has the key ${show(key)}: an attribute name must not be empty or contain "=" or a NUL character.`,
    );
  }
}

/**
 * One `-G` / `-N` / `-E` value: a string, a finite number or a boolean, the
 * values Graphviz can take on its command line. `escString()` and
 * `htmlLike()` values cannot be given there; put them in the DOT source.
 */
function checkAttributeValue(value: unknown, name: string): void {
  if (typeof value === 'boolean') return;
  if (typeof value === 'string') {
    if (value.includes('\0')) {
      throw invalidValue(`${name} must not contain a NUL character.`);
    }
    return;
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw invalidValue(`${name} must be finite, not ${show(value)}.`);
    }
    return;
  }
  throw invalidType(
    `${name} must be a string, a finite number or a boolean, not ${show(value)}.`,
  );
}

/** The parser limits of a `sanitize` options object, as `@ts-graphviz/ast` reads them. */
const DEPTH_LIMITS = [
  'maxHtmlNestingDepth',
  'maxEdgeChainDepth',
  'maxNestingDepth',
] as const;
const SIZE_LIMITS = ['maxInputSize', 'maxASTNodes'] as const;

/**
 * Check every option that is data at run time: TypeScript types are not a
 * security boundary, and options such as `format` are often chosen by a
 * request.
 *
 * - `format` and `layout` must be exactly one of the documented names (see
 *   `isFormat` / `isLayout`); a `:renderer` suffix is not accepted.
 * - `attributes` must hold records of attribute names (non-empty, without
 *   `=` or NUL) to strings, finite numbers or booleans.
 * - The numeric options must be numbers in their range, the flags booleans.
 * - `sanitize` must be a boolean or an options object; its parser limits
 *   must be non-negative numbers (depth limits finite) and `policy` one of
 *   `'default'` / `'strict'`.
 * - `dotCommand`, `library`, `customFormats` and `customLayouts` are
 *   configuration, not data: they are only checked to be a non-empty string
 *   and arrays of strings (non-empty, without NUL, for the custom names), so
 *   a value of another type is rejected rather than converted.
 *
 * `maxOutputSize` is checked by `outputLimit`.
 */
function checkOptions(own: AnyOptions): void {
  const options = own as Record<string, unknown>;
  const {
    format,
    layout,
    dotCommand,
    library,
    customFormats,
    customLayouts,
    attributes,
    sanitize,
  } = ownOptions(options);

  // Configuration first: the custom names widen what format and layout may be.
  expectNames(customFormats, 'customFormats');
  expectNames(customLayouts, 'customLayouts');

  if (
    format !== undefined &&
    !isFormat(format) &&
    !(customFormats as string[] | undefined)?.includes(format as string)
  ) {
    if (typeof format !== 'string') {
      throw invalidType(`format must be a string, not ${show(format)}.`);
    }
    throw invalidValue(
      `format must be one of the documented output formats (without a ":renderer" suffix) or of customFormats, not ${show(format)}.`,
    );
  }
  if (
    layout !== undefined &&
    !isLayout(layout) &&
    !(customLayouts as string[] | undefined)?.includes(layout as string)
  ) {
    if (typeof layout !== 'string') {
      throw invalidType(`layout must be a string, not ${show(layout)}.`);
    }
    throw invalidValue(
      `layout must be one of the documented layout engines or of customLayouts, not ${show(layout)}.`,
    );
  }

  for (const flag of [
    'suppressWarnings',
    'y',
    'reduce',
    'grid',
    'oldAttractive',
  ]) {
    expectBoolean(options[flag], flag);
  }
  expectNumber(options.scale, 'scale', { min: 0, exclusive: true });
  expectNumber(options.noop, 'noop', { min: 0, integer: true });
  expectNumber(options.iterations, 'iterations', { min: 0, integer: true });
  for (const factor of [
    'unscaledFactor',
    'overlapExpansionFactor',
    'temperature',
  ]) {
    expectNumber(options[factor], factor, { min: 0 });
  }

  if (attributes !== undefined) {
    for (const [list, record] of Object.entries(
      attributes as Record<string, Record<string, unknown> | undefined>,
    )) {
      if (record === undefined) continue;
      for (const [key, value] of Object.entries(record)) {
        const name = `attributes.${list}`;
        checkAttributeKey(key, name);
        checkAttributeValue(value, `${name}[${show(key)}]`);
      }
    }
  }

  if (sanitize !== undefined && typeof sanitize !== 'boolean') {
    expectObject(sanitize, 'sanitize');
    const limits = sanitize as Record<string, unknown>;
    for (const limit of DEPTH_LIMITS) {
      expectNumber(limits[limit], `sanitize.${limit}`, { min: 0 });
    }
    for (const limit of SIZE_LIMITS) {
      expectNumber(limits[limit], `sanitize.${limit}`, {
        min: 0,
        infinite: true,
      });
    }
    const { policy } = limits;
    if (policy !== undefined && policy !== 'default' && policy !== 'strict') {
      throw invalidValue(
        `sanitize.policy must be "default" or "strict", not ${show(policy)}.`,
      );
    }
  }

  // Configuration: trusted, but never converted from another type.
  if (
    dotCommand !== undefined &&
    (typeof dotCommand !== 'string' || dotCommand === '')
  ) {
    throw invalidType(
      `dotCommand must be a non-empty string, not ${show(dotCommand)}.`,
    );
  }
  if (library !== undefined) {
    if (!Array.isArray(library)) {
      throw invalidType(
        `library must be an array of strings, not ${show(library)}.`,
      );
    }
    for (let i = 0; i < library.length; i++) {
      if (Object.hasOwn(library, i) && typeof library[i] !== 'string') {
        throw invalidType(
          `library[${i}] must be a string, not ${show(library[i])}.`,
        );
      }
    }
  }
}

/**
 * `customFormats` / `customLayouts`: trusted configuration naming formats or
 * layout engines a plugin adds. Each name must be a non-empty string without
 * a NUL character; nothing else is checked.
 */
function expectNames(names: unknown, name: string): void {
  if (names === undefined) return;
  if (!Array.isArray(names)) {
    throw invalidType(
      `${name} must be an array of strings, not ${show(names)}.`,
    );
  }
  for (let i = 0; i < names.length; i++) {
    const value: unknown = names[i];
    if (typeof value !== 'string') {
      throw invalidType(`${name}[${i}] must be a string, not ${show(value)}.`);
    }
    if (value === '' || value.includes('\0')) {
      throw invalidValue(
        `${name}[${i}] must be a non-empty string without a NUL character, not ${show(value)}.`,
      );
    }
  }
}
