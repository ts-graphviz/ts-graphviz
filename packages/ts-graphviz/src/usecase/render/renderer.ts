import { Attribute, AttributeKey } from '@ts-graphviz/dot-attribute';
import {
  isNodeRef,
  Subgraph,
  Edge,
  Node,
  Graph,
  ISubgraph,
  IEdge,
  INode,
  IAttributes,
  Attributes,
  NodeRef,
  NodeRefGroup,
  isForwardRefNode,
  IGraphBase,
} from '@ts-graphviz/model';

function escape(str: string): string {
  return str.replace(/\n/g, '\\n').replace(/"/g, '\\"');
}

function wrap(word: string, wrapper: string): string {
  return `${wrapper}${word}${wrapper}`;
}

function wrapFactory(wrapper: string): (word: string) => string {
  return (word: string): string => wrap(word, wrapper);
}

function leftPad(word: string, pad: string): string {
  return `${pad}${word}`;
}

function leftPadFactory(pad: string): (w?: string) => string | undefined {
  return (w?: string): string | undefined => {
    if (typeof w === 'string') {
      return leftPad(w, pad);
    }
  };
}

const quote = wrapFactory('"');

const spaceLeftPad = leftPadFactory(' ');

function concatWordsFactory(deciliter: string): (...lines: (string | undefined)[]) => string {
  return (...lines: (string | undefined)[]): string => lines.filter((l) => typeof l === 'string').join(deciliter);
}

const concatWordsWithSpace = concatWordsFactory(' ');

const concatWordsWithColon = concatWordsFactory(':');

const joinLines = concatWordsFactory('\n');
const join = concatWordsFactory('');
function joinWith(separator: string, lines: (string | undefined)[]): string {
  return lines.filter((l) => typeof l === 'string').join(separator);
}

function indent(src: string): string {
  const space = '  ';
  return src
    .split('\n')
    .map((l) => join(space, l))
    .join('\n');
}

function commentOut(src: string): string {
  return src
    .split('\n')
    .map((l) => join('// ', l).trim())
    .join('\n');
}
function commentOutIfExist(src: string | undefined): string | undefined {
  return typeof src === 'string' ? commentOut(src) : undefined;
}

function isSubgraph(object: unknown): object is ISubgraph {
  return object instanceof Subgraph;
}

function isEdge(object: unknown): object is IEdge {
  return object instanceof Edge;
}

function isNode(object: unknown): object is INode {
  return object instanceof Node;
}

function isGraph(object: unknown): object is Graph {
  return object instanceof Graph;
}

function isAttributes(object: unknown): object is IAttributes {
  return object instanceof Attributes;
}

function renderClusterType(cluster: IGraphBase): string | undefined {
  if (isGraph(cluster)) {
    return cluster.directed ? 'digraph' : 'graph';
  }
  if (isSubgraph(cluster)) {
    return 'subgraph';
  }
}

function renderAttributeValue(value: Attribute<AttributeKey>): string {
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

function renderAttributeBuilder<T extends AttributeKey>(
  deciliter: string,
): (v: [T, Attribute<T>]) => string | undefined {
  return ([key, value]): string | undefined => join(key, ' = ', renderAttributeValue(value), deciliter);
}

const renderAttributeWithSemi: <T extends AttributeKey>(v: [T, Attribute<T>]) => string | undefined =
  renderAttributeBuilder(';');

const renderAttributeWithComma: <T extends AttributeKey>(v: [T, Attribute<T>]) => string | undefined =
  renderAttributeBuilder(',');

function renderAttributes(attributes: IAttributes): string {
  if (attributes.size === 0) {
    return '';
  }
  return joinLines(
    '[',
    indent(joinLines(commentOutIfExist(attributes.comment), ...attributes.values.map(renderAttributeWithComma))),
    ']',
  );
}

function renderNodeRef(node: NodeRef): string | undefined {
  if (isNode(node)) {
    return renderAttributeValue(node.id);
  }
  if (isForwardRefNode(node)) {
    const { id, port, compass } = node;
    return concatWordsWithColon(
      renderAttributeValue(id),
      port !== undefined ? renderAttributeValue(port) : undefined,
      compass !== undefined ? renderAttributeValue(compass) : undefined,
    );
  }
}

function renderNodeRefGroup(group: NodeRefGroup): string | undefined {
  return `{${concatWordsWithSpace(...group.map(renderNodeRef))}}`;
}

export type Dot = Graph | ISubgraph | IEdge | INode | IAttributes | Attribute<AttributeKey>;

export class Renderer {
  private root?: Graph;

  // eslint-disable-next-line class-methods-use-this
  protected renderNode(node: INode): string {
    const comment = commentOutIfExist(node.comment);
    const target = renderNodeRef(node);
    const attrs = node.attributes.size > 0 ? spaceLeftPad(renderAttributes(node.attributes)) : undefined;
    const dot = join(target, attrs, ';');
    return joinLines(comment, dot);
  }

  protected renderEdge(edge: IEdge): string {
    const comment = commentOutIfExist(edge.comment);
    const targets = joinWith(
      this.root?.directed ? ' -> ' : ' -- ',
      edge.targets.map((t) => (isNodeRef(t) ? renderNodeRef(t) : renderNodeRefGroup(t))),
    );
    const attrs = edge.attributes.size > 0 ? spaceLeftPad(renderAttributes(edge.attributes)) : undefined;
    const dot = join(targets, attrs, ';');
    return joinLines(comment, dot);
  }

  protected renderCluster(cluster: IGraphBase): string {
    const type = renderClusterType(cluster);
    const id = cluster.id !== undefined ? renderAttributeValue(cluster.id) : undefined;
    // attributes
    const attributes = cluster.values.map(renderAttributeWithSemi);
    const commonAttributes = Object.entries(cluster.attributes)
      .filter(([, attrs]) => attrs.size > 0)
      .map(([key, attrs]) => join(key, ' ', renderAttributes(attrs), ';'));
    // objects
    const nodes = cluster.nodes.map(this.renderNode.bind(this));
    const subgraphs = cluster.subgraphs.map(this.renderSubgraph.bind(this));
    const edges = cluster.edges.map(this.renderEdge.bind(this));
    const contents = joinLines(...attributes, ...commonAttributes, ...nodes, ...subgraphs, ...edges);
    return joinLines(concatWordsWithSpace(type, id, '{'), contents.length > 0 ? indent(contents) : undefined, '}');
  }

  protected renderRootCluster(rootCluster: Graph): string {
    const comment = commentOutIfExist(rootCluster.comment);
    const cluster = this.renderCluster(rootCluster);
    return joinLines(comment, concatWordsWithSpace(rootCluster.strict ? 'strict' : undefined, cluster));
  }

  protected renderSubgraph(subgraph: ISubgraph): string {
    const comment = commentOutIfExist(subgraph.comment);
    const cluster = this.renderCluster(subgraph);
    return joinLines(comment, cluster);
  }

  public render(object: Dot): string {
    if (isNode(object)) {
      return this.renderNode(object);
    }
    if (isEdge(object)) {
      return this.renderEdge(object);
    }
    if (isAttributes(object)) {
      return renderAttributes(object);
    }
    if (isSubgraph(object)) {
      return this.renderSubgraph(object);
    }
    if (isGraph(object)) {
      this.root = object;
      return this.renderRootCluster(object);
    }
    return renderAttributeValue(object);
  }
}
