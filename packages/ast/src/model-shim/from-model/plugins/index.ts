import type {
  ReadonlyAttributeListModel,
  ReadonlyDotModel,
  ReadonlyEdgeModel,
  ReadonlyNodeModel,
  ReadonlyRootGraphModel,
  ReadonlySubgraphModel,
} from '@ts-graphviz/common';
import type { ConvertFromModelPlugin } from '../types.js';
import { AttributeListPlugin } from './AttributeListPlugin.js';
import { DotPlugin } from './DotPlugin.js';
import { EdgePlugin } from './EdgePlugin.js';
import { GraphPlugin } from './GraphPlugin.js';
import { NodePlugin } from './NodePlugin.js';
import { SubgraphPlugin } from './SubgraphPlugin.js';

export const defaultPlugins: (
  | ConvertFromModelPlugin<ReadonlyAttributeListModel>
  | ConvertFromModelPlugin<ReadonlyDotModel>
  | ConvertFromModelPlugin<ReadonlyEdgeModel>
  | ConvertFromModelPlugin<ReadonlyNodeModel>
  | ConvertFromModelPlugin<ReadonlyRootGraphModel>
  | ConvertFromModelPlugin<ReadonlySubgraphModel>
)[] = [
  AttributeListPlugin,
  EdgePlugin,
  NodePlugin,
  GraphPlugin,
  SubgraphPlugin,
  DotPlugin,
];
