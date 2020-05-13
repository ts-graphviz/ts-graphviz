import { Edge } from '../model/edges';
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
import { Node } from '../model/nodes';
import { AttributesValue, EdgeTarget, IContext } from '../types';
import { NodeWithPort, ForwardRefNode } from '../model/nodes';
import { RootCluster, Digraph, Graph } from '../model/root-clusters';
import { Cluster, Subgraph } from '../model/clusters';
import { Attributes } from '../model/attributes-base';
import { Context } from './Context';

export class Renderer {
  constructor(private context: IContext = new Context()) {}

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

  private renderAttributeValue(value: AttributesValue): string {
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

  public renderEdgeTarget(edgeTarget: EdgeTarget): string | undefined {
    if (edgeTarget instanceof Node) {
      return this.render(edgeTarget.id);
    } else if (edgeTarget instanceof NodeWithPort) {
      const { port, compass } = edgeTarget.port;
      return concatWordsWithColon(this.renderEdgeTarget(edgeTarget.node), this.render(port), this.render(compass));
    } else if (edgeTarget instanceof ForwardRefNode) {
      const { port, compass } = edgeTarget.port;
      return concatWordsWithColon(this.render(edgeTarget.id), this.render(port), this.render(compass));
    }
  }

  public render(object: unknown): string | undefined {
    if (object instanceof Edge) {
      const comment = commentOutIfExist(object.comment);
      const target = joinWith(
        this.context.root instanceof Graph ? ' -- ' : ' -> ',
        object.targets.map((n) => this.renderEdgeTarget(n)),
      );
      const attrs = object.attributes.size > 0 ? spaceLeftPad(this.render(object.attributes)) : undefined;
      const dot = join(target, attrs, ';');
      return joinLines(comment, dot);
    } else if (object instanceof RootCluster) {
      this.context.root = object;
      const comment = commentOutIfExist(object.comment);
      const type = this.renderClusterType(object);
      const id = this.render(object.id);
      // attributes
      const attributes = Array.from(object.entries()).map(([key, value]) => join(key, ' = ', this.render(value), ';'));
      const commonAttributes = Object.entries(object.attributes)
        .filter(([, attrs]) => attrs.size > 0)
        .map(([key, attrs]) => join(key, ' ', this.render(attrs), ';'));
      // objects
      const nodes = Array.from(object.nodes.values()).map((o) => this.render(o));
      const subgraphs = Array.from(object.subgraphs.values()).map((o) => this.render(o));
      const edges = Array.from(object.edges.values()).map((o) => this.render(o));
      const clusterContents = joinLines(...attributes, ...commonAttributes, ...nodes, ...subgraphs, ...edges);
      const dot = joinLines(
        concatWordsWithSpace(type, id, '{'),
        clusterContents.length > 0 ? indent(clusterContents) : undefined,
        '}',
      );
      return joinLines(comment, concatWordsWithSpace(object.strict ? 'strict' : undefined, dot));
    } else if (object instanceof Subgraph) {
      const comment = commentOutIfExist(object.comment);
      const type = this.renderClusterType(object);
      const id = typeof object.id === 'string' ? this.render(object.id) : undefined;
      // attributes
      const attributes = Array.from(object.entries()).map(([key, value]) => join(key, ' = ', this.render(value), ';'));
      const commonAttributes = Object.entries(object.attributes)
        .filter(([, attrs]) => attrs.size > 0)
        .map(([key, attrs]) => join(key, ' ', this.render(attrs), ';'));
      // objects
      const nodes = Array.from(object.nodes.values()).map((o) => this.render(o));
      const subgraphs = Array.from(object.subgraphs.values()).map((o) => this.render(o));
      const edges = Array.from(object.edges.values()).map((o) => this.render(o));
      const clusterContents = joinLines(...attributes, ...commonAttributes, ...nodes, ...subgraphs, ...edges);
      const dot = joinLines(
        concatWordsWithSpace(type, id, '{'),
        clusterContents.length > 0 ? indent(clusterContents) : undefined,
        '}',
      );
      return joinLines(comment, dot);
    } else if (object instanceof Node) {
      const comment = commentOutIfExist(object.comment);
      const target = this.renderEdgeTarget(object);
      const attrs = object.attributes.size > 0 ? spaceLeftPad(this.render(object.attributes)) : undefined;
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
            ...Array.from(object.entries()).map(([key, value]) => join(key, ' = ', this.render(value), ',')),
          ),
        ),
        ']',
      );
    } else if (this.isAttributeValue(object)) {
      return this.renderAttributeValue(object);
    }
  }
}
