import { createElement, type FC } from 'react';
import { edgeKey, HOST, hostProps } from '../host.js';
import type { EdgeProps } from '../types.js';

/**
 * `Edge` component. New targets make a new edge.
 */
export const Edge: FC<EdgeProps> = (props) =>
  createElement(HOST.edge, {
    ...hostProps(props),
    key: edgeKey(props.targets),
  });

Edge.displayName = 'Edge';
