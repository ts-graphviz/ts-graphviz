import { type EdgeModel, isNodeModel, type NodeRef } from '@ts-graphviz/common';
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
    { value: idToRaw(target.id), quoted: true },
    [],
  );
  if (isNodeModel(target)) {
    return createElement('NodeRef', { id }, []);
  }
  // Ports are ids and are escaped like one; a compass point is a keyword.
  return createElement(
    'NodeRef',
    {
      id,
      port: target.port
        ? createElement(
            'Literal',
            { value: idToRaw(target.port), quoted: true },
            [],
          )
        : undefined,
      compass: target.compass
        ? createElement('Literal', { value: target.compass, quoted: true }, [])
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
