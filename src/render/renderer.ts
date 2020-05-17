import { Dot, INode, ISubgraph, ICluster, IEdge, IRootCluster } from '../types';
import {
  commentOutIfExist,
  concatWordsWithSpace,
  indent,
  isAttributes,
  isEdge,
  isGraph,
  isNode,
  isRootCluster,
  isSubgraph,
  join,
  joinLines,
  joinWith,
  renderAttributes,
  renderAttributeValue,
  renderAttributeWithSemi,
  renderClusterType,
  renderEdgeTarget,
  spaceLeftPad,
} from './utils';

export class Renderer {
  private root?: IRootCluster;
  protected renderNode(node: INode): string {
    const comment = commentOutIfExist(node.comment);
    const target = renderEdgeTarget(node);
    const attrs = node.attributes.size > 0 ? spaceLeftPad(renderAttributes(node.attributes)) : undefined;
    const dot = join(target, attrs, ';');
    return joinLines(comment, dot);
  }

  protected renderEdge(edge: IEdge): string {
    const comment = commentOutIfExist(edge.comment);
    const targets = joinWith(isGraph(this.root) ? ' -- ' : ' -> ', edge.targets.map(renderEdgeTarget));
    const attrs = edge.attributes.size > 0 ? spaceLeftPad(renderAttributes(edge.attributes)) : undefined;
    const dot = join(targets, attrs, ';');
    return joinLines(comment, dot);
  }

  protected renderCluster(cluster: ICluster): string {
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

  protected renderRootCluster(rootCluster: IRootCluster): string {
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
    } else if (isEdge(object)) {
      return this.renderEdge(object);
    } else if (isAttributes(object)) {
      return renderAttributes(object);
    } else if (isSubgraph(object)) {
      return this.renderSubgraph(object);
    } else if (isRootCluster(object)) {
      this.root = object;
      return this.renderRootCluster(object);
    }
    return renderAttributeValue(object);
  }
}
