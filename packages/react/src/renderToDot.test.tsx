import React from 'react';
import { Digraph as DigraphModel } from 'ts-graphviz';
import { describe, expect, it, vi } from 'vitest';
import { Digraph } from './components/Digraph.js';
import { Edge } from './components/Edge.js';
import { Graph } from './components/Graph.js';
import { Node } from './components/Node.js';
import { Subgraph } from './components/Subgraph.js';
import { renderToDot } from './renderToDot.js';

describe('renderToDot()', () => {
  describe('Without container', () => {
    it('renders a simple digraph to DOT', async () => {
      const dot = await renderToDot(
        <Digraph id="simple">
          <Node id="a" />
          <Node id="b" />
          <Edge targets={['a', 'b']} />
        </Digraph>,
      );

      expect(dot).toContain('digraph "simple"');
      expect(dot).toContain('"a"');
      expect(dot).toContain('"b"');
      expect(dot).toContain('"a" -> "b"');
    });

    it('renders a simple graph to DOT', async () => {
      const dot = await renderToDot(
        <Graph id="simple">
          <Node id="a" />
          <Node id="b" />
          <Edge targets={['a', 'b']} />
        </Graph>,
      );

      expect(dot).toContain('graph "simple"');
      expect(dot).toContain('"a"');
      expect(dot).toContain('"b"');
      expect(dot).toContain('"a" -- "b"');
    });

    it('renders a graph with subgraphs to DOT', async () => {
      const dot = await renderToDot(
        <Digraph id="complex">
          <Node id="start" />
          <Subgraph id="cluster_main">
            <Node id="a" />
            <Node id="b" />
            <Edge targets={['a', 'b']} />
          </Subgraph>
          <Edge targets={['start', 'a']} />
        </Digraph>,
      );

      expect(dot).toContain('digraph "complex"');
      expect(dot).toContain('subgraph "cluster_main"');
      expect(dot).toContain('"start"');
      expect(dot).toContain('"start" -> "a"');
    });

    it('renders an empty graph to DOT', async () => {
      const dot = await renderToDot(<Digraph id="empty" />);

      expect(dot).toContain('digraph "empty"');
      expect(dot).toContain('{}');
    });
  });

  describe('With container', () => {
    it('renders container with added elements to DOT', async () => {
      const container = new DigraphModel('container');

      const dot = await renderToDot(
        <>
          <Node id="a" />
          <Node id="b" />
          <Edge targets={['a', 'b']} />
        </>,
        { container },
      );

      expect(dot).toContain('digraph "container"');
      expect(dot).toContain('"a"');
      expect(dot).toContain('"b"');
      expect(dot).toContain('"a" -> "b"');
    });

    it('renders container with subgraphs to DOT', async () => {
      const container = new DigraphModel('main');

      const dot = await renderToDot(
        <>
          <Node id="start" />
          <Subgraph id="cluster_sub">
            <Node id="a" />
            <Node id="b" />
          </Subgraph>
          <Edge targets={['start', 'a']} />
        </>,
        { container },
      );

      expect(dot).toContain('digraph "main"');
      expect(dot).toContain('subgraph "cluster_sub"');
      expect(dot).toContain('"start"');
      expect(dot).toContain('"start" -> "a"');
    });

    it('renders empty fragment with container to DOT', async () => {
      const container = new DigraphModel('empty_container');

      const dot = await renderToDot(<React.Fragment />, { container });

      expect(dot).toContain('digraph "empty_container"');
      expect(dot).toContain('{}');
    });
  });

  describe('Error cases', () => {
    it('throws error for multiple top-level graphs', async () => {
      await expect(
        renderToDot(
          <>
            <Digraph id="graph1">
              <Node id="a" />
            </Digraph>
            <Graph id="graph2">
              <Node id="b" />
            </Graph>
          </>,
        ),
      ).rejects.toThrow(/Multiple top-level graphs detected/);
    });

    it('throws error when no top-level graph is provided', async () => {
      await expect(
        renderToDot(
          <>
            <Node id="orphan" />
            <Edge targets={['a', 'b']} />
          </>,
        ),
      ).rejects.toThrow(/No top-level graph found/);
    });

    it('throws error for fragment with multiple graphs', async () => {
      await expect(
        renderToDot(
          <React.Fragment>
            <Digraph id="graph1">
              <Node id="a" />
            </Digraph>
            <Digraph id="graph2">
              <Node id="b" />
            </Digraph>
          </React.Fragment>,
        ),
      ).rejects.toThrow(/Multiple top-level graphs detected/);
    });
  });

  describe('HTML-like labels', () => {
    it('renders graphs with HTML-like labels', async () => {
      const dot = await renderToDot(
        <Digraph id="html_test">
          <Node
            id="table"
            label={
              <dot:table border="0" cellborder="1" cellspacing="0">
                <dot:tr>
                  <dot:td>Cell 1</dot:td>
                  <dot:td>Cell 2</dot:td>
                </dot:tr>
              </dot:table>
            }
          />
        </Digraph>,
      );

      expect(dot).toContain('digraph "html_test"');
      expect(dot).toContain('table');
      expect(dot).toContain('Cell 1');
      expect(dot).toContain('Cell 2');
    });
  });

  describe('props are read from their own properties', () => {
    it('renders the same DOT whatever Object.prototype holds', async () => {
      const element = (
        <Digraph id="G">
          <Node id="a" />
          <Edge targets={['a', 'b']} />
          <Subgraph id="s">
            <Node id="c" />
          </Subgraph>
        </Digraph>
      );
      const clean = await renderToDot(element);
      const proto = Object.prototype as Record<string, unknown>;
      const inherited = {
        label: 'extra',
        xlabel: 'extra',
        comment: 'extra',
        node: { shape: 'box' },
        edge: { color: 'red' },
        graph: { rankdir: 'LR' },
      };
      Object.assign(proto, inherited);
      let dot: string;
      try {
        dot = await renderToDot(element);
      } finally {
        for (const key of Object.keys(inherited)) delete proto[key];
      }
      expect(dot).toBe(clean);
    });

    it('does not read a keyed element key as a prop', async () => {
      const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
      try {
        await renderToDot(
          <Digraph id="G">
            {['a', 'b'].map((id) => (
              <Node key={id} id={id} />
            ))}
          </Digraph>,
        );
        expect(errors).not.toHaveBeenCalled();
      } finally {
        errors.mockRestore();
      }
    });
  });
});
