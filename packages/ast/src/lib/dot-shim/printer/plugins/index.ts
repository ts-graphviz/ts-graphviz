import type { PrintPlugin } from '../types.js';
import { AttributeListPrintPlugin } from './AttributeListPrintPlugin.js';
import { AttributePrintPlugin } from './AttributePrintPlugin.js';
import { CommentPrintPlugin } from './CommentPrintPlugin.js';
import { DotPrintPlugin } from './DotPrintPlugin.js';
import { EdgePrintPlugin } from './EdgePrintPlugin.js';
import { GraphPrintPlugin } from './GraphPrintPlugin.js';
import { LiteralPrintPlugin } from './LiteralPrintPlugin.js';
import { NodePrintPlugin } from './NodePrintPlugin.js';
import { NodeRefGroupPrintPlugin } from './NodeRefGroupPrintPlugin.js';
import { NodeRefPrintPlugin } from './NodeRefPrintPlugin.js';
import { SubgraphPrintPlugin } from './SubgraphPrintPlugin.js';

export const defaultPlugins: PrintPlugin[] = [
  AttributeListPrintPlugin,
  AttributePrintPlugin,
  CommentPrintPlugin,
  DotPrintPlugin,
  EdgePrintPlugin,
  GraphPrintPlugin,
  LiteralPrintPlugin,
  NodePrintPlugin,
  NodeRefGroupPrintPlugin,
  NodeRefPrintPlugin,
  SubgraphPrintPlugin,
];
