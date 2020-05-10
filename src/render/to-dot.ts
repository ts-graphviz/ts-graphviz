/* eslint-disable @typescript-eslint/no-use-before-define */
import { Edge } from '../model/edges';
import { Context } from './Context';
import { EdgeTarget, IContext, AttributesValue } from '../types';
import { Node, ForwardRefNode, NodeWithPort } from '../model/nodes';
import { Attributes } from '../model/attributes-base';
import { Cluster, Subgraph } from '../model/clusters';
import { RootCluster, Digraph, Graph } from '../model/root-clusters';
import {
  concatWordsWithColon,
  commentOutIfExist,
  joinWith,
  join,
  joinLines,
  concatWordsWithSpace,
  indent,
  quote,
  escape,
  spaceLeftPad,
} from './utils';

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

function getClusterType<T extends string>(cluster: Cluster<T>): string | undefined {
  if (cluster instanceof Digraph) {
    return 'digraph';
  }
  if (cluster instanceof Graph) {
    return 'graph';
  }
  if (cluster instanceof Subgraph) {
    return 'subgraph';
  }
}

function edgeTargetTodDot(edgeTarget: EdgeTarget, ctx: IContext): string | undefined {
  if (edgeTarget instanceof Node) {
    return toDot(edgeTarget.id, ctx);
  } else if (edgeTarget instanceof NodeWithPort) {
    const { port, compass } = edgeTarget.port;
    return concatWordsWithColon(edgeTargetTodDot(edgeTarget.node, ctx), toDot(port, ctx), toDot(compass, ctx));
  } else if (edgeTarget instanceof ForwardRefNode) {
    const { port, compass } = edgeTarget.port;
    return concatWordsWithColon(toDot(edgeTarget.id, ctx), toDot(port, ctx), toDot(compass, ctx));
  }
}

export function toDot(object: unknown, context: IContext = new Context()): string | undefined {
  if (object instanceof Edge) {
    const comment = commentOutIfExist(object.comment);
    const target = joinWith(
      context.root instanceof Graph ? ' -- ' : ' -> ',
      object.targets.map((n) => edgeTargetTodDot(n, context)),
    );

    const attrs = object.attributes.size > 0 ? spaceLeftPad(toDot(object.attributes, context)) : undefined;
    const dot = join(target, attrs, ';');
    return joinLines(comment, dot);
  } else if (object instanceof RootCluster) {
    context.root = object;
    const comment = commentOutIfExist(object.comment);
    const type = getClusterType(object);
    const id = toDot(object.id, context);
    // attributes
    const attributes = Array.from(object.entries()).map(([key, value]) => join(key, ' = ', toDot(value, context), ';'));
    const commonAttributes = Object.entries(object.attributes)
      .filter(([, attrs]) => attrs.size > 0)
      .map(([key, attrs]) => join(key, ' ', toDot(attrs, context), ';'));

    // objects
    const nodes = Array.from(object.nodes.values()).map((o) => toDot(o, context));
    const subgraphs = Array.from(object.subgraphs.values()).map((o) => toDot(o, context));
    const edges = Array.from(object.edges.values()).map((o) => toDot(o, context));
    const clusterContents = joinLines(...attributes, ...commonAttributes, ...nodes, ...subgraphs, ...edges);
    const dot = joinLines(
      concatWordsWithSpace(type, id, '{'),
      clusterContents.length > 0 ? indent(clusterContents) : undefined,
      '}',
    );
    return joinLines(comment, concatWordsWithSpace(object.strict ? 'strict' : undefined, dot));
  } else if (object instanceof Subgraph) {
    const comment = commentOutIfExist(object.comment);
    const type = getClusterType(object);
    const id = typeof object.id === 'string' ? toDot(object.id) : undefined;
    // attributes
    const attributes = Array.from(object.entries()).map(([key, value]) => join(key, ' = ', toDot(value, context), ';'));
    const commonAttributes = Object.entries(object.attributes)
      .filter(([, attrs]) => attrs.size > 0)
      .map(([key, attrs]) => join(key, ' ', toDot(attrs, context), ';'));

    // objects
    const nodes = Array.from(object.nodes.values()).map((o) => toDot(o, context));
    const subgraphs = Array.from(object.subgraphs.values()).map((o) => toDot(o, context));
    const edges = Array.from(object.edges.values()).map((o) => toDot(o, context));
    const clusterContents = joinLines(...attributes, ...commonAttributes, ...nodes, ...subgraphs, ...edges);
    const dot = joinLines(
      concatWordsWithSpace(type, id, '{'),
      clusterContents.length > 0 ? indent(clusterContents) : undefined,
      '}',
    );
    return joinLines(comment, dot);
  } else if (object instanceof Node) {
    const comment = commentOutIfExist(object.comment);
    const target = edgeTargetTodDot(object, context);
    const attrs = object.attributes.size > 0 ? spaceLeftPad(toDot(object.attributes, context)) : undefined;
    const dot = join(target, attrs, ';');
    return joinLines(comment, dot);
  } else if (object instanceof Attributes) {
    if (object.size === 0) {
      return undefined;
    }
    return joinLines(
      '[',
      indent(
        joinLines(
          commentOutIfExist(object.comment),
          ...Array.from(object.entries()).map(([key, value]) => join(key, ' = ', toDot(value, context), ',')),
        ),
      ),
      ']',
    );
  } else if (isAttributeValue(object)) {
    return attributeValueToDot(object);
  }
}
