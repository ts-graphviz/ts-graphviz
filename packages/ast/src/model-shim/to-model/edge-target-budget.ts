import { withCode } from '@ts-graphviz/common';
import type { ConvertToModelContext } from './types.js';

const DEFAULT_MAX_EDGE_TARGETS = 100_000;

/** What is left of `maxEdgeTargets` in each running conversion. */
const budgets = new WeakMap<ConvertToModelContext, { left: number }>();

/**
 * Start counting the edge targets of a conversion.
 * @internal
 */
export function startEdgeTargetBudget(
  context: ConvertToModelContext,
  maxEdgeTargets = DEFAULT_MAX_EDGE_TARGETS,
): void {
  if (maxEdgeTargets > 0) budgets.set(context, { left: maxEdgeTargets });
}

/**
 * Count `count` node references reached by an edge to a subgraph.
 * @throws `RangeError` with code `TSG_ERR_EDGE_TARGET_COUNT_EXCEEDED` past
 * the limit.
 * @internal
 */
export function takeEdgeTargets(
  context: ConvertToModelContext,
  count: number,
): void {
  const budget = budgets.get(context);
  if (budget === undefined) return;
  budget.left -= count;
  if (budget.left < 0) {
    throw withCode(
      new RangeError(
        'Edges to subgraphs reach more nodes than maxEdgeTargets allows. ' +
          "Consider increasing the 'maxEdgeTargets' option.",
      ),
      'TSG_ERR_EDGE_TARGET_COUNT_EXCEEDED',
    );
  }
}
