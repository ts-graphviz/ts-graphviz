import { type HTMLLikeValue, htmlLike, ownOptions } from '@ts-graphviz/common';
import {
  Fragment,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react';
import {
  htmlLikeFromSource,
  isConvertingLabel,
  isLabelProvider,
  type LabelResolver,
  readLabelProvider,
  registerLabelProvider,
} from './shared/label.js';

/**
 * Options of `htmlLikeFromElement`.
 */
export interface HtmlLikeFromElementOptions {
  /**
   * Maximum allowed recursion depth to prevent stack overflow attacks.
   * @default 1000
   */
  maxDepth?: number;
}

/**
 * A value the components of a label can read, made by
 * {@link createLabelContext}. A context of one type does not stand for a
 * context of a wider or a narrower type: its value is both given and read.
 */
export interface LabelContext<in out T> {
  /**
   * Gives `value` to the components in `children`, for
   * {@link readLabelContext}. An element of labels only: React cannot
   * render it.
   */
  readonly Provider: (props: {
    value: T;
    children?: ReactNode;
  }) => ReactElement | null;
}

/**
 * Creates a context for labels: a way to pass a value down to the
 * components of a label without handing it through every one of them.
 *
 * `htmlLikeFromElement` calls the components of a label itself, outside
 * React's render, so a React context cannot be given inside a label. A label
 * context does the same job there:
 *
 * ```tsx
 * const Accent = createLabelContext('black');
 *
 * const Cell = ({ children }: { children: string }) => (
 *   <dot:td>
 *     <dot:font color={readLabelContext(Accent)}>{children}</dot:font>
 *   </dot:td>
 * );
 *
 * htmlLikeFromElement(
 *   <Accent.Provider value="red">
 *     <dot:table>
 *       <dot:tr>
 *         <Cell>a</Cell>
 *       </dot:tr>
 *     </dot:table>
 *   </Accent.Provider>,
 * );
 * ```
 *
 * @param defaultValue - What {@link readLabelContext} gives where no
 * provider is above the component.
 */
export function createLabelContext<T>(defaultValue: T): LabelContext<T> {
  const provider = (): never => {
    throw new Error(
      'The Provider of a label context was rendered by React; it works only in an element given to htmlLikeFromElement or to a label.',
    );
  };
  registerLabelProvider(provider, defaultValue);
  return Object.freeze({ Provider: provider });
}

/**
 * Reads a label context: the value of the nearest provider above the
 * component, or the default value of the context.
 *
 * @throws {TypeError} `context` was not made by {@link createLabelContext}.
 * @throws {Error} Called while no label is converted (by a component React
 * renders, or outside a component).
 */
export function readLabelContext<T>(context: LabelContext<T>): T {
  // Own properties only: an inherited Provider is not the context's.
  const provider: unknown =
    context != null && Object.hasOwn(context, 'Provider')
      ? context.Provider
      : undefined;
  if (!isLabelProvider(provider)) {
    throw new TypeError(
      'readLabelContext takes a context made by createLabelContext.',
    );
  }
  if (!isConvertingLabel()) {
    throw new Error(
      'readLabelContext can be called only by a component of a label, while htmlLikeFromElement converts it.',
    );
  }
  return readLabelProvider(provider as object) as T;
}

/**
 * What a node of a React element tree is in a label. Components are called
 * (when the walk gets to them), not rendered by React.
 */
const resolveReactNode: LabelResolver = (node) => {
  if (node == null || typeof node === 'boolean') return { kind: 'empty' };
  // Text, as React renders strings, numbers and bigints.
  if (
    typeof node === 'string' ||
    typeof node === 'number' ||
    typeof node === 'bigint'
  ) {
    return { kind: 'text', text: String(node) };
  }
  if (Array.isArray(node)) return { kind: 'list', items: node };
  if (!isValidElement(node)) {
    throw new TypeError(
      'Only elements, strings, numbers, bigints, booleans, null and arrays of them can be children of an HTML-like label.',
    );
  }
  const { type } = node;
  // props is typed as unknown for function components
  // Own props only: `children` or an attribute inherited from
  // Object.prototype is not part of the element.
  const props = ownOptions((node.props ?? {}) as Record<string, unknown>);
  if (type === Fragment) {
    return { kind: 'group', children: () => props.children };
  }
  // A provider of a label context: its value is what the components in
  // its children read.
  if (isLabelProvider(type)) {
    return {
      kind: 'provider',
      provider: type as object,
      value: props.value,
      children: props.children,
    };
  }
  // Function and class components render to another element; their
  // errors are the caller's.
  if (typeof type === 'function') {
    return {
      kind: 'group',
      children: (): ReactNode =>
        type.prototype?.render
          ? new (type as any)(props).render()
          : (type as any)(props),
    };
  }
  if (typeof type !== 'string') {
    throw new TypeError(
      'Only dot: elements, fragments and components can be rendered to an HTML-like label.',
    );
  }
  return { kind: 'element', type, props, children: props.children };
};

/**
 * Converts a React element into an HTML-like label.
 *
 * `dot:`-prefixed elements become the elements of Graphviz's HTML-like
 * labels (`<dot:table>` → `<table>`). Strings and numbers, as children or as
 * attribute values, are text: `&`, `<`, `>` (and `"` in attributes) are
 * written as entities, so they cannot add markup. If no {@link label} is
 * provided, returns an empty label (`<>`).
 *
 * Components are called here, at once, and not rendered by React: a
 * component of a label has no state, effects or React context of its own.
 * A hook it calls belongs to the React component that is rendering when
 * the label is converted (the one a `label` prop is rendered in), and fails
 * where there is none. To pass values down a label, use
 * {@link createLabelContext}.
 *
 * @param label - Optional React element to convert.
 * @param options - Optional options.
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
 * htmlLikeFromElement(<dot:b>Hello</dot:b>);
 *
 * // Custom max depth for deeply nested structures
 * htmlLikeFromElement(<dot:table>...</dot:table>, { maxDepth: 5000 });
 * ```
 */
export function htmlLikeFromElement(
  label?: ReactElement,
  options?: HtmlLikeFromElementOptions,
): HTMLLikeValue {
  if (!label) {
    return htmlLike('');
  }

  // Own properties only: an inherited one is never an option.
  return htmlLikeFromSource(
    label,
    resolveReactNode,
    ownOptions(options).maxDepth,
  );
}
