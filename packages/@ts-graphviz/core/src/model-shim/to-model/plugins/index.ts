import { DotPlugin } from './DotPlugin.js';
import { EdgePlugin } from './EdgePlugin.js';
import { GraphPlugin } from './GraphPlugin.js';
import { SubgraphPlugin } from './SubgraphPlugin.js';
import { NodePlugin } from './NodePlugin.js';

export const defaultPlugins = [NodePlugin, EdgePlugin, SubgraphPlugin, GraphPlugin, DotPlugin];
