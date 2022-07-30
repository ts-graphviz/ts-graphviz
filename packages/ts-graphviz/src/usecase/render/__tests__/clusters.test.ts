import { describe, expect, test, beforeEach, it } from 'vitest';
import { EdgeTargetTuple, ISubgraph, Subgraph } from '@ts-graphviz/model';
import { toDot } from '../to-dot.js';

describe('Subgraph rendering', () => {
  let subgraph: ISubgraph;
  beforeEach(() => {
    subgraph = new Subgraph('test');
  });

  describe('subgraph with comment', () => {
    test('single line comment', () => {
      subgraph.comment = 'this is comment.';
      expect(toDot(subgraph)).toMatchSnapshot();
    });

    test('multi line comment', () => {
      subgraph.comment = 'this is comment.\nsecond line.';
      expect(toDot(subgraph)).toMatchSnapshot();
    });

    describe('label attribute behavior', () => {
      it('plain text label to be quoted by double quotation', () => {
        subgraph.attributes.graph.set('label', 'this is test for graph label');
        subgraph.attributes.edge.set('label', 'this is test for edge label');
        subgraph.attributes.node.set('label', 'this is test for node label');
        expect(toDot(subgraph)).toMatchSnapshot();
      });

      it('html like', () => {
        subgraph.attributes.graph.set('label', '<<B>this is test for graph label</B>>');
        subgraph.attributes.edge.set('label', '<<U>this is test for edge label</U>>');
        subgraph.attributes.node.set('label', '<<I>this is test for node label</I>>');
        expect(toDot(subgraph)).toMatchSnapshot();
      });
    });

    describe('addXxx existXxx removeXxx APIs', () => {
      it('Edge operation methods works', () => {
        const nodes = ['node1', 'node2'].map((id) => subgraph.createNode(id)) as EdgeTargetTuple;
        const edge = subgraph.createEdge(nodes);
        expect(subgraph.existEdge(edge)).toBe(true);
        expect(toDot(subgraph)).toMatchSnapshot();
      });

      it('Subgraph operation methods works', () => {
        const sub = subgraph.createSubgraph('sub');
        expect(subgraph.existSubgraph(sub)).toBe(true);
        expect(toDot(subgraph)).toMatchSnapshot();
      });
    });
  });
});
