import { createRef } from 'react';
import type { GraphBaseModel } from 'ts-graphviz';
import { describe, expect, it } from 'vitest';
import { render, renderToDot } from '../render.js';
import { expectGraph, expectGraphStructure } from '../test-utils/assertions.js';
import { Digraph } from './Digraph.js';
import { Edge } from './Edge.js';
import { Node } from './Node.js';
import { Subgraph } from './Subgraph.js';
import '../types.js';

describe('Digraph Component', () => {
  describe('Basic Rendering', () => {
    it('renders empty directed graph', async () => {
      const dot = await renderToDot(<Digraph id="empty" />);
      expect(dot).toMatchInlineSnapshot(`
        "digraph "empty" {}"
      `);
    });

    it('renders directed graph with nodes', async () => {
      const dot = await renderToDot(
        <Digraph id="simple">
          <Node id="A" />
          <Node id="B" />
        </Digraph>,
      );
      expect(dot).toMatchInlineSnapshot(`
        "digraph "simple" {
          "A";
          "B";
        }"
      `);
    });

    it('renders directed graph with nodes and edges', async () => {
      const dot = await renderToDot(
        <Digraph id="connected">
          <Node id="A" />
          <Node id="B" />
          <Edge targets={['A', 'B']} />
        </Digraph>,
      );
      expect(dot).toMatchInlineSnapshot(`
        "digraph "connected" {
          "A";
          "B";
          "A" -> "B";
        }"
      `);
    });

    it('renders directed graph with attributes', async () => {
      const dot = await renderToDot(
        <Digraph id="styled" bgcolor="lightblue" rankdir="LR">
          <Node id="styled_node" shape="box" />
        </Digraph>,
      );
      expect(dot).toMatchInlineSnapshot(`
        "digraph "styled" {
          bgcolor = "lightblue";
          rankdir = "LR";
          "styled_node" [
            shape = "box";
          ];
        }"
      `);
    });
  });

  describe('Complex Structures', () => {
    it('renders directed graph with subgraphs', async () => {
      const dot = await renderToDot(
        <Digraph id="complex">
          <Node id="start" />
          <Subgraph id="cluster_main">
            <Node id="process" />
          </Subgraph>
          <Edge targets={['start', 'process']} />
        </Digraph>,
      );
      expect(dot).toMatchInlineSnapshot(`
        "digraph "complex" {
          "start";
          subgraph "cluster_main" {
            "process";
          }
          "start" -> "process";
        }"
      `);
    });

    it('renders directed graph with nested subgraphs', async () => {
      const dot = await renderToDot(
        <Digraph id="nested">
          <Subgraph id="outer">
            <Subgraph id="inner">
              <Node id="deep" />
            </Subgraph>
          </Subgraph>
        </Digraph>,
      );
      expect(dot).toMatchInlineSnapshot(`
        "digraph "nested" {
          subgraph "outer" {
            subgraph "inner" {
              "deep";
            }
          }
        }"
      `);
    });
  });

  describe('Error Handling', () => {
    it('throws error when duplicate Digraph components are nested', async () => {
      await expect(
        render(
          <Digraph>
            <Digraph />
          </Digraph>,
        ),
      ).rejects.toThrow('No model was rendered');
    });

    it('renders multiple root Digraphs as separate models', async () => {
      const result = await render(
        <>
          <Digraph id="first" />
          <Digraph id="second" />
        </>,
      );

      expect(result.models).toHaveLength(2);
      expect(result.models[0].id).toBe('first');
      expect(result.models[1].id).toBe('second');
    });
  });

  describe('React Integration', () => {
    it('provides access to GraphBaseModel via createRef', async () => {
      const graphRef = createRef<GraphBaseModel>();

      await render(
        <Digraph id="testgraph" ref={graphRef}>
          <Node id="A" />
          <Node id="B" />
          <Edge targets={['A', 'B']} />
        </Digraph>,
      );

      expect(graphRef.current).not.toBeNull();
      if (graphRef.current) {
        expectGraph(graphRef.current);
        expect(graphRef.current.id).toBe('testgraph');
        expectGraphStructure(graphRef.current, {
          nodeCount: 2,
          edgeCount: 1,
          directed: true,
        });
      }
    });

    it('provides access to GraphBaseModel via function ref', async () => {
      let graphModel: GraphBaseModel | null = null;

      await render(
        <Digraph
          id="funcref"
          ref={(graph) => {
            graphModel = graph;
          }}
          label="Function Ref Test"
        >
          <Node id="test" />
        </Digraph>,
      );

      expect(graphModel).not.toBeNull();
      if (graphModel) {
        expectGraph(graphModel);
        expect(graphModel.id).toBe('funcref');
        expect(graphModel.get('label')).toBe('Function Ref Test');
        expectGraphStructure(graphModel, {
          nodeCount: 1,
          directed: true,
        });
      }
    });
  });
});
