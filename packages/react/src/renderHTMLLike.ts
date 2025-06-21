import type { ReactElement, ReactNode } from 'react';

/**
 * Manually traverse and render React element tree for React 19 compatibility
 */
function manuallyRenderElement(element: ReactElement): string {
  const { type, props } = element;
  
  // For function components, try to execute them first
  if (typeof type === 'function') {
    try {
      // Handle both function components and class components
      const result = typeof type === 'function' && type.prototype?.render 
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
    const tagName = type;
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
    
    const attrsString = attributes.length > 0 ? ' ' + attributes.join(' ') : '';
    const childrenString = renderChildrenToString(propsWithChildren?.children);
    
    if (childrenString) {
      return `<${tagName}${attrsString}>${childrenString}</${tagName}>`;
    } else {
      return `<${tagName}${attrsString}></${tagName}>`;
    }
  }
  
  return '';
}

/**
 * Safely renders React children to string, handling React 19 compatibility
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
    // Use manual rendering for React 19 compatibility
    const markup = manuallyRenderElement(label);
    
    if (!markup) {
      return '<>';
    }
    
    return `<${markup
      .replace(/<dot:port>(.+?)<\/dot:port>/gi, '<$1>')
      .replace(/<(\/?)dot:([a-z-]+)/gi, (_, $1, $2) => `<${$1}${$2}`)}>`;
  } catch (error) {
    // Fallback for any rendering issues
    console.warn('renderHTMLLike fallback:', error instanceof Error ? error.message : error);
    return '<>';
  }
}