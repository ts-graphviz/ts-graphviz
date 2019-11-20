import { DotBase } from '../common';
import { EdgeAttributes } from './attributes';
import { isNodeLikeObject, Node, NodeLikeObject } from './Node';

/**
 * @category Primary
 */
export abstract class Edge extends DotBase {
  public readonly attributes = new EdgeAttributes();
  public readonly nodes: NodeLikeObject[];
  protected abstract arrow: string;
  constructor(node1: NodeLikeObject, node2: NodeLikeObject, ...nodes: NodeLikeObject[]) {
    super();
    this.nodes = [node1, node2, ...nodes].filter(n => isNodeLikeObject(n));
  }

  public toDot(): string {
    const arrow = this.arrow;
    const target = Array.from(this.nodes.values())
      .map(n => {
        if (n instanceof Node) {
          return Edge.quoteString(n.id);
        }
        return Edge.quoteString(`${n.node.id}:${n.port}`);
      })
      .join(` ${arrow} `);
    const attrs = this.attributes.size > 0 ? ` ${this.attributes.toDot()}` : '';
    const src = `${target}${attrs};`;
    return src;
  }
}

/**
 * @category Primary
 */
// tslint:disable-next-line: max-classes-per-file
export class GraphEdge extends Edge {
  protected arrow = '--';
}
// tslint:disable-next-line: max-classes-per-file
export class DigraphEdge extends Edge {
  protected arrow = '->';
}
