import { createRef } from 'react';
import type { NodeModel } from 'ts-graphviz';
import { describe, expect, it } from 'vitest';
import { createRoot } from '../createRoot.js';
import { renderToDot } from '../renderToDot.js';
import { expectNode } from '../test-utils/assertions.js';
import { Digraph } from './Digraph.js';
import { Node } from './Node.js';
import '../types.js';

describe('Node Component', () => {
  describe('Basic Rendering', () => {
    it('renders node with only required id prop', async () => {
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

    it('renders node with string label attribute', async () => {
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
  });

  describe('Label Rendering', () => {
    it('renders node with HTML-like table label element', async () => {
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

    it('renders node with string xlabel attribute', async () => {
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

    it('renders node with HTML-like table xlabel element', async () => {
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

  describe('Attribute Rendering', () => {
    it('renders node with various shape attributes', async () => {
      const dot = await renderToDot(
        <Digraph>
          <Node id="box" shape="box" />
          <Node id="circle" shape="circle" />
          <Node id="diamond" shape="diamond" />
        </Digraph>,
      );
      expect(dot).toMatchInlineSnapshot(`
        "digraph {
          "box" [
            shape = "box";
          ];
          "circle" [
            shape = "circle";
          ];
          "diamond" [
            shape = "diamond";
          ];
        }"
      `);
    });

    it('renders node with color and style attributes', async () => {
      const dot = await renderToDot(
        <Digraph>
          <Node id="styled" color="red" fillcolor="yellow" style="filled" />
        </Digraph>,
      );
      expect(dot).toMatchInlineSnapshot(`
        "digraph {
          "styled" [
            color = "red";
            fillcolor = "yellow";
            style = "filled";
          ];
        }"
      `);
    });

    it('renders node with position attributes', async () => {
      const dot = await renderToDot(
        <Digraph>
          <Node id="positioned" pos="1,2!" pin={true} />
        </Digraph>,
      );
      expect(dot).toMatchInlineSnapshot(`
        "digraph {
          "positioned" [
            pos = "1,2!";
            pin = true;
          ];
        }"
      `);
    });
  });

  describe('Special ID Cases', () => {
    it('renders node with special character IDs', async () => {
      const dot = await renderToDot(
        <Digraph>
          <Node id="node-with-dashes" />
          <Node id="node_with_underscores" />
          <Node id="node.with.dots" />
        </Digraph>,
      );
      expect(dot).toMatchInlineSnapshot(`
        "digraph {
          "node-with-dashes";
          "node_with_underscores";
          "node.with.dots";
        }"
      `);
    });

    it('renders node with numeric ID', async () => {
      const dot = await renderToDot(
        <Digraph>
          <Node id="123" />
          <Node id="0" />
        </Digraph>,
      );
      expect(dot).toMatchInlineSnapshot(`
        "digraph {
          "123";
          "0";
        }"
      `);
    });
  });

  describe('React Integration', () => {
    it('provides access to NodeModel via createRef', async () => {
      const nodeRef = createRef<NodeModel>();
      const root = createRoot();

      await root.render(
        <Digraph>
          <Node id="testnode" ref={nodeRef} label="Test Node" />
        </Digraph>,
      );

      expect(nodeRef.current).not.toBeNull();
      if (nodeRef.current) {
        expectNode(nodeRef.current);
        expect(nodeRef.current.id).toBe('testnode');
        expect(nodeRef.current.attributes.get('label')).toBe('Test Node');
      }
    });

    it('provides access to NodeModel via function ref', async () => {
      let nodeModel: NodeModel | null = null;
      const root = createRoot();

      await root.render(
        <Digraph>
          <Node
            id="funcref"
            ref={(node) => {
              nodeModel = node;
            }}
            shape="circle"
            color="blue"
          />
        </Digraph>,
      );

      expect(nodeModel).not.toBeNull();
      if (nodeModel) {
        expectNode(nodeModel);
        expect(nodeModel.id).toBe('funcref');
        expect(nodeModel.attributes.get('shape')).toBe('circle');
        expect(nodeModel.attributes.get('color')).toBe('blue');
      }
    });

    it('handles ref updates correctly', async () => {
      let refCallCount = 0;
      let currentNode: NodeModel | null = null;

      const TestComponent = ({ nodeId }: { nodeId: string }) => (
        <Digraph>
          <Node
            id={nodeId}
            ref={(node) => {
              currentNode = node;
              if (node) {
                refCallCount++;
              }
            }}
          />
        </Digraph>
      );

      const root = createRoot();
      await root.render(<TestComponent nodeId="first" />);
      expect(refCallCount).toBe(1);
      expect(currentNode?.id).toBe('first');

      await root.render(<TestComponent nodeId="second" />);
      expect(refCallCount).toBe(2);
      expect(currentNode?.id).toBe('second');
    });
  });
});
