import { INode, INodeWithPort, IPort } from '../../types';

/**
 * An object that represents a Node where port and compass are specified.
 * @category Primary
 */
export class NodeWithPort implements INodeWithPort {
  constructor(public readonly node: INode, public readonly port: Partial<IPort>) {}
}
