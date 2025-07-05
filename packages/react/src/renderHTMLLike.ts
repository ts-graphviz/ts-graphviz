import type { ReactElement, ReactNode } from 'react';

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
 */
function manuallyRenderElement(element: ReactElement): string {
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
        return manuallyRenderElement(result as ReactElement);
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

    const attrsString = attributes.length > 0 ? ` ${attributes.join(' ')}` : '';
    const childrenString = renderChildrenToString(propsWithChildren?.children);

    if (childrenString) {
      return `<${tagName}${attrsString}>${childrenString}</${tagName}>`;
    }
    return `<${tagName}${attrsString}></${tagName}>`;
  }

  return '';
}

/**
 * Safely renders React children to string.
 */
function renderChildrenToString(children: ReactNode): string {
  if (children == null || typeof children === 'boolean') {
    return '';
  }
  if (typeof children === 'string' || typeof children === 'number') {
    return String(children);
  }
  if (Array.isArray(children)) {
    return children.map(renderChildrenToString).join('');
  }
  // If it's a React element, render it manually
  if (typeof children === 'object' && children !== null && 'type' in children) {
    return manuallyRenderElement(children as ReactElement);
  }
  return '';
}

/**
 * Converts a React element into a custom HTML-like string representation.
 *
 * If no {@link label} is provided, returns the string '<>'. Otherwise, renders the React element to static markup, transforms any `dot:`-prefixed tags by removing the prefix, and wraps the result in angle brackets.
 *
 * @param label - Optional React element to render.
 * @returns A string representing the transformed HTML-like markup.
 */
export function renderHTMLLike(label?: ReactElement): string {
  if (!label) {
    return '<>';
  }

  try {
    // Use manual rendering with built-in dot: element transformation
    const markup = manuallyRenderElement(label);

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
