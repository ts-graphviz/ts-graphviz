import { EdgeModel, isForwardRefNode, isNodeModel } from '@ts-graphviz/common';
import { createElement } from '../../../builder/create-element.js';
import { EdgeTargetASTNode } from '../../../types.js';
import { ConvertFromModelPlugin } from '../types.js';
import { convertAttribute, convertComment } from './utils/index.js';

export const EdgePlugin: ConvertFromModelPlugin<EdgeModel> = {
  match(model) {
    return model.$$type === 'Edge';
  },
  convert(context, model) {
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
                port: target.port
                  ? createElement(
                      'Literal',
                      {
                        value: target.port,
                        quoted: true,
                      },
                      [],
                    )
                  : undefined,
                compass: target.compass
                  ? createElement(
                      'Literal',
                      {
                        value: target.compass,
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
                  port: n.port
                    ? createElement(
                        'Literal',
                        {
                          value: n.port,
                          quoted: true,
                        },
                        [],
                      )
                    : undefined,
                  compass: n.compass
                    ? createElement(
                        'Literal',
                        {
                          value: n.compass,
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
          ? [convertComment(model.attributes.comment, context.commentKind)]
          : []),
        ...model.attributes.values.map(([key, value]) =>
          convertAttribute(key, value),
        ),
      ],
    );
  },
};
