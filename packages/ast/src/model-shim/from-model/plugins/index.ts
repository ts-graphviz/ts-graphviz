import type {
  ReadonlyAttributeAssignmentModel,
  ReadonlyAttributeListModel,
  ReadonlyDotModel,
  ReadonlyEdgeModel,
  ReadonlyNodeModel,
  ReadonlyRootGraphModel,
  ReadonlySubgraphModel,
} from '@ts-graphviz/common';
import type { ConvertFromModelPlugin } from '../types.js';
import { AttributeAssignmentPlugin } from './AttributeAssignmentPlugin.js';
import { AttributeListPlugin } from './AttributeListPlugin.js';
import { DotPlugin } from './DotPlugin.js';
import { EdgePlugin } from './EdgePlugin.js';
import { GraphPlugin } from './GraphPlugin.js';
import { NodePlugin } from './NodePlugin.js';
import { SubgraphPlugin } from './SubgraphPlugin.js';

export const defaultPlugins: (
  | ConvertFromModelPlugin<ReadonlyAttributeAssignmentModel>
  | ConvertFromModelPlugin<ReadonlyAttributeListModel>
  | ConvertFromModelPlugin<ReadonlyDotModel>
  | ConvertFromModelPlugin<ReadonlyEdgeModel>
  | ConvertFromModelPlugin<ReadonlyNodeModel>
  | ConvertFromModelPlugin<ReadonlyRootGraphModel>
  | ConvertFromModelPlugin<ReadonlySubgraphModel>
)[] = [
  AttributeListPlugin,
  AttributeAssignmentPlugin,
  EdgePlugin,
  NodePlugin,
  GraphPlugin,
  SubgraphPlugin,
  DotPlugin,
];
