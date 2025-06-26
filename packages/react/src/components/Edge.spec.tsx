import { createRef } from 'react';
import type { EdgeModel, RootGraphModel } from 'ts-graphviz';
import { describe, expect, it } from 'vitest';
import { render, renderToDot } from '../render.js';
import { expectEdge } from '../test-utils/assertions.js';
import { Digraph } from './Digraph.js';
import { Edge } from './Edge.js';
import { Node } from './Node.js';
import '../types.js';

describe('Edge Component', () => {
  describe('Basic Rendering', () => {
    it('renders edge between two nodes', async () => {
      const dot = await renderToDot(
        <Digraph>
          <Node id="A" />
          <Node id="B" />
          <Edge targets={['A', 'B']} />
        </Digraph>,
      );
      expect(dot).toMatchInlineSnapshot(`
        "digraph {
          "A";
          "B";
          "A" -> "B";
        }"
      `);
    });

    it('renders edge with label attribute', async () => {
      const dot = await renderToDot(
        <Digraph>
          <Node id="A" />
          <Node id="B" />
          <Edge targets={['A', 'B']} label="Test Edge" />
        </Digraph>,
      );
      expect(dot).toMatchInlineSnapshot(`
        "digraph {
          "A";
          "B";
          "A" -> "B" [
            label = "Test Edge";
          ];
        }"
      `);
    });

    it('renders edge with multiple attributes', async () => {
      const dot = await renderToDot(
        <Digraph>
          <Node id="A" />
          <Node id="B" />
          <Edge
            targets={['A', 'B']}
            label="Styled Edge"
            color="red"
            style="dashed"
          />
        </Digraph>,
      );
      expect(dot).toMatchInlineSnapshot(`
        "digraph {
          "A";
          "B";
          "A" -> "B" [
            color = "red";
            style = "dashed";
            label = "Styled Edge";
          ];
        }"
      `);
    });
  });

  describe('Multi-target Edges', () => {
    it('renders edge with multiple targets', async () => {
      const dot = await renderToDot(
        <Digraph>
          <Node id="A" />
          <Node id="B" />
          <Node id="C" />
          <Edge targets={['A', 'B', 'C']} />
        </Digraph>,
      );
      expect(dot).toMatchInlineSnapshot(`
        "digraph {
          "A";
          "B";
          "C";
          "A" -> "B" -> "C";
        }"
      `);
    });

    it('renders edge with port specifications', async () => {
      const dot = await renderToDot(
        <Digraph>
          <Node id="A" />
          <Node id="B" />
          <Edge
            targets={[
              { id: 'A', port: 'e' },
              { id: 'B', port: 'w' },
            ]}
          />
        </Digraph>,
      );
      expect(dot).toMatchInlineSnapshot(`
        "digraph {
          "A";
          "B";
          "A":"e" -> "B":"w";
        }"
      `);
    });
  });

  describe('React Integration', () => {
    it('provides access to EdgeModel via createRef', async () => {
      const edgeRef = createRef<EdgeModel>();

      await render<RootGraphModel>(
        <Digraph>
          <Node id="A" />
          <Node id="B" />
          <Edge targets={['A', 'B']} ref={edgeRef} label="Test Edge" />
        </Digraph>,
      );

      expect(edgeRef.current).not.toBeNull();
      if (edgeRef.current) {
        expectEdge(edgeRef.current);
        expect(edgeRef.current.targets).toHaveLength(2);
        expect(edgeRef.current.targets[0]).toMatchObject({ id: 'A' });
        expect(edgeRef.current.targets[1]).toMatchObject({ id: 'B' });
        expect(edgeRef.current.attributes.get('label')).toBe('Test Edge');
      }
    });

    it('provides access to EdgeModel via function ref', async () => {
      let edgeModel: EdgeModel | null = null;

      await render<RootGraphModel>(
        <Digraph>
          <Node id="X" />
          <Node id="Y" />
          <Edge
            targets={['X', 'Y']}
            ref={(edge) => {
              edgeModel = edge;
            }}
            color="blue"
          />
        </Digraph>,
      );

      expect(edgeModel).not.toBeNull();
      if (edgeModel) {
        expectEdge(edgeModel);
        expect(edgeModel.targets).toHaveLength(2);
        expect(edgeModel.attributes.get('color')).toBe('blue');
      }
    });
  });
});
