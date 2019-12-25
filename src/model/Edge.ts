import { DotBase } from '../common';
import { IEdgeTarget } from '../common/interface';
import { Attributes } from './Attributes';
import { IContext } from './Context';
import { isEdgeTarget } from './Node';

/**
 * @category Primary
 */
export class Edge extends DotBase {
  public readonly attributes = new Attributes();
  public readonly targets: IEdgeTarget[];

  constructor(context: IContext, target1: IEdgeTarget, target2: IEdgeTarget);
  constructor(context: IContext, ...targets: IEdgeTarget[]);
  constructor(private context: IContext, target1: IEdgeTarget, target2: IEdgeTarget, ...targets: IEdgeTarget[]) {
    super();
    this.targets = [target1, target2, ...targets].filter(n => isEdgeTarget(n));
  }

  public toDot(): string {
    const arrow = this.context.graphType === 'digraph' ? '->' : '--';
    const target = this.targets.map(n => n.toEdgeTargetDot()).join(` ${arrow} `);
    const attrs = this.attributes.size > 0 ? ` ${this.attributes.toDot()}` : '';
    const src = `${target}${attrs};`;
    return src;
  }
}
