import type { EdgeProps } from '@ts-graphviz/react';
import {
  digraph,
  type EdgeModel,
  type EdgeTargetLikeTuple,
  isNodeRefGroupLike,
  type NodeRefGroupLike,
  type NodeRefLike,
  toNodeRefGroup,
} from 'ts-graphviz';
import { describe, expectTypeOf, it } from 'vitest';

// #1739: edge targets given as readonly tuples and arrays.
describe('edge targets as inputs', () => {
  const g = digraph('G');

  it('accepts readonly tuples and groups', () => {
    const pair = ['a', 'b'] as const;
    expectTypeOf(g.edge(pair)).toEqualTypeOf<EdgeModel>();
    expectTypeOf(g.createEdge(pair)).toEqualTypeOf<EdgeModel>();
    expectTypeOf(g.edge([['a', 'b'] as const, 'c'])).toEqualTypeOf<EdgeModel>();
    const many: readonly ['a', 'b', 'c', readonly ['d', 'e']] = [
      'a',
      'b',
      'c',
      ['d', 'e'],
    ];
    expectTypeOf(g.edge(many, { label: 'x' })).toEqualTypeOf<EdgeModel>();
  });

  it('still accepts mutable tuples and the existing tuple type', () => {
    expectTypeOf(g.edge(['a', ['b', 'c']])).toEqualTypeOf<EdgeModel>();
    const ids: string[] = ['a', 'b'];
    // Asserting an array to the tuple type keeps working.
    expectTypeOf(g.edge(ids as EdgeTargetLikeTuple)).toEqualTypeOf<EdgeModel>();
  });

  it('still needs at least two targets', () => {
    // @ts-expect-error one target
    g.edge(['a'] as const);
    // @ts-expect-error one target
    g.edge(['a']);
  });

  it('converts readonly groups', () => {
    toNodeRefGroup(['a', 'b'] as const);
  });

  it('narrows without dropping mutability', () => {
    const mutable = ['a'] as NodeRefLike | NodeRefGroupLike;
    if (isNodeRefGroupLike(mutable)) {
      expectTypeOf(mutable).toEqualTypeOf<NodeRefGroupLike>();
      mutable.push('b');
    }
    const frozen = ['a'] as NodeRefLike | readonly NodeRefLike[];
    if (isNodeRefGroupLike(frozen)) {
      expectTypeOf(frozen).toEqualTypeOf<readonly NodeRefLike[]>();
    }
  });
});

describe('@ts-graphviz/react <Edge targets>', () => {
  it('accepts a readonly tuple', () => {
    const props: EdgeProps = { targets: ['a', ['b', 'c'] as const] as const };
    expectTypeOf(props.targets).toMatchTypeOf<readonly unknown[]>();
  });
});
