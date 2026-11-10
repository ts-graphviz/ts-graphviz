import {
  type DSL,
  type FromDotOptions,
  fromDot,
  fromDotAll,
  type ModelsContext,
  Node,
  type NodeModel,
} from 'ts-graphviz';
import * as legacy from 'ts-graphviz/legacy';
import { describe, expectTypeOf, it } from 'vitest';

class MyNode extends Node {
  get shout(): string {
    return this.id.toUpperCase();
  }
}
const models = { Node: MyNode };

describe('fromDot', () => {
  it('types the DSL of the model it types without dsl', () => {
    const G = fromDot('');
    expectTypeOf(fromDot('', { dsl: true })).toEqualTypeOf<DSL<typeof G>>();
    const model = fromDot('', { parse: { as: 'Node' } });
    const a = fromDot('', { dsl: true, parse: { as: 'Node' } });
    expectTypeOf(a).toEqualTypeOf<DSL<typeof model>>();
    expectTypeOf(a.$$type).toEqualTypeOf<'Node'>();
  });

  it('types the DSL of the classes given', () => {
    const model = fromDot('', { parse: { as: 'Node' }, convert: { models } });
    expectTypeOf(model).toEqualTypeOf<MyNode>();
    const a = fromDot('', {
      dsl: true,
      parse: { as: 'Node' },
      convert: { models },
    });
    expectTypeOf(a).toEqualTypeOf<DSL<MyNode>>();
    const M = fromDot('', { convert: { models } });
    expectTypeOf(fromDot('', { dsl: true, convert: { models } })).toEqualTypeOf<
      DSL<typeof M>
    >();
  });

  it('types the model when dsl is left out or false', () => {
    expectTypeOf(fromDot('', { dsl: false })).toEqualTypeOf(fromDot(''));
    expectTypeOf(
      fromDot('', { dsl: false, parse: { as: 'Edge' } }),
    ).toEqualTypeOf(fromDot('', { parse: { as: 'Edge' } }));
  });

  it('takes dsl from the type of options held in a variable', () => {
    const model: FromDotOptions<'Node'> = { parse: { as: 'Node' } };
    expectTypeOf(fromDot('a', model)).toEqualTypeOf<NodeModel>();
    const view: FromDotOptions<'Node', Partial<ModelsContext>, true> = {
      parse: { as: 'Node' },
      dsl: true,
    };
    expectTypeOf(fromDot('a', view)).toEqualTypeOf<DSL<NodeModel>>();
    // @ts-expect-error the type says the model
    ({ dsl: true }) satisfies FromDotOptions<'Node'>;
  });

  it('does not type a DSL without dsl: true', () => {
    // @ts-expect-error no options say dsl: true
    fromDot<true>('digraph {}');
    // @ts-expect-error no options say dsl: true
    fromDotAll<true>('digraph {}');
    // @ts-expect-error a DSL needs dsl: true
    ({ parse: { as: 'Node' } }) satisfies FromDotOptions<
      'Node',
      Partial<ModelsContext>,
      true
    >;
  });

  it('types both for a boolean', () => {
    const d = Math.random() > 0.5;
    const G = fromDot('');
    expectTypeOf(fromDot('', { dsl: d })).toEqualTypeOf<
      typeof G | DSL<typeof G>
    >();
  });
});

describe('fromDotAll', () => {
  it('types the DSLs with dsl: true', () => {
    const [G] = fromDotAll('');
    expectTypeOf(fromDotAll('', { dsl: true })).toEqualTypeOf<
      DSL<typeof G>[]
    >();
    const [M] = fromDotAll('', { convert: { models } });
    expectTypeOf(
      fromDotAll('', { dsl: true, convert: { models } }),
    ).toEqualTypeOf<DSL<typeof M>[]>();
  });
});

describe('ts-graphviz/legacy', () => {
  it('types the same', () => {
    expectTypeOf(legacy.fromDot('', { dsl: true })).toEqualTypeOf(
      fromDot('', { dsl: true }),
    );
    expectTypeOf(
      legacy.fromDotAll('', { dsl: true, convert: { models } }),
    ).toEqualTypeOf(fromDotAll('', { dsl: true, convert: { models } }));
  });
});
