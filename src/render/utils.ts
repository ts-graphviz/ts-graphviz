import {
  ICluster,
  ISubgraph,
  IEdge,
  INode,
  IRootCluster,
  IAttributes,
  AttributesValue,
  NodeRef,
  NodeRefGroup,
} from '../types';
import { Subgraph } from '../model/clusters';
import { Edge } from '../model/edges';
import { Node } from '../model/nodes';
import { RootCluster, Graph, Digraph } from '../model/root-clusters';
import { Attributes } from '../model/attributes-base';
import { isForwardRefNode } from '../model/utils';

export function escape(str: string): string {
  return str.replace(/\n/g, '\\n').replace(/"/g, '\\"');
}

export function wrap(word: string, wrapper: string): string {
  return `${wrapper}${word}${wrapper}`;
}

export function wrapFactory(wrapper: string): (word: string) => string {
  return (word: string): string => wrap(word, wrapper);
}

export function leftPad(word: string, pad: string): string {
  return `${pad}${word}`;
}

export function leftPadFactory(pad: string): (w?: string) => string | undefined {
  return (w?: string): string | undefined => {
    if (typeof w === 'string') {
      return leftPad(w, pad);
    }
  };
}

export const quote = wrapFactory('"');

export const spaceLeftPad = leftPadFactory(' ');

export function concatWordsFactory(deciliter: string): (...lines: (string | undefined)[]) => string {
  return (...lines: (string | undefined)[]): string => lines.filter((l) => typeof l === 'string').join(deciliter);
}

export const concatWordsWithSpace = concatWordsFactory(' ');

export const concatWordsWithColon = concatWordsFactory(':');

export const joinLines = concatWordsFactory('\n');
export const join = concatWordsFactory('');
export function joinWith(separator: string, lines: (string | undefined)[]): string {
  return lines.filter((l) => typeof l === 'string').join(separator);
}

export function indent(src: string): string {
  const space = '  ';
  return src
    .split('\n')
    .map((l) => join(space, l))
    .join('\n');
}

export function commentOut(src: string): string {
  return src
    .split('\n')
    .map((l) => join('// ', l).trim())
    .join('\n');
}
export function commentOutIfExist(src: string | undefined): string | undefined {
  return typeof src === 'string' ? commentOut(src) : undefined;
}

export function isSubgraph(object: unknown): object is ISubgraph {
  return object instanceof Subgraph;
}

export function isEdge(object: unknown): object is IEdge {
  return object instanceof Edge;
}

export function isNode(object: unknown): object is INode {
  return object instanceof Node;
}

export function isRootCluster(object: unknown): object is IRootCluster {
  return object instanceof RootCluster;
}
export function isDigraph(object: unknown): object is Digraph {
  return object instanceof Digraph;
}
export function isGraph(object: unknown): object is Graph {
  return object instanceof Graph;
}

export function isAttributes(object: unknown): object is IAttributes {
  return object instanceof Attributes;
}

export function renderClusterType(cluster: ICluster): string | undefined {
  if (isDigraph(cluster)) {
    return 'digraph';
  }
  if (isGraph(cluster)) {
    return 'graph';
  }
  if (isSubgraph(cluster)) {
    return 'subgraph';
  }
}

export function renderAttributeValue(value: AttributesValue): string {
  const isNotString = typeof value !== 'string';
  let isHTMLLike = false;
  let isQuoteRequired = false;
  let stringValue: string = typeof value === 'string' ? value : value.toString();
  if (isNotString) {
    isHTMLLike = false;
  } else {
    const trimmed = stringValue.trim();
    isHTMLLike = /^<.+>$/ms.test(trimmed);
    if (isHTMLLike) {
      stringValue = trimmed;
    } else {
      isQuoteRequired = true;
    }
  }
  if (isNotString || isHTMLLike) {
    return stringValue;
  }

  if (isQuoteRequired) {
    return quote(escape(stringValue));
  }
  return stringValue;
}

export function renderAttributeBuilder<T extends string>(
  deciliter: string,
): (v: [T, AttributesValue]) => string | undefined {
  return ([key, value]): string | undefined => join(key, ' = ', renderAttributeValue(value), deciliter);
}

export const renderAttributeWithSemi: <T extends string>(v: [T, AttributesValue]) => string | undefined =
  renderAttributeBuilder(';');

export const renderAttributeWithComma: <T extends string>(v: [T, AttributesValue]) => string | undefined =
  renderAttributeBuilder(',');

export function renderAttributes(attributes: IAttributes): string {
  if (attributes.size === 0) {
    return '';
  }
  return joinLines(
    '[',
    indent(joinLines(commentOutIfExist(attributes.comment), ...attributes.values.map(renderAttributeWithComma))),
    ']',
  );
}

export function renderNodeRef(node: NodeRef): string | undefined {
  if (isNode(node)) {
    return renderAttributeValue(node.id);
  } else if (isForwardRefNode(node)) {
    const { id, port, compass } = node;
    return concatWordsWithColon(
      renderAttributeValue(id),
      port !== undefined ? renderAttributeValue(port) : undefined,
      compass !== undefined ? renderAttributeValue(compass) : undefined,
    );
  }
}

export function renderNodeRefGroup(group: NodeRefGroup): string | undefined {
  return '{' + concatWordsWithSpace(...group.map(renderNodeRef)) + '}';
}
