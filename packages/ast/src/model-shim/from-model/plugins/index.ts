import type {
  AttributeListModel,
  DotModel,
  EdgeModel,
  NodeModel,
  RootGraphModel,
  SubgraphModel,
} from '@ts-graphviz/common';
import type { ConvertFromModelPlugin } from '../types.js';
import { AttributeListPlugin } from './AttributeListPlugin.js';
import { DotPlugin } from './DotPlugin.js';
import { EdgePlugin } from './EdgePlugin.js';
import { GraphPlugin } from './GraphPlugin.js';
import { NodePlugin } from './NodePlugin.js';
import { SubgraphPlugin } from './SubgraphPlugin.js';

export const defaultPlugins: (
  | ConvertFromModelPlugin<AttributeListModel>
  | ConvertFromModelPlugin<DotModel>
  | ConvertFromModelPlugin<EdgeModel>
  | ConvertFromModelPlugin<NodeModel>
  | ConvertFromModelPlugin<RootGraphModel>
  | ConvertFromModelPlugin<SubgraphModel>
)[] = [
  AttributeListPlugin,
  EdgePlugin,
  NodePlugin,
  GraphPlugin,
  SubgraphPlugin,
  DotPlugin,
];
