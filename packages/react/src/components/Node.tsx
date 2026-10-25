import { createElement, type FC } from 'react';
import { HOST } from '../host.js';
import type { NodeProps } from '../types.js';

/**
 * `Node` component. A new id makes a new node.
 */
export const Node: FC<NodeProps> = (props) =>
  createElement(HOST.node, { ...props, key: props.id });

Node.displayName = 'Node';
