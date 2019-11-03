import { ClusterAttributes } from '../values/attributes';
import { Dot, GraphType } from './Dot';
export class SubgraphCluster extends Dot<ClusterAttributes> {
  public type: GraphType = 'subgraph';
  constructor(id: string, attributes: ClusterAttributes = new ClusterAttributes()) {
    super(id, attributes);
  }
}
