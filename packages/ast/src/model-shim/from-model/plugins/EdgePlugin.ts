import {
  type EdgeModel,
  isNodeModel,
  type NodeRef,
  withCode,
} from '@ts-graphviz/common';
import type { CreateElement } from '../../../builder/types.js';
import type { EdgeTargetASTNode, NodeRefASTNode } from '../../../types.js';
import { idToRaw } from '../../literal.js';
import type { ConvertFromModelPlugin } from '../types.js';
import { convertAttribute } from './utils/index.js';

const nodeRef = (
  createElement: CreateElement,
  target: NodeRef,
): NodeRefASTNode => {
  const id = createElement(
    'Literal',
    { value: idToRaw(target.id), kind: 'quoted' },
    [],
  );
  if (isNodeModel(target)) {
    return createElement('NodeRef', { id }, []);
  }
  // Graphviz splits a port on ':' even inside quotes (`b:"p:q"` is port p,
  // compass q), so such a port cannot be written faithfully.
  if (target.port?.includes(':')) {
    throw withCode(
      new TypeError(
        `A port must not contain ':' (Graphviz reads it as "port:compass"): ${JSON.stringify(target.port)}`,
      ),
      'TSG_ERR_INVALID_PORT',
    );
  }
  // Ports are ids and are escaped like one; a compass point is a keyword.
  return createElement(
    'NodeRef',
    {
      id,
      port: target.port
        ? createElement(
            'Literal',
            { value: idToRaw(target.port), kind: 'quoted' },
            [],
          )
        : undefined,
      compass: target.compass
        ? createElement(
            'Literal',
            { value: target.compass, kind: 'quoted' },
            [],
          )
        : undefined,
    },
    [],
  );
};

export const EdgePlugin: ConvertFromModelPlugin<EdgeModel> = {
  match(model) {
    return model.$$type === 'Edge';
  },
  convert(context, model) {
    const { createElement } = context;
    return createElement(
      'Edge',
      {
        targets: model.targets.map(
          (target): EdgeTargetASTNode =>
            Array.isArray(target)
              ? createElement(
                  'NodeRefGroup',
                  {},
                  target.map((n) => nodeRef(createElement, n)),
                )
              : nodeRef(createElement, target),
        ) as [
          from: EdgeTargetASTNode,
          to: EdgeTargetASTNode,
          ...rest: EdgeTargetASTNode[],
        ],
      },
      model.attributes.values.map(([key, value]) =>
        convertAttribute(createElement, key, value),
      ),
    );
  },
};
