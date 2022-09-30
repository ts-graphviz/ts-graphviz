/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types */
import {
  createElement,
  AttributeASTNode,
  ASTNode,
  DotASTNode,
  AttributeListASTNode,
  CommentASTNode,
  EdgeASTNode,
  LiteralASTNode,
  NodeASTNode,
  NodeRefASTNode,
  NodeRefGroupASTNode,
  SubgraphASTNode,
  GraphASTNode,
} from '../ast/index.js';

function tagType(tag: string): ASTNode['type'] {
  switch (tag) {
    case 'dot':
      return 'Dot';
    case 'attribute':
      return 'Attribute';
    case 'attributes':
    case 'attribute-list':
      return 'AttributeList';
    case 'node':
      return 'Node';
    case 'node-ref':
    case 'ref':
      return 'NodeRef';
    case 'node-ref-group':
    case 'refs':
      return 'NodeRefGroup';
    case 'edge':
      return 'Edge';
    case 'subgraph':
      return 'Subgraph';
    case 'graph':
      return 'Graph';
    case 'literal':
      return 'Literal';
    case 'comment':
      return 'Comment';
  }
  throw new Error();
}

export function jsx(tag: any, props: any, key: any): any {
  if (!Array.isArray(props.children)) {
    props.value = props.children;
    props.children = [];
  } else {
    props.children = [props.children];
  }
  return jsxs(tag, props, key);
}
export function jsxs(tag: any, props: any, key: any): any {
  console.log({ tag, props, key });
  if (key !== undefined) {
    props.key = key;
  }

  const children = props.children;
  delete props.children;

  if (typeof tag === 'string') {
    tag = tagType(tag);
  }

  return createElement(tag, props, children);
}

export namespace JSX {
  export type Element = ASTNode;

  type JSXProps<T extends ASTNode> = {
    [K in keyof T as Exclude<K, 'type' | 'children' | 'value'>]: T[K] extends ASTNode ? Element : T[K];
  } & (T extends { children: never[] }
    ? T extends { value: infer V }
      ? V extends ASTNode
        ? { children: Element }
        : { children: V }
      : Record<string, never>
    : T extends { children: Element[] }
    ? { children?: Element | Element[] }
    : Record<string, never>);

  export type A = JSXProps<AttributeASTNode>;

  export interface ElementChildrenAttribute {
    // Element[] | Element | string | string[]
    children: Element | Element[] | string;
  }
  // export interface ElementAttributesProperty {
  //   props: any;
  // }
  export interface IntrinsicElements {
    // strict
    attribute: JSXProps<AttributeASTNode>;
    dot: JSXProps<DotASTNode>;
    node: JSXProps<NodeASTNode>;
    'attribute-list': JSXProps<AttributeListASTNode>;
    'node-ref': JSXProps<NodeRefASTNode>;
    'node-ref-group': JSXProps<NodeRefGroupASTNode>;
    edge: JSXProps<EdgeASTNode>;
    graph: JSXProps<GraphASTNode>;
    subgraph: JSXProps<SubgraphASTNode>;
    comment: JSXProps<CommentASTNode>;
    literal: JSXProps<LiteralASTNode>;

    // alias
    attributes: JSXProps<AttributeListASTNode>;
    ref: JSXProps<NodeRefASTNode>;
    refs: JSXProps<NodeRefGroupASTNode>;
  }
}
