import { type HTMLLikeValue, htmlLike, ownOptions } from '@ts-graphviz/common';

/**
 * Default maximum allowed recursion depth to prevent stack overflow attacks.
 */
const DEFAULT_MAX_RECURSION_DEPTH = 1000;

/**
 * What one node of a label's source is, as its renderer tells it. The
 * sources below it (`children`, `items`) are told in their turn.
 */
type LabelStep =
  /** Nothing. */
  | { kind: 'empty' }
  /** Text; it is escaped. */
  | { kind: 'text'; text: string }
  /** An element of HTML-like labels, by its name or its `dot:` name. */
  | {
      kind: 'element';
      type: string;
      props: Record<string, unknown>;
      children: unknown;
    }
  /** Children in a row. */
  | { kind: 'list'; items: readonly unknown[] }
  /**
   * Something that stands for other sources (a component, a fragment);
   * `children` is called when the walk gets there, with the providers above
   * it in place.
   */
  | { kind: 'group'; children(): unknown }
  /** A provider of a label context, for what is in `children`. */
  | { kind: 'provider'; provider: object; value: unknown; children: unknown };

/** Tells what a node of a label's source is; throws for what cannot be one. */
export type LabelResolver = (source: unknown) => LabelStep;

/** An element of a label, with its attributes and children. */
interface LabelElement {
  type: string;
  props?: Record<string, unknown>;
  children?: readonly LabelNode[];
}

/** A label as plain data: elements, and strings for text. */
export type LabelNode = string | LabelElement;

/** The default value of each context, by its provider. */
const defaultValues = new WeakMap<object, unknown>();

/**
 * The values the providers of the label being converted give, innermost
 * last, by provider; `undefined` while no label is converted.
 */
let provided: Map<object, unknown[]> | undefined;

/**
 * Make `provider` stand for a label context with this default value. A
 * renderer has its own form of a context; what it shares is this object,
 * which its resolver names in a `provider` step.
 */
export function registerLabelProvider(
  provider: object,
  defaultValue: unknown,
): void {
  defaultValues.set(provider, defaultValue);
}

/** Whether `value` was given to {@link registerLabelProvider}. */
export function isLabelProvider(value: unknown): boolean {
  return (
    (typeof value === 'function' ||
      (typeof value === 'object' && value !== null)) &&
    defaultValues.has(value)
  );
}

/** Whether a label is being converted. */
export function isConvertingLabel(): boolean {
  return provided !== undefined;
}

/**
 * The value of the nearest provider above the place the walk is at, or the
 * default value of the context.
 */
export function readLabelProvider(provider: object): unknown {
  const values = provided?.get(provider);
  return values === undefined || values.length === 0
    ? defaultValues.get(provider)
    : values[values.length - 1];
}

/**
 * Map of the dot: prefixed elements to the elements of Graphviz's HTML-like
 * labels.
 *
 * @see {@link https://graphviz.org/doc/info/shapes.html#html HTML-Like Labels}
 */
const DOT_ELEMENT_MAP = {
  'dot:table': 'table',
  'dot:tr': 'tr',
  'dot:td': 'td',
  'dot:font': 'font',
  'dot:br': 'br',
  'dot:img': 'img',
  'dot:i': 'i',
  'dot:b': 'b',
  'dot:u': 'u',
  'dot:o': 'o',
  'dot:sub': 'sub',
  'dot:sup': 'sup',
  'dot:s': 's',
  'dot:hr': 'hr',
  'dot:vr': 'vr',
} as const;

const ELEMENTS: ReadonlySet<string> = new Set(Object.values(DOT_ELEMENT_MAP));

/** An attribute name of Graphviz's HTML-like labels (`point-size`, …). */
const ATTRIBUTE_NAME = /^[A-Za-z][A-Za-z0-9_-]*$/;

/** Props renderers use themselves; they are not attributes. */
const RENDERER_PROPS: ReadonlySet<string> = new Set(['children', 'key', 'ref']);

/** Text: `&`, `<` and `>` as entities, so a string is never markup. */
function escapeText(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

/** An attribute value: text that also cannot end the quoted value. */
function escapeAttribute(value: string): string {
  return escapeText(value).replaceAll('"', '&quot;');
}

/** The element name of an element type, or a TypeError. */
function elementName(type: string): string {
  // Own entries only: a name inherited from Object.prototype is not one.
  const name = Object.hasOwn(DOT_ELEMENT_MAP, type)
    ? DOT_ELEMENT_MAP[type as keyof typeof DOT_ELEMENT_MAP]
    : type.toLowerCase();
  if (!ELEMENTS.has(name)) {
    throw new TypeError(
      type === 'dot:port'
        ? '<dot:port> is not an element of HTML-like labels; set a port with the port attribute of <dot:table> or <dot:td>.'
        : `<${type}> is not an element of HTML-like labels.`,
    );
  }
  return name;
}

/** The attributes of an element, as they are written after its name. */
function attributesOf(props: Record<string, unknown>): string {
  let attributes = '';
  for (const [key, value] of Object.entries(props)) {
    if (RENDERER_PROPS.has(key) || value == null || value === false) {
      continue;
    }
    if (!ATTRIBUTE_NAME.test(key)) {
      throw new TypeError(
        `${JSON.stringify(key)} is not an attribute name of HTML-like labels.`,
      );
    }
    if (value === true) {
      attributes += ` ${key}`;
    } else if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'bigint'
    ) {
      attributes += ` ${key}="${escapeAttribute(String(value))}"`;
    }
  }
  return attributes;
}

/** One conversion: its resolver, its limit, and the sources it is inside. */
interface Walk {
  resolve: LabelResolver;
  maxDepth: number;
  /** The sources on the way down to here (for circular reference detection). */
  inStack: WeakSet<object>;
  provided: Map<object, unknown[]>;
}

/**
 * Go one level down, into `source`: the depth is limited, to prevent stack
 * overflow from deeply nested structures, and a source is not entered while
 * it is being walked.
 */
function inside(
  walk: Walk,
  source: unknown,
  depth: number,
  body: () => string,
): string {
  if (depth >= walk.maxDepth) {
    throw new RangeError(
      `Maximum rendering depth of ${walk.maxDepth} exceeded. This may indicate deeply nested or circular element structures.`,
    );
  }
  // Only what is passed by reference can come up again.
  const tracked =
    (typeof source === 'object' && source !== null) ||
    typeof source === 'function'
      ? source
      : undefined;
  if (tracked !== undefined) {
    // Only true cycles: the same source twice side by side is not one.
    if (walk.inStack.has(tracked)) {
      throw new TypeError(
        'Circular reference detected in the element tree of a label. Cannot render elements that reference themselves.',
      );
    }
    walk.inStack.add(tracked);
  }
  try {
    return body();
  } finally {
    if (tracked !== undefined) walk.inStack.delete(tracked);
  }
}

function writeStep(
  walk: Walk,
  step: LabelStep,
  source: unknown,
  depth: number,
): string {
  switch (step.kind) {
    case 'empty':
      return '';
    case 'text':
      return escapeText(step.text);
    case 'list':
      return inside(walk, source, depth, () => {
        let written = '';
        for (const item of step.items) {
          const next = walk.resolve(item);
          // A list in a list counts toward the depth, like an element.
          written += writeStep(
            walk,
            next,
            item,
            next.kind === 'list' ? depth + 1 : depth,
          );
        }
        return written;
      });
    case 'group':
      return inside(walk, source, depth, () =>
        write(walk, step.children(), depth + 1),
      );
    case 'provider':
      return inside(walk, source, depth, () => {
        let values = walk.provided.get(step.provider);
        if (values === undefined) {
          values = [];
          walk.provided.set(step.provider, values);
        }
        values.push(step.value);
        try {
          return write(walk, step.children, depth + 1);
        } finally {
          values.pop();
        }
      });
    case 'element':
      return inside(walk, source, depth, () => {
        const name = elementName(step.type);
        // Own props only: an attribute inherited from Object.prototype is
        // not part of the element.
        const attributes = attributesOf(ownOptions(step.props));
        const children = write(walk, step.children, depth + 1);
        return `<${name}${attributes}>${children}</${name}>`;
      });
  }
}

function write(walk: Walk, source: unknown, depth: number): string {
  return writeStep(walk, walk.resolve(source), source, depth);
}

/**
 * Convert the source of a label into an HTML-like label.
 *
 * The source is what a renderer has for a label (its elements); `resolve`
 * tells, node by node, what it stands for. Text, as children or as
 * attribute values, is escaped: `&`, `<`, `>` (and `"` in attributes) are
 * written as entities, so they cannot add markup.
 *
 * @param maxDepth - Maximum allowed depth of the source. Default: 1000.
 * @throws {TypeError} An element that HTML-like labels do not have, an
 * attribute name that is not a name, or a circular source.
 * @throws {RangeError} A source deeper than `maxDepth`.
 * @throws Whatever `resolve` throws.
 */
export function htmlLikeFromSource(
  source: unknown,
  resolve: LabelResolver,
  maxDepth?: number,
): HTMLLikeValue {
  let limit = DEFAULT_MAX_RECURSION_DEPTH;
  if (maxDepth != null && Number.isFinite(maxDepth) && maxDepth > 0) {
    // Use Math.floor to ensure integer
    limit = Math.floor(maxDepth);
  }
  // A label converted while another is (by one of its components) starts
  // with no providers above it.
  const outer = provided;
  const walk: Walk = {
    resolve,
    maxDepth: limit,
    inStack: new WeakSet(),
    provided: new Map(),
  };
  provided = walk.provided;
  try {
    return htmlLike(write(walk, source, 0));
  } finally {
    provided = outer;
  }
}

/** What a node of a label given as plain data is. */
const resolveNode: LabelResolver = (source) => {
  if (typeof source === 'string') return { kind: 'text', text: source };
  if (Array.isArray(source)) return { kind: 'list', items: source };
  if (typeof source === 'object' && source !== null) {
    // Own properties only, as for options.
    const { type, props, children } = ownOptions(
      source as Record<string, unknown>,
    );
    if (typeof type === 'string') {
      return {
        kind: 'element',
        type,
        props: (props ?? {}) as Record<string, unknown>,
        // Absent children are no text, and no level more of depth.
        children: children ?? '',
      };
    }
  }
  throw new TypeError(
    'A node of a label is a string, or an object with the type of an element.',
  );
};

/**
 * Convert a label given as plain data into an HTML-like label, as
 * {@link htmlLikeFromSource} does for the source of a renderer.
 */
export function htmlLikeFromTree(
  label: LabelNode,
  maxDepth?: number,
): HTMLLikeValue {
  return htmlLikeFromSource(label, resolveNode, maxDepth);
}
