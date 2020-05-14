import 'jest-graphviz';
import { DotObject, GraphvizObject } from '../abstract';
import { ISubgraph, IDotContext } from '../../types';
import { AttributesBase } from '../attributes-base';
import { Cluster } from '../clusters';
import { Digraph, Graph, RootCluster } from '../root-clusters';
import { Node } from '../nodes';
import { Subgraph } from '../clusters';
import { toDot } from '../../render/to-dot';

describe('class Subgraph', () => {
  let root: RootCluster;
  let context: IDotContext;
  const testCases: { title: string; beforeEachFunc: () => void }[] = [
    {
      title: 'root is Digraph',
      beforeEachFunc: (): void => {
        root = new Digraph();
        context = {
          root,
        };
      },
    },
    {
      title: 'root is Graph',
      beforeEachFunc: (): void => {
        root = new Graph();
        context = {
          root,
        };
      },
    },
  ];

  testCases.forEach(({ title, beforeEachFunc }) => {
    describe(title, () => {
      beforeEach(beforeEachFunc);
      let subgraph: ISubgraph;

      beforeEach(() => {
        subgraph = root.createSubgraph('test');
      });

      it('should be instance of Subgraph/Cluster/AttributesBase/DotObject/GraphvizObject', () => {
        expect(subgraph).toBeInstanceOf(Subgraph);
        expect(subgraph).toBeInstanceOf(Cluster);
        expect(subgraph).toBeInstanceOf(AttributesBase);
        expect(subgraph).toBeInstanceOf(DotObject);
        expect(subgraph).toBeInstanceOf(GraphvizObject);
      });

      test('set attributes', () => {
        subgraph.set('rank', 'same');
        root.addSubgraph(subgraph);
        const dot = toDot(root, context);
        expect(dot).toBeValidDotAndMatchSnapshot();
      });

      test('set attributes by apply', () => {
        subgraph.apply({
          rank: 'same',
        });
        root.addSubgraph(subgraph);
        const dot = toDot(root, context);
        expect(dot).toBeValidDotAndMatchSnapshot();
      });

      it('should be subgraph, when subgraph id is "test"', () => {
        subgraph = root.createSubgraph('test');
        expect(subgraph.isSubgraphCluster()).toBe(false);
      });

      test.each([
        ['cluster', true],
        ['cluster_hoge', true],
        ['hoge_cluster', false],
        ['example', false],
      ])('if cluster named "%s", isSubgraphCluster should be %p', (id, expected) => {
        subgraph = root.createSubgraph(id);
        expect(subgraph.isSubgraphCluster()).toBe(expected);
      });

      describe('subgraph with comment', () => {
        test('single line comment', () => {
          subgraph.comment = 'this is comment.';
          expect(toDot(subgraph, context)).toMatchSnapshot();
        });

        test('multi line comment', () => {
          subgraph.comment = 'this is comment.\nsecond line.';
          expect(toDot(subgraph, context)).toMatchSnapshot();
        });
      });

      it('should be subgraph cluster, when subgraph id is "cluster_test"', () => {
        subgraph = root.createSubgraph('cluster_test');
        expect(subgraph.isSubgraphCluster()).toBe(true);
      });

      describe('label attribute behavior', () => {
        it('plain text label to be quoted by double quotation', () => {
          subgraph.attributes.graph.set('label', 'this is test for graph label');
          subgraph.attributes.edge.set('label', 'this is test for edge label');
          subgraph.attributes.node.set('label', 'this is test for node label');
          expect(toDot(subgraph, context)).toMatchSnapshot();
          expect(toDot(root, context)).toBeValidDot();
        });

        it('html like', () => {
          subgraph.attributes.graph.set('label', '<<B>this is test for graph label</B>>');
          subgraph.attributes.edge.set('label', '<<U>this is test for edge label</U>>');
          subgraph.attributes.node.set('label', '<<I>this is test for node label</I>>');
          expect(toDot(subgraph, context)).toMatchSnapshot();
          expect(toDot(root, context)).toBeValidDot();
        });
      });

      describe('addXxx existXxx removeXxx APIs', () => {
        it('Node operation methods works', () => {
          const id = 'node';
          expect(subgraph.existNode(id)).toBe(false);
          const node = new Node(id);
          subgraph.addNode(node);
          expect(subgraph.existNode(id)).toBe(true);
          subgraph.removeNode(node);
          expect(subgraph.existNode(id)).toBe(false);
          subgraph.addNode(node);
          expect(subgraph.existNode(id)).toBe(true);
          subgraph.removeNode(node.id);
          expect(subgraph.existNode(id)).toBe(false);
        });

        it('Edge operation methods works', () => {
          const nodes = ['node1', 'node2'].map((id) => subgraph.createNode(id));
          const edge = subgraph.createEdge(nodes);
          expect(subgraph.existEdge(edge)).toBe(true);
          expect(toDot(subgraph, context)).toMatchSnapshot();
          subgraph.removeEdge(edge);
          expect(subgraph.existEdge(edge)).toBe(false);
        });

        it('Subgraph operation methods works', () => {
          const sub = subgraph.createSubgraph('sub');
          expect(subgraph.existSubgraph(sub)).toBe(true);
          expect(toDot(subgraph, context)).toMatchSnapshot();
          subgraph.removeSubgraph(sub);
          expect(subgraph.existSubgraph(sub)).toBe(false);
          subgraph.addSubgraph(sub);
          expect(subgraph.existSubgraph(sub)).toBe(true);
          subgraph.removeSubgraph(sub);
          expect(subgraph.existSubgraph(sub)).toBe(false);
        });

        it('should be undefined, when id not set', () => {
          const sub = subgraph.createSubgraph();
          expect(sub.id).toBeUndefined();
          expect(sub.isSubgraphCluster()).toBe(false);
        });

        it('throws an error when the EdgeTarget element is missing', () => {
          const n = subgraph.node('n');
          expect(() => {
            subgraph.edge([]);
          }).toThrow();
          expect(() => {
            subgraph.edge([n]);
          }).toThrow();
        });

        describe('subgraph method', () => {
          it('should be an unnamed Subgraph, when a subgraph is created without specifying an ID.', () => {
            const sub = root.subgraph();
            expect(sub.id).toBeUndefined();
          });

          it('should be same object, when a subgraph with an existing ID is specified', () => {
            const id = 'hoge';
            const sub = root.createSubgraph(id);
            expect(root.subgraph(id)).toBe(sub);
          });
        });
      });
    });
  });
});
