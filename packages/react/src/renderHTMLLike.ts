import type { ReactElement, ReactNode } from 'react';

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
          propsWithChildren?.children,
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

      const attributes: string[] = [];

      // Build attributes string - props is typed as any for function components
      const propsWithChildren = props as any;
      Object.entries(propsWithChildren || {}).forEach(([key, value]) => {
        if (key !== 'children' && value != null) {
          if (typeof value === 'string' || typeof value === 'number') {
            attributes.push(`${key}="${String(value)}"`);
          } else if (typeof value === 'boolean' && value) {
            attributes.push(key);
          }
        }
      });

      const attrsString =
        attributes.length > 0 ? ` ${attributes.join(' ')}` : '';
      const childrenString = renderChildrenToString(
        propsWithChildren?.children,
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
    return String(children);
  }
  if (Array.isArray(children)) {
    return children
      .map((child) => renderChildrenToString(child, depth, inStack, maxDepth))
      .join('');
  }
  // If it's a React element, render it manually
  if (typeof children === 'object' && children !== null && 'type' in children) {
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

  const maxDepth = options?.maxDepth ?? DEFAULT_MAX_RECURSION_DEPTH;

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
