import { Edge } from '../model/Edge';
import { ID } from '../model/ID';
import { Context } from '../model/Context';
import { RootClusterType, IEdgeTarget, IContext } from '../types';
import { DotBase } from '../abstract';
import { Node, ForwardRefNode, NodeWithPort } from '../model/Node';
import { Attributes } from '../model/Attributes';
import { Cluster } from '../model/Cluster';
import { RootCluster } from '../model/RootCluster';
/**
 * @hidden
 */
function escape(str: string): string {
  return str.replace(/\n/g, '\\n').replace(/"/g, '\\"');
}

/**
 * @hidden
 */
function wrap(src: string, wrapper: string): string {
  return `${wrapper}${src}${wrapper}`;
}

/**
 * @hidden
 */
function quote(src: string): string {
  return wrap(src, '"');
}

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

export function toDot(object: DotBase, context: IContext = new Context()): string {
  if (object instanceof Edge) {
    const comment = object.comment ? commentOut(object.comment) : undefined;
    const arrow = wrap(context.graphType === RootClusterType.graph ? '--' : '->', ' ');
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    const target = object.targets.map((n) => toEdgeTargetDot(n, context)).join(arrow);

    const attrs = object.attributes.size > 0 ? ` ${toDot(object.attributes, context)}` : '';
    const dot = `${target}${attrs};`;
    return joinLines(comment, dot);
  } else if (object instanceof RootCluster) {
    context.root = object;
    const comment = object.comment ? commentOut(object.comment) : undefined;
    const type = object.type;
    const id = typeof object.id === 'string' ? toDot(new ID(object.id), context) : undefined;
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
    const type = object.type;
    const id = typeof object.id === 'string' ? toDot(new ID(object.id), context) : undefined;
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
  } else if (object instanceof ID) {
    if (object.isNotString || object.isHTMLLike) {
      return object.value;
    }
    let value = object.value;
    if (object.isQuoteRequired) {
      value = quote(escape(value));
    }
    return value;
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
  }
  return '';
}

export function toEdgeTargetDot(object: IEdgeTarget, context: IContext): string {
  if (object instanceof Node) {
    return toDot(new ID(object.id), context);
  } else if (object instanceof NodeWithPort) {
    const { port, compass } = object.port;
    return concatWordsWithColon(
      toEdgeTargetDot(object.node, context),
      port ? toDot(new ID(port), context) : undefined,
      compass ? toDot(new ID(compass), context) : undefined,
    );
  } else if (object instanceof ForwardRefNode) {
    const { port, compass } = object.port;
    return concatWordsWithColon(
      toDot(new ID(object.id), context),
      port ? toDot(new ID(port), context) : undefined,
      compass,
    );
  }
  return '';
}
