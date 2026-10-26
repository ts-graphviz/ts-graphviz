import { type HTMLLikeValue, htmlLike, ownOptions } from '@ts-graphviz/common';
import {
  Fragment,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react';

/**
 * Default maximum allowed recursion depth to prevent stack overflow attacks.
 */
const DEFAULT_MAX_RECURSION_DEPTH = 1000;

/**
 * Options for controlling the rendering behavior.
 */
export interface RenderHTMLLikeOptions {
  /**
   * Maximum allowed recursion depth to prevent stack overflow attacks.
   * @default 1000
   */
  maxDepth?: number;
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

/** Props React uses itself; they are not attributes. */
const REACT_PROPS: ReadonlySet<string> = new Set(['children', 'key', 'ref']);

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

/** The element name of an intrinsic element, or a TypeError. */
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

/**
 * Manually traverse and render React element tree.
 * @param element - React element to render
 * @param depth - Current recursion depth (for stack overflow prevention)
 * @param inStack - Set of elements currently in the call stack (for circular reference detection)
 * @param maxDepth - Maximum allowed recursion depth
 */
function manuallyRenderElement(
  element: ReactElement,
  depth: number,
  inStack: WeakSet<object>,
  maxDepth: number,
): string {
  // Prevent stack overflow from deeply nested structures
  if (depth >= maxDepth) {
    throw new RangeError(
      `Maximum rendering depth of ${maxDepth} exceeded. This may indicate deeply nested or circular element structures.`,
    );
  }

  // Prevent circular reference attacks (only detect true recursion cycles)
  if (inStack.has(element)) {
    throw new TypeError(
      'Circular reference detected in React element tree. Cannot render elements that reference themselves.',
    );
  }

  // Add to stack for this recursion branch
  inStack.add(element);

  try {
    const { type } = element;
    // props is typed as unknown for function components
    // Own props only: `children` or an attribute inherited from
    // Object.prototype is not part of the element.
    const props = ownOptions((element.props ?? {}) as Record<string, unknown>);

    if (type === Fragment) {
      return renderChildrenToString(
        props.children as ReactNode,
        depth + 1,
        inStack,
        maxDepth,
      );
    }

    // Function and class components render to another element; their
    // errors are the caller's.
    if (typeof type === 'function') {
      const result: ReactNode = type.prototype?.render
        ? new (type as any)(props).render()
        : (type as any)(props);
      return renderChildrenToString(result, depth + 1, inStack, maxDepth);
    }

    if (typeof type !== 'string') {
      throw new TypeError(
        'Only dot: elements, fragments and components can be rendered to an HTML-like label.',
      );
    }

    const tagName = elementName(type);
    let attributes = '';
    for (const [key, value] of Object.entries(props)) {
      if (REACT_PROPS.has(key) || value == null || value === false) {
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

    const childrenString = renderChildrenToString(
      props.children as ReactNode,
      depth + 1,
      inStack,
      maxDepth,
    );
    return `<${tagName}${attributes}>${childrenString}</${tagName}>`;
  } finally {
    // Remove from stack when exiting this recursion branch
    inStack.delete(element);
  }
}

/**
 * Safely renders React children to string.
 * @param children - React children to render
 * @param depth - Current recursion depth (for stack overflow prevention)
 * @param inStack - Set of elements currently in the call stack (for circular reference detection)
 * @param maxDepth - Maximum allowed recursion depth
 */
function renderChildrenToString(
  children: ReactNode,
  depth: number,
  inStack: WeakSet<object>,
  maxDepth: number,
): string {
  if (children == null || typeof children === 'boolean') {
    return '';
  }
  // Text, as React renders strings, numbers and bigints.
  if (
    typeof children === 'string' ||
    typeof children === 'number' ||
    typeof children === 'bigint'
  ) {
    return escapeText(String(children));
  }
  if (isValidElement(children)) {
    return manuallyRenderElement(children, depth, inStack, maxDepth);
  }
  if (Array.isArray(children)) {
    // An array in an array counts toward the depth, like an element.
    if (depth >= maxDepth) {
      throw new RangeError(
        `Maximum rendering depth of ${maxDepth} exceeded. This may indicate deeply nested or circular element structures.`,
      );
    }
    if (inStack.has(children)) {
      throw new TypeError(
        'Circular reference detected in React element tree. Cannot render elements that reference themselves.',
      );
    }
    inStack.add(children);
    try {
      return children
        .map((child) =>
          renderChildrenToString(
            child,
            Array.isArray(child) ? depth + 1 : depth,
            inStack,
            maxDepth,
          ),
        )
        .join('');
    } finally {
      inStack.delete(children);
    }
  }
  throw new TypeError(
    'Only elements, strings, numbers, bigints, booleans, null and arrays of them can be children of an HTML-like label.',
  );
}

/**
 * Converts a React element into an HTML-like label.
 *
 * `dot:`-prefixed elements become the elements of Graphviz's HTML-like
 * labels (`<dot:table>` → `<table>`). Strings and numbers, as children or as
 * attribute values, are text: `&`, `<`, `>` (and `"` in attributes) are
 * written as entities, so they cannot add markup. If no {@link label} is
 * provided, returns an empty label (`<>`).
 *
 * @param label - Optional React element to render.
 * @param options - Optional rendering options.
 * @returns The HTML-like label.
 * @throws {TypeError} An element that HTML-like labels do not have (such as
 * `<div>` or `<dot:port>`), an attribute name that is not a name, or a
 * circular element tree.
 * @throws {RangeError} An element tree deeper than `maxDepth`.
 * @throws Whatever a component throws while rendering.
 *
 * @example
 * ```tsx
 * // Default behavior (max depth: 1000)
 * renderHTMLLike(<dot:b>Hello</dot:b>);
 *
 * // Custom max depth for deeply nested structures
 * renderHTMLLike(<dot:table>...</dot:table>, { maxDepth: 5000 });
 * ```
 */
export function renderHTMLLike(
  label?: ReactElement,
  options?: RenderHTMLLikeOptions,
): HTMLLikeValue {
  if (!label) {
    return htmlLike('');
  }

  // Own properties only: an inherited one is never an option (#1757).
  const requested = ownOptions(options).maxDepth;
  let maxDepth = DEFAULT_MAX_RECURSION_DEPTH;
  if (requested != null && Number.isFinite(requested) && requested > 0) {
    // Use Math.floor to ensure integer
    maxDepth = Math.floor(requested);
  }

  return htmlLike(manuallyRenderElement(label, 0, new WeakSet(), maxDepth));
}
