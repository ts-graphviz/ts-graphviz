import { DotBase } from '../common';
import { EdgeAttributes } from './attributes';
import { RootClusterType } from './cluster';
import { Node } from './Node';

/**
 * @category Primary
 */
export class Edge extends DotBase {
  private get arrow(): string {
    return this.graphType === 'graph' ? '--' : '->';
  }
  public readonly attributes = new EdgeAttributes();
  private readonly nodes: Set<Node>;
  constructor(public readonly graphType: RootClusterType, node1: Node, node2: Node, ...nodes: Node[]) {
    super();
    this.nodes = new Set([node1, node2, ...nodes].filter(n => n instanceof Node));
  }

  public toDot(): string {
    const arrow = this.arrow;
    const target = Array.from(this.nodes.values())
      .map(n => Edge.quoteString(n.id))
      .join(` ${arrow} `);
    const attrs = this.attributes.size > 0 ? ` ${this.attributes.toDot()}` : '';
    const src = `${target}${attrs};`;
    return src;
  }
}
