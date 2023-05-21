import { define } from '@ts-graphviz/common';
import { RootGraph } from './RootGraph.js';

/**
 * DOT object class representing a graph.
 * @group Models
 */
@define({ type: 'Graph', directed: false })
export class Graph extends RootGraph {}
