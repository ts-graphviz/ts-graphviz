import type { EdgeASTNode, NodeRefGroupASTNode } from '@ts-graphviz/ast';
import { fromModel } from '@ts-graphviz/ast';
import { digraph, toDot } from 'ts-graphviz';
import { describe, expect, it } from 'vitest';

// Edge grouping tests cover both AST conversion and DOT rendering
describe('Edge grouping feature', () => {
  describe('AST conversion', () => {
    it('should include a NodeRefGroup when multiple targets are grouped', () => {
      const ast = fromModel(
        digraph((g) => {
          g.edge(['a', ['b', 'c']]);
        }),
      );
      expect(ast).toMatchSnapshot();
    });

    it('should handle grouping with a single target correctly in AST', () => {
      const ast = fromModel(
        digraph((g) => {
          g.edge(['x', ['y']]);
        }),
      );
      const graphNode = ast.children[0];
      expect(graphNode.type).toBe('Graph');
      const edgeNode = graphNode.children[0] as EdgeASTNode;
      const groupNode = edgeNode.targets[1] as NodeRefGroupASTNode;
      expect(groupNode.type).toBe('NodeRefGroup');
      expect(groupNode.children).toHaveLength(1);
      expect(groupNode.children[0].id.value).toBe('y');
    });
  });

  describe('DOT generation', () => {
    it('renders grouped targets correctly in DOT for multiple targets', () => {
      const dot = toDot(
        digraph((g) => {
          g.edge(['a', ['b', 'c']]);
        }),
      );
      expect(dot).toMatchInlineSnapshot(`
        "digraph {
          "a" -> {"b" "c"};
        }"
      `);
    });

    it('renders grouping for a single target without extra separators', () => {
      const dot = toDot(
        digraph((g) => {
          g.edge(['x', ['y']]);
        }),
      );
      expect(dot).toMatchInlineSnapshot(`
        "digraph {
          "x" -> {"y"};
        }"
      `);
    });
  });
});
