import {
  type ArrowName,
  type ArrowType,
  type Attribute,
  arrow,
  digraph,
} from 'ts-graphviz';
import { describe, expectTypeOf, it } from 'vitest';

// The arrow names (#1897). ArrowType is a union of thousands of literals:
// compare it by Equals or by toExtend both ways, never by toEqualTypeOf,
// whose deep comparison does not finish on a union this large.

/** Equality by the checker's own identity relation. */
type Equals<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;

/** Graphviz's table of arrow shapes, written out. */
type Table =
  | 'none'
  | 'box'
  | 'obox'
  | 'lbox'
  | 'rbox'
  | 'olbox'
  | 'orbox'
  | 'crow'
  | 'lcrow'
  | 'rcrow'
  | 'curve'
  | 'lcurve'
  | 'rcurve'
  | 'diamond'
  | 'odiamond'
  | 'ldiamond'
  | 'rdiamond'
  | 'oldiamond'
  | 'ordiamond'
  | 'dot'
  | 'odot'
  | 'icurve'
  | 'licurve'
  | 'ricurve'
  | 'inv'
  | 'oinv'
  | 'linv'
  | 'rinv'
  | 'olinv'
  | 'orinv'
  | 'normal'
  | 'onormal'
  | 'lnormal'
  | 'rnormal'
  | 'olnormal'
  | 'ornormal'
  | 'tee'
  | 'ltee'
  | 'rtee'
  | 'vee'
  | 'lvee'
  | 'rvee';

describe('ArrowType', () => {
  it('has the shapes of Graphviz’s table', () => {
    expectTypeOf<Equals<ArrowType.aname, Table>>().toEqualTypeOf<true>();
    expectTypeOf<
      Equals<ArrowType.last, Exclude<Table, 'none'>>
    >().toEqualTypeOf<true>();
  });

  it('is the names of one or two shapes, or an ArrowName', () => {
    type Expected = Table | `${Table}${Exclude<Table, 'none'>}` | ArrowName;
    expectTypeOf<Equals<ArrowType, Expected>>().toEqualTypeOf<true>();
    expectTypeOf<Attribute<'arrowhead'>>().toExtend<ArrowType>();
    expectTypeOf<ArrowType>().toExtend<Attribute<'arrowhead'>>();
  });

  it('takes the literals Graphviz takes, and no others', () => {
    const ok: ArrowType[] = ['none', 'odot', 'lteeoldiamond', 'nonenormal'];
    // @ts-expect-error dot takes no side
    const side: ArrowType = 'ldot';
    // @ts-expect-error crow does not open
    const open: ArrowType = 'ocrow';
    // @ts-expect-error none cannot end a name of two shapes
    const last: ArrowType = 'dotnone';
    // @ts-expect-error three shapes: made with arrow()
    const three: ArrowType = 'dotdotdot';
    // @ts-expect-error any string
    const text: ArrowType = 'dot' as string;
    void [ok, side, open, last, three, text];
  });
});

describe('arrow', () => {
  it('makes names of up to four shapes', () => {
    expectTypeOf(arrow('obox', 'ltee', 'vee')).toEqualTypeOf<ArrowName>();
    expectTypeOf<ArrowName>().toExtend<ArrowType>();
    expectTypeOf<ArrowName>().toExtend<string>();
    // Only arrow() gives one: the brand cannot be written.
    // @ts-expect-error a string is not an ArrowName
    const text: ArrowName = 'dotdotdot';
    // @ts-expect-error nor a string with a property of the brand's name
    const forged: ArrowName = Object.assign('x', {
      $$arrowName: true as const,
    });
    void [text, forged];
    arrow('none');
    arrow('none', 'none', 'dot', 'olnormal');
  });

  it('takes only the shapes of the table, the last of two or more not none', () => {
    // @ts-expect-error dot takes no side
    arrow('ldot');
    // @ts-expect-error none cannot come last after another shape
    arrow('dot', 'none');
    // @ts-expect-error nor after two
    arrow('dot', 'dot', 'none');
    // @ts-expect-error nor after three
    arrow('dot', 'dot', 'dot', 'none');
    // @ts-expect-error at most four
    arrow('dot', 'dot', 'dot', 'dot', 'dot');
    // @ts-expect-error at least one
    arrow();
    // @ts-expect-error one shape per argument
    arrow('dotdot');
    // @ts-expect-error a string is not a shape
    arrow('dot' as string);
  });

  it('is an arrowhead and an arrowtail', () => {
    digraph((g) => {
      const e = g.edge(['a', 'b'], { arrowhead: arrow('dot', 'dot', 'dot') });
      e.attributes.set('arrowtail', arrow('obox', 'ltee', 'vee', 'odot'));
      e.attributes.set('arrowhead', 'odot');
      expectTypeOf(e.attributes.get('arrowhead')).toExtend<
        ArrowType | undefined
      >();
      // @ts-expect-error three shapes as a literal
      e.attributes.set('arrowtail', 'dotdotdot');
    });
  });
});
