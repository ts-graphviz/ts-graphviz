import {
  type EdgeTargetTuple,
  isNodeRefGroupLike,
  modelOf,
  type ReadonlyEdgeTargetLikeTuple,
  toNodeRef,
  toNodeRefGroup,
} from '@ts-graphviz/common';

/**
 * The targets an edge is constructed with, from what `createEdge` takes:
 * ids become references, and an object standing for a node (a DSL) gives
 * the node itself.
 */
export function toEdgeTargets(
  targets: ReadonlyEdgeTargetLikeTuple,
): EdgeTargetTuple {
  return targets
    .map(
      (t) =>
        (Array.isArray(t)
          ? t.map(modelOf)
          : modelOf(t)) as ReadonlyEdgeTargetLikeTuple[number],
    )
    .map((t) =>
      isNodeRefGroupLike(t) ? toNodeRefGroup(t) : toNodeRef(t),
    ) as EdgeTargetTuple;
}
