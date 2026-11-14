import { fromModel } from '@ts-graphviz/ast';
import {
  AttributeList,
  type CommentModel,
  Digraph,
  Dot,
  defaultModelKit,
  Edge,
  fromDot,
  fromDotAll,
  isCommentModel,
  Node,
  Subgraph,
  toDot,
} from 'ts-graphviz';
import { stringify } from 'ts-graphviz/ast';
import { describe, expect, test } from 'vitest';

const brief = (comments: ReadonlyArray<CommentModel>) =>
  comments.map((c) => [c.text, c.kind, c.position]);

describe('addComment, removeComment and comments', () => {
  test('on every kind of model', () => {
    const models = [
      new Node('a'),
      new Edge([{ id: 'a' }, { id: 'b' }]),
      new AttributeList('Node'),
      new Subgraph('s'),
      new Digraph('G'),
      new Dot(),
    ];
    for (const model of models) {
      const c = model.addComment('x', { kind: 'Macro' });
      expect(isCommentModel(c)).toBe(true);
      expect(brief(model.comments)).toEqual([['x', 'Macro', 'leading']]);
      model.removeComment(c);
      expect(model.comments).toEqual([]);
    }
  });

  test('the positions each model takes', () => {
    for (const model of [
      new Node('a'),
      new Edge([{ id: 'a' }, { id: 'b' }]),
      new AttributeList('Edge'),
    ]) {
      model.addComment('t', { position: 'trailing' });
      expect(() =>
        model.addComment('e', { position: 'end' as 'trailing' }),
      ).toThrow(expect.objectContaining({ code: 'TSG_ERR_INVALID_COMMENT' }));
    }
    for (const model of [new Subgraph(), new Digraph()]) {
      model.addComment('t', { position: 'trailing' });
      model.addComment('e', { position: 'end' });
      expect(model.comments.map((c) => c.position)).toEqual([
        'trailing',
        'end',
      ]);
    }
    const dot = new Dot();
    dot.addComment('e', { position: 'end' });
    expect(() =>
      dot.addComment('t', { position: 'trailing' as 'end' }),
    ).toThrow(expect.objectContaining({ code: 'TSG_ERR_INVALID_COMMENT' }));
  });

  test('a text that is not a string, or an unknown kind, is refused', () => {
    const node = new Node('a');
    expect(() => node.addComment(1 as unknown as string)).toThrow(
      expect.objectContaining({ code: 'TSG_ERR_INVALID_COMMENT' }),
    );
    expect(() =>
      node.addComment('x', { kind: 'Line' as unknown as 'Block' }),
    ).toThrow(expect.objectContaining({ code: 'TSG_ERR_INVALID_COMMENT' }));
    expect(node.comments).toEqual([]);
  });

  test('comments are frozen values, and comments is a copy', () => {
    const node = new Node('a');
    const c = node.addComment('x');
    expect(Object.isFrozen(c)).toBe(true);
    expect(Object.isFrozen(node.comments)).toBe(true);
    expect(node.comments).not.toBe(node.comments);
    // Removing a comment another model holds does nothing here.
    new Node('b').removeComment(c);
    expect(node.comments).toEqual([c]);
  });

  test('options are read as own properties', () => {
    const node = new Node('a');
    node.addComment('x', Object.create({ position: 'trailing' }));
    expect(node.comments.map((c) => c.position)).toEqual(['leading']);
  });
});

describe('the deprecated comment', () => {
  test('is the first leading comment', () => {
    const node = new Node('a');
    node.addComment('t', { position: 'trailing' });
    expect(node.comment).toBeUndefined();
    node.addComment('one', { kind: 'Block' });
    node.addComment('two');
    expect(node.comment).toBe('one');
  });

  test('setting it replaces the first leading comment, keeping its kind and place', () => {
    const node = new Node('a');
    node.addComment('t', { position: 'trailing' });
    node.addComment('one', { kind: 'Block' });
    node.addComment('two');
    node.comment = 'ONE';
    expect(brief(node.comments)).toEqual([
      ['t', undefined, 'trailing'],
      ['ONE', 'Block', 'leading'],
      ['two', undefined, 'leading'],
    ]);
  });

  test('setting it with no leading comment adds one first; undefined removes it', () => {
    const node = new Node('a');
    node.addComment('t', { position: 'trailing' });
    node.comment = 'c';
    expect(brief(node.comments)).toEqual([
      ['c', undefined, 'leading'],
      ['t', undefined, 'trailing'],
    ]);
    node.comment = undefined;
    expect(brief(node.comments)).toEqual([['t', undefined, 'trailing']]);
  });

  test("a DOT source's comment joins all its comments; setting it replaces them", () => {
    const dot = new Dot([], 'header');
    expect(brief(dot.comments)).toEqual([['header', undefined, 'leading']]);
    dot.addComment('footer', { position: 'end' });
    expect(dot.comment).toBe('header\nfooter');
    dot.comment = 'only';
    expect(brief(dot.comments)).toEqual([['only', undefined, 'leading']]);
    // A refused text removes nothing.
    expect(() => {
      dot.comment = 1 as unknown as string;
    }).toThrow(expect.objectContaining({ code: 'TSG_ERR_INVALID_COMMENT' }));
    expect(brief(dot.comments)).toEqual([['only', undefined, 'leading']]);
    dot.comment = undefined;
    expect(dot.comments).toEqual([]);
  });
});

describe('fromDot and toDot keep comments, their kind and their place', () => {
  test('in a graph body', () => {
    const source = `digraph G {
  /* lead a */
  a; // trails a
  # lead the edge
  a -> b; /* trails the edge */
  node [color=red]; // trails the list
  subgraph s {
    x; # trails x
    // end of s
  } // trails s
  /* end of G */
} // trails G
# end of the source`;
    const g = fromDot(source);
    const a = g.getNode('a');
    expect(a && brief(a.comments)).toEqual([
      ['lead a', 'Block', 'leading'],
      ['trails a', 'Slash', 'trailing'],
    ]);
    const [edge] = g.edges;
    expect(brief(edge.comments)).toEqual([
      ['lead the edge', 'Macro', 'leading'],
      ['trails the edge', 'Block', 'trailing'],
    ]);
    const s = g.getSubgraph('s');
    // A body's end comments are read before the comment that trails it.
    expect(s && brief(s.comments)).toEqual([
      ['end of s', 'Slash', 'end'],
      ['trails s', 'Slash', 'trailing'],
    ]);
    expect(brief(g.comments)).toEqual([
      ['end of G', 'Block', 'end'],
      ['trails G', 'Slash', 'trailing'],
    ]);
    expect(toDot(g)).toMatchInlineSnapshot(`
      "digraph "G" {
        /**
         * lead a
         */
        "a"; // trails a

        # lead the edge
        "a" -> "b"; /* trails the edge */
        node [
          color = "red";
        ]; // trails the list

        subgraph "s" {
          "x"; # trails x

          // end of s
        } // trails s

        /**
         * end of G
         */
      } // trails G
      "
    `);
    // Read again, the DOT gives the same comments.
    const again = fromDot(toDot(g));
    expect(brief(again.getNode('a')?.comments ?? [])).toEqual(
      brief(a?.comments ?? []),
    );
    expect(brief(again.edges[0].comments)).toEqual(brief(edge.comments));
    expect(brief(again.getSubgraph('s')?.comments ?? [])).toEqual(
      brief(s?.comments ?? []),
    );
    expect(brief(again.comments)).toEqual(brief(g.comments));
  });

  test('a node mentioned again takes the comments of each mention', () => {
    const g = fromDot(
      'digraph {\n  a;\n  b;\n  /* later */\n  a [color=red]\n}',
    );
    // One node, at its first place: the comment of the later mention joins it.
    expect(brief(g.getNode('a')?.comments ?? [])).toEqual([
      ['later', 'Block', 'leading'],
    ]);
  });

  test('a comment after a graph attribute assignment leads the next statement', () => {
    const g = fromDot('digraph {\n  color = blue; // after\n  a\n}');
    expect(brief(g.getNode('a')?.comments ?? [])).toEqual([
      ['after', 'Slash', 'leading'],
    ]);
  });

  test('a default attribute list with comments but no attributes keeps them', () => {
    const g = new Digraph();
    g.attributes.node.addComment('defaults for nodes');
    expect(toDot(g)).toContain('// defaults for nodes');
  });

  test('trailing comments are kept when a statement is converted alone', () => {
    const node = new Node('a');
    node.addComment('note', { position: 'trailing', kind: 'Block' });
    expect(stringify(fromModel(node))).toBe('"a"; /* note */');
  });

  test('leading comments are kept when a statement or a graph is converted alone', () => {
    const node = new Node('a');
    node.addComment('first');
    node.addComment('second', { kind: 'Block' });
    node.addComment('note', { position: 'trailing', kind: 'Block' });
    expect(stringify(fromModel(node))).toBe(
      '// first\n/* second */\n"a"; /* note */',
    );
    const s = new Subgraph('s');
    s.addComment('lead s');
    const x = new Node('x');
    x.addComment('lead x');
    s.addNode(x);
    expect(toDot(s)).toBe('// lead s\nsubgraph "s" {\n  // lead x\n  "x";\n}');
    const g = new Digraph('G');
    g.addComment('lead G');
    expect(stringify(fromModel(g))).toBe('// lead G\ndigraph "G" {}');
    // Through the DOT source, written once.
    expect(toDot(g)).toBe('// lead G\ndigraph "G" {}');
  });

  test('a block comment after a multi-line trailing block comment on its last line trails the statement too', () => {
    const g = new Digraph();
    const a = defaultModelKit.createNode('a');
    g.addNode(a);
    a.addComment('x\ny', { position: 'trailing', kind: 'Block' });
    a.addComment('z', { position: 'trailing', kind: 'Block' });
    g.addNode(defaultModelKit.createNode('b'));
    const again = fromDot(toDot(g));
    expect(brief(again.getNode('a')?.comments ?? [])).toEqual([
      ['x\ny', 'Block', 'trailing'],
      ['z', 'Block', 'trailing'],
    ]);
    expect(again.getNode('b')?.comments).toEqual([]);
  });

  test('a comment at a position the model does not take is refused', () => {
    const node = {
      $$type: 'Node',
      id: 'a',
      comments: [
        { $$type: 'Comment', text: 'c', kind: undefined, position: 'end' },
      ],
      getAttribute: () => undefined,
      hasAttribute: () => false,
      getAttributeNames: () => [],
    };
    expect(() => fromModel(node as never)).toThrow(
      expect.objectContaining({ code: 'TSG_ERR_INVALID_COMMENT' }),
    );
  });

  test('a multi-line trailing block comment keeps its text; trailing line comments of one kind read back as one', () => {
    const g = new Digraph();
    const a = defaultModelKit.createNode('a');
    g.addNode(a);
    a.addComment('one\ntwo', { position: 'trailing', kind: 'Block' });
    const b = defaultModelKit.createNode('b');
    g.addNode(b);
    b.addComment('x', { position: 'trailing', kind: 'Slash' });
    b.addComment('y', { position: 'trailing', kind: 'Slash' });
    const again = fromDot(toDot(g));
    expect(brief(again.getNode('a')?.comments ?? [])).toEqual([
      ['one\ntwo', 'Block', 'trailing'],
    ]);
    // A line comment runs to the end of its line, so the second is written
    // on the next line, and DOT reads consecutive // lines as one comment.
    expect(brief(again.getNode('b')?.comments ?? [])).toEqual([
      ['x\ny', 'Slash', 'trailing'],
    ]);
  });

  test('around the graphs of a DOT source', () => {
    const source = `// lead G
digraph G { a } // trails G
graph H { b }
# end of the source`;
    const [g, h] = fromDotAll(source);
    expect(brief(g.comments)).toEqual([
      ['lead G', 'Slash', 'leading'],
      ['trails G', 'Slash', 'trailing'],
    ]);
    expect(h.comments).toEqual([]);
  });

  test('a comment without a kind is written as commentKind says', () => {
    const g = new Digraph();
    const a = new Node('a');
    a.addComment('note');
    g.addNode(a);
    expect(toDot(g)).toContain('// note');
    expect(toDot(g, { convert: { commentKind: 'Block' } })).toContain(
      ' * note',
    );
  });

  test('a model without comments has its comment as a leading comment', () => {
    const none = {
      getAttribute: () => undefined,
      hasAttribute: () => false,
      getAttributeNames: () => [],
    };
    const list = (kind: string) => ({
      $$type: 'AttributeList',
      $$kind: kind,
      ...none,
    });
    const graph = {
      $$type: 'Graph',
      directed: true,
      strict: false,
      attributes: {
        graph: list('Graph'),
        node: list('Node'),
        edge: list('Edge'),
      },
      statements: [{ $$type: 'Node', id: 'a', comment: 'old', ...none }],
      ...none,
    };
    expect(stringify(fromModel(graph as never))).toContain('// old');
  });
});
