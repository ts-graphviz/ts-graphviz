import type {
  DotASTNode,
  EdgeASTNode,
  GraphASTNode,
  NodeASTNode,
  SubgraphASTNode,
} from '../../../types.js';
import type { ConvertToModelPlugin } from '../types.js';
import { DotPlugin } from './DotPlugin.js';
import { EdgePlugin } from './EdgePlugin.js';
import { GraphPlugin } from './GraphPlugin.js';
import { NodePlugin } from './NodePlugin.js';
import { SubgraphPlugin } from './SubgraphPlugin.js';

export const defaultPlugins: (
  | ConvertToModelPlugin<DotASTNode>
  | ConvertToModelPlugin<EdgeASTNode>
  | ConvertToModelPlugin<GraphASTNode>
  | ConvertToModelPlugin<NodeASTNode>
  | ConvertToModelPlugin<SubgraphASTNode>
)[] = [NodePlugin, EdgePlugin, SubgraphPlugin, GraphPlugin, DotPlugin];
