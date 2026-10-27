import {
  isCompass,
  isNodeModel,
  type NodeRef,
  type ReadonlyEdgeModel,
  withCode,
} from '@ts-graphviz/common';
import type { CreateElement } from '../../../builder/types.js';
import { ownField } from '../../../own-field.js';
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
  // Only the fields the target owns: `{ id: 'a' }` has no port.
  const port = ownField(target, 'port');
  const compass = ownField(target, 'compass');
  // Graphviz splits a port on ':' even inside quotes (`b:"p:q"` is port p,
  // compass q), so such a port cannot be written faithfully.
  if (port?.includes(':')) {
    throw withCode(
      new TypeError(
        `A port must not contain ':' (Graphviz reads it as "port:compass"): ${JSON.stringify(port)}`,
      ),
      'TSG_ERR_INVALID_PORT',
    );
  }
  // A compass point is a keyword, written as it is: only the ones DOT has.
  // (An empty one is left out, as before.)
  if (compass && (typeof compass !== 'string' || !isCompass(compass))) {
    throw withCode(
      new TypeError(
        `A compass point must be one of n, ne, e, se, s, sw, w, nw, c and _: ${typeof compass === 'string' ? JSON.stringify(compass) : `a value of type ${typeof compass}`}`,
      ),
      'TSG_ERR_INVALID_EDGE_TARGETS',
    );
  }
  // Ports are ids and are escaped like one; a compass point is a keyword.
  return createElement(
    'NodeRef',
    {
      id,
      port: port
        ? createElement('Literal', { value: idToRaw(port), kind: 'quoted' }, [])
        : undefined,
      compass: compass
        ? createElement('Literal', { value: compass, kind: 'quoted' }, [])
        : undefined,
    },
    [],
  );
};

/** Whether an edge target is a group of node references. */
const isGroup = (
  target: ReadonlyEdgeModel['targets'][number],
): target is readonly NodeRef[] => Array.isArray(target);

export const EdgePlugin: ConvertFromModelPlugin<ReadonlyEdgeModel> = {
  match(model) {
    return model.$$type === 'Edge';
  },
  convert(context, model) {
    const { createElement } = context;
    return createElement(
      'Edge',
      {
        targets: model.targets.map((target): EdgeTargetASTNode => {
          if (!isGroup(target)) return nodeRef(createElement, target);
          const refs = target.map((n) => nodeRef(createElement, n));
          // Graphviz ignores ports inside `{a b}`, but keeps them in a
          // comma list, so a group with a port is written `a:p, b`.
          if (refs.some((ref) => ref.port || ref.compass)) {
            return refs.length === 1
              ? refs[0]
              : createElement('NodeRefList', {}, refs);
          }
          return createElement(
            'Subgraph',
            {},
            refs.map((ref) => createElement('Node', { id: ref.id }, [])),
          );
        }) as [
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
