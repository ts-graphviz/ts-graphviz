import { isValidElement, type ReactElement, type ReactNode } from 'react';
import { ownOptions } from './own-options.js';

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
 * Map of known dot: prefixed elements to their HTML equivalents.
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

/** The children of props, only when the props own them. */
function ownChildren(props: unknown): ReactNode {
  return props != null && Object.hasOwn(props, 'children')
    ? (props as { children: ReactNode }).children
    : undefined;
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
    throw new Error(
      `Maximum rendering depth of ${maxDepth} exceeded. This may indicate deeply nested or circular element structures.`,
    );
  }

  // Prevent circular reference attacks (only detect true recursion cycles)
  if (inStack.has(element)) {
    throw new Error(
      'Circular reference detected in React element tree. Cannot render elements that reference themselves.',
    );
  }

  // Add to stack for this recursion branch
  inStack.add(element);

  try {
    const { type, props } = element;

    // For function components, try to execute them first
    if (typeof type === 'function') {
      try {
        // Handle both function components and class components
        const result =
          typeof type === 'function' && type.prototype?.render
            ? new (type as any)(props).render()
            : (type as any)(props);
        if (result && typeof result === 'object' && result.type) {
          return manuallyRenderElement(
            result as ReactElement,
            depth + 1,
            inStack,
            maxDepth,
          );
        }
      } catch {
        // Ignore errors from function components
      }
      return '';
    }

    if (typeof type === 'string') {
      let tagName = type;

      // Handle dot:port special case: render as <content> instead of <dot:port>content</dot:port>
      if (tagName === 'dot:port') {
        const propsWithChildren = props as any;
        const childrenString = renderChildrenToString(
          ownChildren(propsWithChildren),
          depth + 1,
          inStack,
          maxDepth,
        );
        return `<${childrenString}>`;
      }

      // Transform dot: prefixed elements to HTML equivalents
      if (tagName.startsWith('dot:')) {
        const htmlElement =
          DOT_ELEMENT_MAP[tagName as keyof typeof DOT_ELEMENT_MAP];
        if (htmlElement) {
          tagName = htmlElement;
        }
      }

      // A tag name that is not a name would add markup: render its children
      // only.
      if (!NAME.test(tagName)) {
        return renderChildrenToString(
          ownChildren(props),
          depth + 1,
          inStack,
          maxDepth,
        );
      }

      const attributes: string[] = [];

      // Build attributes string - props is typed as any for function components
      const propsWithChildren = props as any;
      Object.entries(propsWithChildren || {}).forEach(([key, value]) => {
        // React's own props are not attributes; a key that is not a name
        // would add markup, so it is left out.
        if (
          key !== 'children' &&
          key !== 'key' &&
          key !== 'ref' &&
          value != null &&
          NAME.test(key)
        ) {
          if (typeof value === 'string' || typeof value === 'number') {
            attributes.push(`${key}="${escapeAttribute(String(value))}"`);
          } else if (typeof value === 'boolean' && value) {
            attributes.push(key);
          }
        }
      });

      const attrsString =
        attributes.length > 0 ? ` ${attributes.join(' ')}` : '';
      const childrenString = renderChildrenToString(
        ownChildren(propsWithChildren),
        depth + 1,
        inStack,
        maxDepth,
      );

      if (childrenString) {
        return `<${tagName}${attrsString}>${childrenString}</${tagName}>`;
      }
      return `<${tagName}${attrsString}></${tagName}>`;
    }

    return '';
  } finally {
    // Remove from stack when exiting this recursion branch
    inStack.delete(element);
  }
}

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

/** A tag or attribute name that cannot add markup. */
const NAME = /^[A-Za-z][A-Za-z0-9_:-]*$/;

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
  if (typeof children === 'string' || typeof children === 'number') {
    return escapeText(String(children));
  }
  if (Array.isArray(children)) {
    // Nested arrays count toward the depth limit, as nested elements do.
    if (depth >= maxDepth) {
      throw new Error(
        `Maximum rendering depth of ${maxDepth} exceeded. This may indicate deeply nested or circular element structures.`,
      );
    }
    return children
      .map((child) =>
        renderChildrenToString(child, depth + 1, inStack, maxDepth),
      )
      .join('');
  }
  // Only a real React element is rendered; an object that merely has a
  // `type` (for example one parsed from JSON) is not.
  if (isValidElement(children)) {
    return manuallyRenderElement(
      children as ReactElement,
      depth,
      inStack,
      maxDepth,
    );
  }
  return '';
}

/**
 * Converts a React element into a custom HTML-like string representation.
 *
 * If no {@link label} is provided, returns the string '<>'. Otherwise, renders the React element to static markup, transforms any `dot:`-prefixed tags by removing the prefix, and wraps the result in angle brackets.
 *
 * @param label - Optional React element to render.
 * @param options - Optional rendering options.
 * @returns A string representing the transformed HTML-like markup.
 *
 * @example
 * ```ts
 * // Default behavior (max depth: 1000)
 * renderHTMLLike(<div><span>Hello</span></div>);
 *
 * // Custom max depth for deeply nested structures
 * renderHTMLLike(<div>...</div>, { maxDepth: 5000 });
 *
 * // Lower max depth for strict validation
 * renderHTMLLike(<div>...</div>, { maxDepth: 100 });
 * ```
 */
export function renderHTMLLike(
  label?: ReactElement,
  options?: RenderHTMLLikeOptions,
): string {
  if (!label) {
    return '<>';
  }

  // Sanitize and validate maxDepth option
  const { maxDepth: givenMaxDepth } = ownOptions(options);
  let maxDepth = DEFAULT_MAX_RECURSION_DEPTH;
  if (
    givenMaxDepth != null &&
    Number.isFinite(givenMaxDepth) &&
    givenMaxDepth > 0
  ) {
    // Use Math.floor to ensure integer
    maxDepth = Math.floor(givenMaxDepth);
  }

  try {
    // Use manual rendering with built-in dot: element transformation
    const markup = manuallyRenderElement(label, 0, new WeakSet(), maxDepth);

    if (!markup) {
      return '<>';
    }

    return `<${markup}>`;
  } catch (error) {
    // Fallback for any rendering issues
    console.warn(
      'renderHTMLLike fallback:',
      error instanceof Error ? error.message : error,
    );
    return '<>';
  }
}
