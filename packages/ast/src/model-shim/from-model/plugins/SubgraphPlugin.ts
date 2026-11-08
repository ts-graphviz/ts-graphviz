import type { ReadonlySubgraphModel } from '@ts-graphviz/common';
import { idToRaw } from '../../literal.js';
import type { ConvertFromModelPlugin } from '../types.js';
import { convertClusterChildren } from './utils/convert-cluster-children.js';

export const SubgraphPlugin: ConvertFromModelPlugin<ReadonlySubgraphModel> = {
  match(model) {
    return model.$$type === 'Subgraph';
  },
  convert(context, model) {
    const { createElement } = context;
    // The name, also from a model with only `id`.
    const id = model.subgraphId ?? model.id;
    return createElement(
      'Subgraph',
      {
        // `""` is a valid (empty) id, so test for presence, not truthiness
        id:
          id !== undefined
            ? createElement(
                'Literal',
                {
                  value: idToRaw(id),
                  kind: 'quoted',
                },
                [],
              )
            : undefined,
      },
      convertClusterChildren(context, model),
    );
  },
};
