import { DotBase } from '../abstract';
import { IEdgeTarget, RootClusterType } from '../interface';
import { IContext } from '../interface';
import { commentOut, joinLines } from '../utils/dot-rendering';
import { Attributes } from './Attributes';
import { isEdgeTarget } from './Node';

/**
 * @category Primary
 */
export class Edge extends DotBase {
  /** Comments to include when outputting with toDot. */
  public comment?: string;
  // TODO
  public readonly attributes = new Attributes();
  /** @hidden */
  private readonly targets: IEdgeTarget[];
  /** @hidden */
  private get dotArrow(): string {
    switch (this.context.graphType) {
      case RootClusterType.graph:
        return '--';
      case RootClusterType.digraph:
      default:
        return '->';
    }
  }

  constructor(context: IContext, target1: IEdgeTarget, target2: IEdgeTarget);
  constructor(context: IContext, ...targets: IEdgeTarget[]);
  constructor(private context: IContext, target1: IEdgeTarget, target2: IEdgeTarget, ...targets: IEdgeTarget[]) {
    super();
    this.targets = [target1, target2, ...targets].filter(n => isEdgeTarget(n));
  }

  /** Convert Edge to Dot language. */
  public toDot(): string {
    const comment = this.comment ? commentOut(this.comment) : undefined;
    const arrow = ` ${this.dotArrow} `;
    const target = this.targets.map(n => n.toEdgeTargetDot()).join(arrow);
    const attrs = this.attributes.size > 0 ? ` ${this.attributes.toDot()}` : '';
    const dot = `${target}${attrs};`;
    return joinLines(comment, dot);
  }
}
