import { IPort, IForwardRefNode } from '../../types';
/**
 * @category Primary
 * @hidden
 */
export class ForwardRefNode implements IForwardRefNode {
  constructor(public readonly id: string, public readonly port: Readonly<Partial<IPort>>) {}
}
