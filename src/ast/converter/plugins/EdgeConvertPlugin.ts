import { EdgeModel, isForwardRefNode, isNodeModel } from '../../../common/index.js';
import { EdgeTargetASTNode } from '../../types.js';
import { ConvertPlugin } from '../types.js';
import { convertAttribute, convertComment } from './utils/index.js';
import { createElement } from '../../create-element.js';

export const EdgeConvertPlugin: ConvertPlugin<EdgeModel> = {
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
          } else if (isForwardRefNode(target)) {
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
        }) as [from: EdgeTargetASTNode, to: EdgeTargetASTNode, ...rest: EdgeTargetASTNode[]],
      },
      [
        ...(model.attributes.comment ? [convertComment(model.attributes.comment, context.commentKind)] : []),
        ...model.attributes.values.map(([key, value]) => convertAttribute(key, value)),
      ],
    );
  },
};
