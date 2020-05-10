import { Edge } from '../model/edges';
import { Context } from './Context';
import { EdgeTarget, IContext, AttributesValue } from '../types';
import { DotBase } from '../model/abstract';
import { Node, ForwardRefNode, NodeWithPort } from '../model/nodes';
import { Attributes } from '../model/attributes-base';
import { Cluster, Subgraph } from '../model/clusters';
import { RootCluster, Digraph, Graph } from '../model/root-clusters';

/**
 * @hidden
 */
function escape(str: string): string {
  return str.replace(/\n/g, '\\n').replace(/"/g, '\\"');
}

/**
 * @hidden
 */
function wrap(word: string, wrapper: string): string {
  return `${wrapper}${word}${wrapper}`;
}

/**
 * @hidden
 */
function wrapFactory(wrapper: string): (word: string) => string {
  return (word: string): string => wrap(word, wrapper);
}

/**
 * @hidden
 */
function leftPad(word: string, pad: string): string {
  return `${pad}${word}`;
}

/**
 * @hidden
 */
function leftPadFactory(pad: string): (word: string) => string {
  return (word: string): string => leftPad(word, pad);
}

/**
 * @hidden
 */
const quote = wrapFactory('"');

/**
 * @hidden
 */
const spaceWrap = wrapFactory(' ');

/**
 * @hidden
 */
const spaceLeftPad = leftPadFactory(' ');

/**
 * @hidden
 */
function concatWordsFactory(deciliter: string): (...lines: (string | undefined)[]) => string {
  return (...lines: (string | undefined)[]): string => lines.filter((l) => typeof l === 'string').join(deciliter);
}

/**
 * @hidden
 */
const concatWordsWithSpace = concatWordsFactory(' ');

/**
 * @hidden
 */
const concatWordsWithColon = concatWordsFactory(':');

/**
 * @hidden
 */
const joinLines = concatWordsFactory('\n');

/**
 * @hidden
 */
function indent(src: string): string {
  const space = '  ';
  return src
    .split('\n')
    .map((l) => `${space}${l}`)
    .join('\n');
}

/**
 * @hidden
 */
function commentOut(src: string): string {
  return src
    .split('\n')
    .map((l) => `// ${l}`.trim())
    .join('\n');
}

function isAttributeValue(value: unknown): value is AttributesValue {
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
}

function attributeValueToDot(value: AttributesValue): string {
  let isHTMLLike = false;
  let isNotString = false;
  let isQuoteRequired = false;
  isNotString = typeof value !== 'string';
  let stringValue: string = typeof value === 'string' ? value : value.toString();
  if (isNotString) {
    isHTMLLike = false;
    isQuoteRequired = false;
  } else {
    const trimmed = stringValue.trim();
    isHTMLLike = /^<.+>$/ms.test(trimmed);
    if (isHTMLLike) {
      stringValue = trimmed;
      isQuoteRequired = false;
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

const keywords = {
  graphEdge: '--',
  digraphEdge: '->',
  digraph: 'digraph',
  graph: 'graph',
  subgraph: 'subgraph',
};

function getClusterType<T extends string>(cluster: Cluster<T>): string | undefined {
  if (cluster instanceof Digraph) {
    return keywords.digraph;
  }
  if (cluster instanceof Graph) {
    return keywords.graph;
  }
  if (cluster instanceof Subgraph) {
    return keywords.subgraph;
  }
}

export function toDot(object: DotBase | AttributesValue, context: IContext = new Context()): string {
  if (object instanceof Edge) {
    const comment = object.comment ? commentOut(object.comment) : undefined;
    const arrow = spaceWrap(context.root instanceof Graph ? keywords.graphEdge : keywords.digraphEdge);
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    const target = object.targets.map((n) => toEdgeTargetDot(n, context)).join(arrow);

    const attrs = object.attributes.size > 0 ? spaceLeftPad(toDot(object.attributes, context)) : '';
    const dot = `${target}${attrs};`;
    return joinLines(comment, dot);
  } else if (object instanceof RootCluster) {
    context.root = object;
    const comment = object.comment ? commentOut(object.comment) : undefined;
    const type = getClusterType(object);
    const id = typeof object.id === 'string' ? toDot(object.id, context) : undefined;
    // attributes
    const attributes = Array.from(object.entries()).map(([key, value]) => `${key} = ${toDot(value, context)};`);
    const commonAttributes = Object.entries(object.attributes)
      .filter(([, attrs]) => attrs.size > 0)
      .map(([key, attrs]) => `${key} ${toDot(attrs, context)};`);

    // objects
    const nodes = Array.from(object.nodes.values()).map((o) => toDot(o, context));
    const subgraphs = Array.from(object.subgraphs.values()).map((o) => toDot(o, context));
    const edges = Array.from(object.edges.values()).map((o) => toDot(o, context));
    const clusterContents = joinLines(...attributes, ...commonAttributes, ...nodes, ...subgraphs, ...edges);
    const dot = joinLines(
      concatWordsWithSpace(type, id, '{'),
      clusterContents ? indent(clusterContents) : undefined,
      '}',
    );
    return joinLines(comment, concatWordsWithSpace(object.strict ? 'strict' : undefined, dot));
  } else if (object instanceof Cluster) {
    const comment = object.comment ? commentOut(object.comment) : undefined;
    const type = getClusterType(object);
    const id = typeof object.id === 'string' ? toDot(object.id) : undefined;
    // attributes
    const attributes = Array.from(object.entries()).map(([key, value]) => `${key} = ${toDot(value, context)};`);
    const commonAttributes = Object.entries(object.attributes)
      .filter(([, attrs]) => attrs.size > 0)
      .map(([key, attrs]) => `${key} ${toDot(attrs, context)};`);

    // objects
    const nodes = Array.from(object.nodes.values()).map((o) => toDot(o, context));
    const subgraphs = Array.from(object.subgraphs.values()).map((o) => toDot(o, context));
    const edges = Array.from(object.edges.values()).map((o) => toDot(o, context));
    const clusterContents = joinLines(...attributes, ...commonAttributes, ...nodes, ...subgraphs, ...edges);
    const dot = joinLines(
      concatWordsWithSpace(type, id, '{'),
      clusterContents ? indent(clusterContents) : undefined,
      '}',
    );
    return joinLines(comment, dot);
  } else if (object instanceof Node) {
    const comment = object.comment ? commentOut(object.comment) : undefined;
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    const target = toEdgeTargetDot(object, context);
    const attrs = object.attributes.size > 0 ? ` ${toDot(object.attributes, context)}` : '';
    const dot = `${target}${attrs};`;
    return joinLines(comment, dot);
  } else if (object instanceof Attributes) {
    if (object.size === 0) {
      return '';
    }
    return joinLines(
      '[',
      indent(
        joinLines(
          object.comment ? commentOut(object.comment) : undefined,
          ...Array.from(object.entries()).map(([key, value]) => `${key} = ${toDot(value, context)},`),
        ),
      ),
      ']',
    );
  } else if (isAttributeValue(object)) {
    return attributeValueToDot(object);
  }
  return '';
}

export function toEdgeTargetDot(object: EdgeTarget, context: IContext): string {
  if (object instanceof Node) {
    return toDot(object.id, context);
  } else if (object instanceof NodeWithPort) {
    const { port, compass } = object.port;
    return concatWordsWithColon(
      toEdgeTargetDot(object.node, context),
      port ? toDot(port, context) : undefined,
      compass ? toDot(compass, context) : undefined,
    );
  } else if (object instanceof ForwardRefNode) {
    const { port, compass } = object.port;
    return concatWordsWithColon(toDot(object.id, context), port ? toDot(port, context) : undefined, compass);
  }
  return '';
}
