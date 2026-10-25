import type {
  EdgeASTNode,
  NodeASTNode,
  NodeRefListASTNode,
  SubgraphASTNode,
} from '@ts-graphviz/ast';
import { fromModel } from '@ts-graphviz/ast';
import { digraph, toDot } from 'ts-graphviz';
import { describe, expect, it } from 'vitest';

// Edge grouping tests cover both AST conversion and DOT rendering
describe('Edge grouping feature', () => {
  describe('AST conversion', () => {
    it('should write a group without ports as a subgraph of its nodes', () => {
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
      // fromModel of a root graph yields the Graph node itself
      expect(ast.type).toBe('Graph');
      const edgeNode = ast.children[0] as EdgeASTNode;
      const groupNode = edgeNode.targets[1] as SubgraphASTNode;
      expect(groupNode.type).toBe('Subgraph');
      expect(groupNode.children).toHaveLength(1);
      expect((groupNode.children[0] as NodeASTNode).id.value).toBe('y');
    });

    it('should write a group with a port as a comma list, which keeps ports (#1708)', () => {
      const ast = fromModel(
        digraph((g) => {
          g.edge(['x', ['y:p', 'z']]);
        }),
      );
      const edgeNode = ast.children[0] as EdgeASTNode;
      const list = edgeNode.targets[1] as NodeRefListASTNode;
      expect(list.type).toBe('NodeRefList');
      expect(list.refs.map((r) => [r.id.value, r.port?.value])).toStrictEqual([
        ['y', 'p'],
        ['z', undefined],
      ]);
      expect(
        toDot(
          digraph((g) => {
            g.edge(['x', ['y:p', 'z']]);
          }),
        ),
      ).toContain('"x" -> "y":"p", "z";');
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
