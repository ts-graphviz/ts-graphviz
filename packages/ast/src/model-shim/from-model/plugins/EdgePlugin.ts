import {
  type Compass,
  type EdgeModel,
  isForwardRefNode,
  isNodeModel,
} from '@ts-graphviz/common';
import type { EdgeTargetASTNode } from '../../../types.js';
import type { ConvertFromModelPlugin } from '../types.js';
import { convertAttribute, convertComment } from './utils/index.js';

/** A field of an edge target, read only when the target owns it. */
function ownField<T extends object, K extends keyof T>(
  target: T,
  field: K,
): T[K] | undefined {
  return Object.hasOwn(target, field) ? target[field] : undefined;
}

export const EdgePlugin: ConvertFromModelPlugin<EdgeModel> = {
  match(model) {
    return model.$$type === 'Edge';
  },
  convert(context, model) {
    const { createElement } = context;
    return createElement(
      'Edge',
      {
        targets: model.targets.map((target) => {
          if (isNodeModel(target)) {
            return createElement(
              'NodeRef',
              {
                id: createElement(
                  'Literal',
                  {
                    value: target.id,
                    quoted: true,
                  },
                  [],
                ),
              },
              [],
            );
          }
          if (isForwardRefNode(target)) {
            return createElement(
              'NodeRef',
              {
                id: createElement(
                  'Literal',
                  {
                    value: target.id,
                    quoted: true,
                  },
                  [],
                ),
                port: ownField(target, 'port')
                  ? createElement(
                      'Literal',
                      {
                        value: ownField(target, 'port') as string,
                        quoted: true,
                      },
                      [],
                    )
                  : undefined,
                compass: ownField(target, 'compass')
                  ? createElement(
                      'Literal',
                      {
                        value: ownField(target, 'compass') as Compass,
                        quoted: true,
                      },
                      [],
                    )
                  : undefined,
              },
              [],
            );
          }
          return createElement(
            'NodeRefGroup',
            {},
            target.map((n) => {
              if (isNodeModel(n)) {
                return createElement(
                  'NodeRef',
                  {
                    id: createElement(
                      'Literal',
                      {
                        value: n.id,
                        quoted: true,
                      },
                      [],
                    ),
                  },
                  [],
                );
              }
              return createElement(
                'NodeRef',
                {
                  id: createElement(
                    'Literal',
                    {
                      value: n.id,
                      quoted: true,
                    },
                    [],
                  ),
                  port: ownField(n, 'port')
                    ? createElement(
                        'Literal',
                        {
                          value: ownField(n, 'port') as string,
                          quoted: true,
                        },
                        [],
                      )
                    : undefined,
                  compass: ownField(n, 'compass')
                    ? createElement(
                        'Literal',
                        {
                          value: ownField(n, 'compass') as Compass,
                          quoted: true,
                        },
                        [],
                      )
                    : undefined,
                },
                [],
              );
            }),
          );
        }) as [
          from: EdgeTargetASTNode,
          to: EdgeTargetASTNode,
          ...rest: EdgeTargetASTNode[],
        ],
      },
      [
        ...(model.attributes.comment
          ? [
              convertComment(
                createElement,
                model.attributes.comment,
                context.commentKind,
              ),
            ]
          : []),
        ...model.attributes.values.map(([key, value]) =>
          convertAttribute(createElement, key, value),
        ),
      ],
    );
  },
};
