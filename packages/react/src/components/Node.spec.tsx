import { describe, expect, test } from 'vitest';
import { DOT } from '../labels.js';
import { renderToDot } from '../render.js';
import { Digraph } from './Digraph.js';
import { Node } from './Node.js';

describe('Node', () => {
  test('pass without optional props and render correctly', () => {
    const dot = renderToDot(
      <Digraph>
        <Node id="foo" />
      </Digraph>,
    );
    expect(dot).toMatchInlineSnapshot(`
      "digraph {
        "foo";
      }"
    `);
  });

  test('pass label with string and render correctly', () => {
    const dot = renderToDot(
      <Digraph>
        <Node id="foo" label="label test" />
      </Digraph>,
    );
    expect(dot).toMatchInlineSnapshot(`
      "digraph {
        "foo" [
          label = "label test";
        ];
      }"
    `);
  });

  test('pass label with HTMLLike ReactElement and render correctly', () => {
    const dot = renderToDot(
      <Digraph>
        <Node
          id="foo"
          label={
            <DOT.TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0">
              <DOT.TR>
                <DOT.TD>left</DOT.TD>
                <DOT.TD PORT="m">middle</DOT.TD>
                <DOT.TD PORT="r">right</DOT.TD>
              </DOT.TR>
            </DOT.TABLE>
          }
        />
      </Digraph>,
    );
    expect(dot).toMatchInlineSnapshot(`
      "digraph {
        "foo" [
          label = <<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0"><TR><TD>left</TD><TD PORT="m">middle</TD><TD PORT="r">right</TD></TR></TABLE>>;
        ];
      }"
    `);
  });

  test('pass xlabel with string and render correctly', () => {
    const dot = renderToDot(
      <Digraph>
        <Node id="foo" xlabel="xlabel test" />
      </Digraph>,
    );
    expect(dot).toMatchInlineSnapshot(`
      "digraph {
        "foo" [
          xlabel = "xlabel test";
        ];
      }"
    `);
  });

  test('pass xlabel with HTMLLike ReactElement and render correctly', () => {
    const dot = renderToDot(
      <Digraph>
        <Node
          id="foo"
          xlabel={
            <DOT.TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0">
              <DOT.TR>
                <DOT.TD>left</DOT.TD>
                <DOT.TD PORT="m">middle</DOT.TD>
                <DOT.TD PORT="r">right</DOT.TD>
              </DOT.TR>
            </DOT.TABLE>
          }
        />
      </Digraph>,
    );
    expect(dot).toMatchInlineSnapshot(`
      "digraph {
        "foo" [
          xlabel = <<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0"><TR><TD>left</TD><TD PORT="m">middle</TD><TD PORT="r">right</TD></TR></TABLE>>;
        ];
      }"
    `);
  });
});
