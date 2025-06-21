import { describe, expect, test } from 'vitest';
import { renderToDot } from '../render.js';
import { Digraph } from './Digraph.js';
import { Node } from './Node.js';
import '../types.js';

describe('Node', () => {
  test('should render Node with only required id prop', async () => {
    const dot = await renderToDot(
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

  test('should render Node with string label attribute', async () => {
    const dot = await renderToDot(
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

  test('should render Node with HTML-like table label element', async () => {
    const dot = await renderToDot(
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

  test('should render Node with string xlabel attribute', async () => {
    const dot = await renderToDot(
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

  test('should render Node with HTML-like table xlabel element', async () => {
    const dot = await renderToDot(
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
