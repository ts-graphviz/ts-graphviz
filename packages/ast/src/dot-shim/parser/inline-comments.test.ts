import { spawnSync } from 'node:child_process';
import { beforeEach, describe, expect, it } from 'vitest';
import type {
  ASTNode,
  AttributeASTNode,
  EdgeASTNode,
  GraphASTNode,
  NodeASTNode,
  NodeRefASTNode,
} from '../../types.js';
import { stringify } from '../printer/stringify.js';
import { parse } from './parse.js';

// Comments inside statements (#1710): Graphviz reads them as whitespace;
// the parser keeps them on the node next to them.
const graphOf = (dot: string) => parse(dot).children[0] as GraphASTNode;
const values = (comments: ASTNode['leadingComments']) =>
  comments?.map((c) => `${c.kind}:${c.value}`);

describe('comments inside statements', { tags: ['SM-1'] }, () => {
  it('attaches a comment after a node on the same line as trailing', () => {
    const edge = graphOf('digraph { a /* c */ -> b }')
      .children[0] as EdgeASTNode;
    expect(
      values((edge.targets[0] as NodeRefASTNode).trailingComments),
    ).toEqual(['Block:c']);
  });

  it('attaches a comment that starts a line as leading of the next node', () => {
    const edge = graphOf('digraph { a ->\n  /* c */ b }')
      .children[0] as EdgeASTNode;
    expect(values((edge.targets[1] as NodeRefASTNode).leadingComments)).toEqual(
      ['Block:c'],
    );
  });

  it('attaches comments around `=` to the key and value', () => {
    const attr = graphOf('digraph { a [color /* k */ =\n /* v */ red] }')
      .children[0] as NodeASTNode;
    const item = attr.children[0] as AttributeASTNode;
    expect(values(item.key.trailingComments)).toEqual(['Block:k']);
    expect(values(item.value.leadingComments)).toEqual(['Block:v']);
  });

  it('attaches a header comment without an id as dangling on the graph', () => {
    expect(values(graphOf('digraph /* c */ { a }').danglingComments)).toEqual([
      'Block:c',
    ]);
    expect(values(graphOf('digraph /* c */ G { a }').danglingComments)).toEqual(
      ['Block:c'],
    );
  });

  it('keeps line comments inside a statement', () => {
    const edge = graphOf('digraph { a // c\n -> # m\n b }')
      .children[0] as EdgeASTNode;
    expect(
      values((edge.targets[0] as NodeRefASTNode).trailingComments),
    ).toEqual(['Slash:c']);
    expect(values((edge.targets[1] as NodeRefASTNode).leadingComments)).toEqual(
      ['Macro:m'],
    );
  });

  it('leaves comments between statements as Comment statements', () => {
    const graph = graphOf('digraph {\n a\n // between\n b\n}');
    expect(graph.children.map((c) => c.type)).toEqual([
      'Node',
      'Comment',
      'Node',
    ]);
    expect(
      graph.children.some((c) => c.trailingComments || c.leadingComments),
    ).toBe(false);
  });

  it('does not duplicate a line of a multi-line // comment', () => {
    const graph = graphOf('digraph {\n a -> b\n // one\n // two\n c\n}');
    expect(graph.children.map((c) => c.type)).toEqual([
      'Edge',
      'Comment',
      'Node',
    ]);
    expect(JSON.stringify(graph)).not.toContain('Comments');
  });
});

let dotInstalled: boolean | undefined;
/** Whether `dot` runs, asked by the first test that needs it. */
const hasDot = () =>
  (dotInstalled ??= spawnSync('dot', ['-V'], { timeout: 10_000 }).status === 0);
const canon = (dot: string) => {
  const r = spawnSync('dot', ['-Tcanon'], {
    input: dot,
    encoding: 'utf8',
    timeout: 30_000,
  });
  expect(r.status, `${dot}\n${r.stderr}`).toBe(0);
  return r.stdout;
};

describe('comments inside statements are printed back', {
  tags: ['SM-1', 'process'],
}, () => {
  beforeEach(({ skip }) => skip(!hasDot(), 'dot is not installed'));
  it.each([
    'digraph /* c */ G /* d */ { a }',
    'digraph /* c */ { a }',
    'strict /* s */ graph { a -- b }',
    'digraph { a /* c */ -> /* d */ b }',
    'digraph { a // line\n -> b }',
    'digraph { a ->\n # macro\n b }',
    'digraph { a /* c */ [color=red] }',
    'digraph { a [color /* k */ = /* v */ red, /* x */ shape=box] }',
    'digraph { node /* n */ [shape=box] }',
    'digraph { rankdir /* r */ = LR }',
    'digraph { a /* p */ : /* q */ p -> b }',
    'digraph { subgraph /* s */ x /* t */ { a } }',
    'digraph { subgraph // s\n { a } -> b }',
    'digraph { a, /* l */ b -> c }',
    'digraph { a -> b /* e */ ; c }',
    'digraph { a /* multi\n line */ -> b }',
  ])('%j', (dot) => {
    const printed = stringify(parse(dot));
    // Graphviz reads the reprint as the same graph, and the comments survive
    // a second round.
    expect(canon(printed)).toBe(canon(dot));
    expect(stringify(parse(printed))).toBe(printed);
    for (const word of dot.match(/[a-z]+(?= \*\/)|(?<=\/\/ |# )[a-z]+/g) ??
      []) {
      expect(printed).toContain(word);
    }
  });
});

describe('attachComments on nodes from a custom builder', () => {
  it('fills a comment field that is present but undefined', async () => {
    const { attachComments } = await import('./attach-comments.js');
    const at = (offset: number) => ({ offset, line: 1, column: offset + 1 });
    const node = {
      type: 'Node',
      location: { start: at(10), end: at(11) },
      children: [],
      trailingComments: undefined,
    };
    const root = {
      type: 'Dot',
      location: { start: at(0), end: at(30) },
      children: [node],
    };
    attachComments(root as never, [
      { kind: 'Block', value: 'c', location: { start: at(12), end: at(17) } },
    ]);
    expect(node.trailingComments).toMatchObject([{ value: 'c' }]);
  });

  it('gives each node an array of its own, not one from its class', async () => {
    const { attachComments } = await import('./attach-comments.js');
    const at = (offset: number) => ({ offset, line: 1, column: offset + 1 });
    const shared: unknown[] = [];
    class CustomNode {
      readonly type = 'Node';
      readonly children = [];
      constructor(readonly location: object) {}
      get trailingComments() {
        return shared;
      }
    }
    const a = new CustomNode({ start: at(10), end: at(11) });
    const b = new CustomNode({ start: at(20), end: at(21) });
    const root = {
      type: 'Dot',
      location: { start: at(0), end: at(30) },
      children: [a, b],
    };
    attachComments(root as never, [
      { kind: 'Block', value: 'c', location: { start: at(12), end: at(17) } },
    ]);
    expect(shared).toStrictEqual([]);
    expect(a.trailingComments).toMatchObject([{ value: 'c' }]);
    expect(b.trailingComments).toBe(shared);
  });
});

describe('comment text', () => {
  it('reads CRLF line breaks in a block comment as "\\n"', () => {
    const ast = parse(
      'digraph {\r\n/* a\r\n b */\r\nx;\r\n/* c\r\n */ y;\r\n}',
    );
    const graph = ast.children[0] as GraphASTNode;
    const texts = JSON.stringify(graph);
    expect(texts).not.toContain('\\r');
    expect(graph.children[0]).toMatchObject({ type: 'Comment', value: 'a\nb' });
  });

  it('reads a comment with more lines than a call takes arguments', () => {
    const lines = 500_000;
    const ast = parse(`/*${'\n x'.repeat(lines)}\n*/\ndigraph {}`, {
      maxInputSize: 0,
    });
    const comment = ast.children[0] as { value: string };
    expect(comment.value.split('\n')).toHaveLength(lines);
  });

  it('keeps a lone CR in an attached comment as text of one comment', () => {
    const ast = parse('digraph { a /* c */ -> b }');
    const edge = (ast.children[0] as GraphASTNode).children[0] as EdgeASTNode;
    const ref = edge.targets[0] as NodeRefASTNode;
    ref.trailingComments = [
      { type: 'Comment', kind: 'Slash', value: 'first\rsecond' },
    ] as never;
    const again = parse(stringify(ast));
    const edgeAgain = (again.children[0] as GraphASTNode)
      .children[0] as EdgeASTNode;
    expect(
      values((edgeAgain.targets[0] as NodeRefASTNode).trailingComments),
    ).toEqual(['Slash:first\rsecond']);
  });
});
