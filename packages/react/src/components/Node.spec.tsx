import { useRef } from 'react';
import type { NodeModel } from 'ts-graphviz';
import { describe, expect, test } from 'vitest';
import { render, renderToDot } from '../render.js';
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

  describe('ref support', () => {
    test('should provide access to NodeModel via ref', async () => {
      let nodeRef: NodeModel | null = null;

      const TestComponent = () => {
        const ref = useRef<NodeModel>(null);

        return (
          <Digraph>
            <Node
              id="testnode"
              ref={(node) => {
                ref.current = node;
                nodeRef = node;
              }}
              label="Test Node"
            />
          </Digraph>
        );
      };

      await render(<TestComponent />);

      expect(nodeRef).not.toBeNull();
      expect(nodeRef?.id).toBe('testnode');
    });

    test('should work with function refs', async () => {
      let capturedNode: NodeModel | null = null;

      const TestComponent = () => (
        <Digraph>
          <Node
            id="functionref"
            ref={(node) => {
              capturedNode = node;
            }}
            label="Function Ref Node"
          />
        </Digraph>
      );

      await render(<TestComponent />);

      expect(capturedNode).not.toBeNull();
      expect(capturedNode?.id).toBe('functionref');
    });

    test('should allow model manipulation via ref', async () => {
      let nodeRef: NodeModel | null = null;

      const TestComponent = () => (
        <Digraph>
          <Node
            id="manipulatable"
            ref={(node) => {
              nodeRef = node;
            }}
          />
        </Digraph>
      );

      const result = await render(<TestComponent />);

      expect(nodeRef).not.toBeNull();

      // Manipulate the node via ref
      nodeRef?.attributes.set('color', 'red');
      nodeRef?.attributes.set('shape', 'box');
      if (nodeRef) {
        nodeRef.comment = 'Modified via ref';
      }

      // Verify changes were applied
      const targetNode = result.graph.nodes.find(
        (n) => n.id === 'manipulatable',
      );
      expect(targetNode?.attributes.get('color')).toBe('red');
      expect(targetNode?.attributes.get('shape')).toBe('box');
      expect(targetNode?.comment).toBe('Modified via ref');
    });
  });
});
