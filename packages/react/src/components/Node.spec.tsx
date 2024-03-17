import { describe, expect, test } from 'vitest';
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
            <dot:table border={0} cellborder={1} cellSpacing={0}>
              <dot:tr>
                <dot:td>left</dot:td>
                <dot:td port="m">middle</dot:td>
                <dot:td port="r">right</dot:td>
              </dot:tr>
            </dot:table>
          }
        />
      </Digraph>,
    );
    expect(dot).toMatchInlineSnapshot(`
      "digraph {
        "foo" [
          label = <<table border="0" cellborder="1" cellSpacing="0"><tr><td>left</td><td port="m">middle</td><td port="r">right</td></tr></table>>;
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
            <dot:table border={0} cellborder={1} cellSpacing={0}>
              <dot:tr>
                <dot:td>left</dot:td>
                <dot:td port="m">middle</dot:td>
                <dot:td port="r">right</dot:td>
              </dot:tr>
            </dot:table>
          }
        />
      </Digraph>,
    );
    expect(dot).toMatchInlineSnapshot(`
      "digraph {
        "foo" [
          xlabel = <<table border="0" cellborder="1" cellSpacing="0"><tr><td>left</td><td port="m">middle</td><td port="r">right</td></tr></table>>;
        ];
      }"
    `);
  });
});
