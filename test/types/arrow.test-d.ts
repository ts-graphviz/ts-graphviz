import { ArrowType, type Attribute, digraph, modelOf } from 'ts-graphviz';
import { describe, expectTypeOf, it } from 'vitest';

// The arrow names (#1897). ArrowType is a union of 1,764 literals: compare
// it by Equals or by toExtend both ways, not by toEqualTypeOf. Its deep
// comparison finishes on this union but takes 5 to 15 seconds; on the old
// union of 4,422 it ran out of memory.

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

  it('is the names of one or two shapes, or a built name', () => {
    type Expected =
      | Table
      | `${Table}${Exclude<Table, 'none'>}`
      | ArrowType.Built;
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
    // @ts-expect-error three shapes: made with ArrowType.build()
    const three: ArrowType = 'dotdotdot';
    // @ts-expect-error any string
    const text: ArrowType = 'dot' as string;
    void [ok, side, open, last, three, text];
  });
});

describe('ArrowType.build', () => {
  it('makes names of up to four shapes', () => {
    expectTypeOf(
      ArrowType.build('obox', 'ltee', 'vee'),
    ).toEqualTypeOf<ArrowType.Built>();
    expectTypeOf<ArrowType.Built>().toExtend<ArrowType>();
    expectTypeOf<ArrowType.Built>().toExtend<string>();
    // Only ArrowType.build() gives one: the brand cannot be written.
    // @ts-expect-error a string is not an ArrowType.Built
    const text: ArrowType.Built = 'dotdotdot';
    // @ts-expect-error nor a string with a property of the brand's name
    const forged: ArrowType.Built = Object.assign('x', {
      $$arrowName: true as const,
    });
    void [text, forged];
    ArrowType.build('none');
    ArrowType.build('none', 'none', 'dot', 'olnormal');
  });

  it('takes only the shapes of the table, the last of two or more not none', () => {
    // @ts-expect-error dot takes no side
    ArrowType.build('ldot');
    // @ts-expect-error none cannot come last after another shape
    ArrowType.build('dot', 'none');
    // @ts-expect-error nor after two
    ArrowType.build('dot', 'dot', 'none');
    // @ts-expect-error nor after three
    ArrowType.build('dot', 'dot', 'dot', 'none');
    // @ts-expect-error at most four
    ArrowType.build('dot', 'dot', 'dot', 'dot', 'dot');
    // @ts-expect-error at least one
    ArrowType.build();
    // @ts-expect-error one shape per argument
    ArrowType.build('dotdot');
    // @ts-expect-error a string is not a shape
    ArrowType.build('dot' as string);
    // @ts-expect-error build cannot be replaced
    ArrowType.build = () => 'dot' as ArrowType.Built;
  });

  it('is an arrowhead and an arrowtail', () => {
    digraph((g) => {
      const e = g.edge(['a', 'b'], {
        arrowhead: ArrowType.build('dot', 'dot', 'dot'),
      });
      e.arrowtail = ArrowType.build('obox', 'ltee', 'vee', 'odot');
      e.arrowhead = 'odot';
      modelOf(e).setAttribute(
        'arrowhead',
        ArrowType.build('dot', 'dot', 'dot'),
      );
      expectTypeOf(e.arrowhead).toExtend<ArrowType | undefined>();
      // @ts-expect-error three shapes as a literal
      e.arrowtail = 'dotdotdot';
      // @ts-expect-error not an arrow name
      e.arrowhead = 'not-an-arrow';
      // @ts-expect-error nor through the model
      modelOf(e).setAttribute('arrowtail', 'dotdotdot');
    });
  });
});
