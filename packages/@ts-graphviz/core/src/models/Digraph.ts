import { define } from '@ts-graphviz/common';
import { RootGraph } from './RootGraph.js';

/**
 * DOT object class representing a digraph.
 * @group Models
 */
@define({ type: 'Graph', directed: true })
export class Digraph extends RootGraph {}
