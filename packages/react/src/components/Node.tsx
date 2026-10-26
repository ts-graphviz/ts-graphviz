import { createElement, type FC } from 'react';
import { ownOptions } from 'ts-graphviz';
import { HOST, hostProps } from '../host.js';
import type { NodeProps } from '../types.js';

/**
 * `Node` component. A new id makes a new node.
 */
export const Node: FC<NodeProps> = (props) =>
  createElement(HOST.node, { ...hostProps(props), key: ownOptions(props).id });

Node.displayName = 'Node';
