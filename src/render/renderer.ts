import { AttributesValue, EdgeTarget, IDotContext } from '../types';
import { Node } from '../model/nodes';
import { Edge } from '../model/edges';
import { NodeWithPort, ForwardRefNode } from '../model/nodes';
import { RootCluster, Digraph, Graph } from '../model/root-clusters';
import { Cluster, Subgraph } from '../model/clusters';
import { Attributes } from '../model/attributes-base';
import { DotObject } from '../model/abstract';
import {
  commentOutIfExist,
  joinWith,
  spaceLeftPad,
  join,
  joinLines,
  escape,
  indent,
  concatWordsWithSpace,
  quote,
  concatWordsWithColon,
} from './utils';

export type Dot = DotObject | AttributesValue;

export class Renderer {
  constructor(public readonly context: IDotContext = {}) {}

  private renderClusterType<T extends string>(cluster: Cluster<T>): string | undefined {
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
  private isAttributeValue(value: unknown): value is AttributesValue {
    return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
  }

  private renderAttributeValue(value: AttributesValue | undefined): string | undefined {
    if (value === undefined) {
      return undefined;
    }
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

  public renderEdgeTarget(edgeTarget: EdgeTarget): string | undefined {
    if (edgeTarget instanceof Node) {
      return this.renderAttributeValue(edgeTarget.id);
    } else if (edgeTarget instanceof NodeWithPort) {
      const { port, compass } = edgeTarget.port;
      return concatWordsWithColon(
        this.renderEdgeTarget(edgeTarget.node),
        this.renderAttributeValue(port),
        this.renderAttributeValue(compass),
      );
    } else if (edgeTarget instanceof ForwardRefNode) {
      const { port, compass } = edgeTarget.port;
      return concatWordsWithColon(
        this.renderAttributeValue(edgeTarget.id),
        this.renderAttributeValue(port),
        this.renderAttributeValue(compass),
      );
    }
  }

  private renderEdge(edge: Edge): string | undefined {
    const comment = commentOutIfExist(edge.comment);
    const target = joinWith(
      this.context.root instanceof Graph ? ' -- ' : ' -> ',
      edge.targets.map((n) => this.renderEdgeTarget(n)),
    );
    const attrs = edge.attributes.size > 0 ? spaceLeftPad(this.renderAttributes(edge.attributes)) : undefined;
    const dot = join(target, attrs, ';');
    return joinLines(comment, dot);
  }

  private renderRootCluster(rootCluster: RootCluster): string | undefined {
    const comment = commentOutIfExist(rootCluster.comment);
    const type = this.renderClusterType(rootCluster);
    const id = this.renderAttributeValue(rootCluster.id);
    // attributes
    const attributes = Array.from(rootCluster.entries()).map(([key, value]) =>
      join(key, ' = ', this.render(value), ';'),
    );
    const commonAttributes = Object.entries(rootCluster.attributes)
      .filter(([, attrs]) => attrs.size > 0)
      .map(([key, attrs]) => join(key, ' ', this.render(attrs), ';'));
    // objects
    const nodes = Array.from(rootCluster.nodes.values()).map((o) => this.render(o));
    const subgraphs = Array.from(rootCluster.subgraphs.values()).map((o) => this.render(o));
    const edges = Array.from(rootCluster.edges.values()).map((o) => this.render(o));
    const clusterContents = joinLines(...attributes, ...commonAttributes, ...nodes, ...subgraphs, ...edges);
    const dot = joinLines(
      concatWordsWithSpace(type, id, '{'),
      clusterContents.length > 0 ? indent(clusterContents) : undefined,
      '}',
    );
    return joinLines(comment, concatWordsWithSpace(rootCluster.strict ? 'strict' : undefined, dot));
  }

  private renderSubgraph(subgraph: Subgraph): string | undefined {
    const comment = commentOutIfExist(subgraph.comment);
    const type = this.renderClusterType(subgraph);
    const id = typeof subgraph.id === 'string' ? this.render(subgraph.id) : undefined;
    // attributes
    const attributes = Array.from(subgraph.entries()).map(([key, value]) => join(key, ' = ', this.render(value), ';'));
    const commonAttributes = Object.entries(subgraph.attributes)
      .filter(([, attrs]) => attrs.size > 0)
      .map(([key, attrs]) => join(key, ' ', this.render(attrs), ';'));
    // objects
    const nodes = Array.from(subgraph.nodes.values()).map((o) => this.render(o));
    const subgraphs = Array.from(subgraph.subgraphs.values()).map((o) => this.render(o));
    const edges = Array.from(subgraph.edges.values()).map((o) => this.render(o));
    const clusterContents = joinLines(...attributes, ...commonAttributes, ...nodes, ...subgraphs, ...edges);
    const dot = joinLines(
      concatWordsWithSpace(type, id, '{'),
      clusterContents.length > 0 ? indent(clusterContents) : undefined,
      '}',
    );
    return joinLines(comment, dot);
  }

  private renderNode(node: Node): string | undefined {
    const comment = commentOutIfExist(node.comment);
    const target = this.renderEdgeTarget(node);
    const attrs = node.attributes.size > 0 ? spaceLeftPad(this.render(node.attributes)) : undefined;
    const dot = join(target, attrs, ';');
    return joinLines(comment, dot);
  }
  private renderAttributes(attributes: Attributes): string | undefined {
    if (attributes.size === 0) {
      return undefined;
    }
    return joinLines(
      '[',
      indent(
        joinLines(
          commentOutIfExist(attributes.comment),
          ...Array.from(attributes.entries()).map(([key, value]) => join(key, ' = ', this.render(value), ',')),
        ),
      ),
      ']',
    );
  }

  public render(object: Dot): string | undefined {
    if (this.isAttributeValue(object)) {
      return this.renderAttributeValue(object);
    } else if (object instanceof Node) {
      return this.renderNode(object);
    } else if (object instanceof Edge) {
      return this.renderEdge(object);
    } else if (object instanceof Attributes) {
      return this.renderAttributes(object);
    } else if (object instanceof Subgraph) {
      return this.renderSubgraph(object);
    } else if (object instanceof RootCluster) {
      this.context.root = object;
      return this.renderRootCluster(object);
    }
  }
}
