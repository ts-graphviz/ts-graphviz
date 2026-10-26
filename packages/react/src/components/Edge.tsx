import { createElement, type FC } from 'react';
import { ownOptions } from 'ts-graphviz';
import { edgeKey, HOST, hostProps } from '../host.js';
import type { EdgeProps } from '../types.js';

/**
 * `Edge` component. New targets make a new edge.
 */
export const Edge: FC<EdgeProps> = (props) =>
  createElement(HOST.edge, {
    ...hostProps(props),
    key: edgeKey(ownOptions(props).targets),
  });

Edge.displayName = 'Edge';
