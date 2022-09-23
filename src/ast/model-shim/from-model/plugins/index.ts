import { AttributeListPrintPlugin } from './AttributeListConvertPlugin.js';
import { EdgeConvertPlugin } from './EdgeConvertPlugin.js';
import { GraphConvertPlugin } from './GraphConvertPlugin.js';
import { NodeConvertPlugin } from './NodeConvertPlugin.js';
import { SubgraphConvertPlugin } from './SubraphConvertPlugin.js';

export const defaultPlugins = [
  AttributeListPrintPlugin,
  EdgeConvertPlugin,
  NodeConvertPlugin,
  GraphConvertPlugin,
  SubgraphConvertPlugin,
];
