import {
  AttributeList,
  type CommentModel,
  Digraph,
  Dot,
  digraph,
  dsl,
  Edge,
  Node,
  type ReadonlyNodeModel,
  Subgraph,
} from 'ts-graphviz';
import { describe, expectTypeOf, it } from 'vitest';

describe('comments', () => {
  it('statements take leading and trailing comments', () => {
    for (const model of [
      new Node('a'),
      new Edge([{ id: 'a' }, { id: 'b' }]),
      new AttributeList('Node'),
    ]) {
      expectTypeOf(model.addComment('x')).toEqualTypeOf<CommentModel>();
      model.addComment('x', { position: 'trailing', kind: 'Slash' });
      // (types only: these calls would throw)
      void (() => {
        // @ts-expect-error a statement has no body
        model.addComment('x', { position: 'end' });
      });
      expectTypeOf(model.comments).toEqualTypeOf<ReadonlyArray<CommentModel>>();
    }
  });

  it('graphs and subgraphs take end comments too; a DOT source no trailing', () => {
    new Digraph().addComment('x', { position: 'end' });
    new Subgraph().addComment('x', { position: 'end' });
    new Dot().addComment('x', { position: 'end' });
    // (types only: these calls would throw)
    void (() => {
      // @ts-expect-error a DOT source is not a statement
      new Dot().addComment('x', { position: 'trailing' });
    });
    // (types only: these calls would throw)
    void (() => {
      // @ts-expect-error no such kind
      new Node('a').addComment('x', { kind: 'Line' });
    });
  });

  it('the DSL has the methods with a $', () => {
    digraph((g) => {
      const a = g.node('a');
      expectTypeOf(a.$addComment('x')).toEqualTypeOf<CommentModel>();
      a.$removeComment(a.$comments[0]);
      // (types only: these calls would throw)
      void (() => {
        // @ts-expect-error a node has no body
        a.$addComment('x', { position: 'end' });
      });
      g.$addComment('x', { position: 'end' });
    });
    // (types only: these calls would throw)
    void (() => {
      // @ts-expect-error a DOT source is not a statement
      dsl(new Dot()).$addComment('x', { position: 'trailing' });
    });
  });

  it('the read-only types may have no comments', () => {
    expectTypeOf<ReadonlyNodeModel['comments']>().toEqualTypeOf<
      ReadonlyArray<CommentModel> | undefined
    >();
  });
});
