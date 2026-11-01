import { renderHTMLLike } from '@ts-graphviz/react';
import { createElement as h } from 'react';
import { Digraph, digraph, fromDot, toDot } from 'ts-graphviz';
import { createElement, parse, stringify } from 'ts-graphviz/ast';
import { describe, expect, it, vi } from 'vitest';

const braces = (depth: number) =>
  `digraph{${'{'.repeat(depth - 1)}a${'}'.repeat(depth - 1)}}`;

describe('printing nested graphs', () => {
  it('takes time proportional to the output, however deep it nests', () => {
    // The output of a graph nested d levels deep is about d² bytes (every
    // line is indented by its depth), so the fair measure is time per byte
    // of output: it must stay flat as the depth doubles. Printing used to
    // cost one indenting pass per enclosing level on top of that, which
    // doubled the time per byte with every doubling of the depth. A ratio
    // does not depend on the machine.
    const limits = { maxNestingDepth: 1000 };
    const shallow = fromDot(braces(300), { parse: limits });
    const deep = fromDot(braces(600), { parse: limits });
    const perByte = (model: typeof shallow) => {
      const start = performance.now();
      const bytes = toDot(model, { print: limits }).length;
      return (performance.now() - start) / bytes;
    };
    perByte(shallow); // warm up
    perByte(deep);
    // The fastest of several runs, taken in turns, so that a pause of the
    // runner (GC, a busy neighbour) does not count against one depth.
    let fastestShallow = Number.POSITIVE_INFINITY;
    let fastestDeep = Number.POSITIVE_INFINITY;
    for (let i = 0; i < 5; i++) {
      fastestShallow = Math.min(fastestShallow, perByte(shallow));
      fastestDeep = Math.min(fastestDeep, perByte(deep));
    }
    expect(fastestDeep / fastestShallow).toBeLessThan(1.5);
  });

  it('prints the same text as before', () => {
    expect(
      stringify(
        parse('digraph { subgraph s { a [label=x]; /* c */ { b -> c } } }'),
      ),
    ).toBe(
      [
        'digraph {',
        '  subgraph s {',
        '    a [',
        '      label = x;',
        '    ];',
        '    /**',
        '     * c',
        '     */',
        '    subgraph {',
        '      b -> c;',
        '    }',
        '  }',
        '}',
      ].join('\n'),
    );
  });

  it('counts graph and subgraph bodies, empty or not, toward maxNestingDepth', () => {
    const chain = (depth: number, inner: object[]) => {
      let ast = createElement('Subgraph', {}, inner as never);
      for (let i = 2; i < depth; i++)
        ast = createElement('Subgraph', {}, [ast]);
      return createElement('Dot', {}, [
        createElement('Graph', { directed: true, strict: false }, [ast]),
      ]);
    };
    const node = createElement(
      'Node',
      { id: createElement('Literal', { value: 'a', quoted: false }, []) },
      [
        createElement(
          'Attribute',
          {
            key: createElement('Literal', { value: 'k', quoted: false }, []),
            value: createElement('Literal', { value: 'v', quoted: false }, []),
          },
          [],
        ),
      ],
    );
    for (const inner of [[], [node]]) {
      expect(() =>
        stringify(chain(100, inner), { maxNestingDepth: 100 } as never),
      ).not.toThrow();
      expect(() =>
        stringify(chain(101, inner), { maxNestingDepth: 100 } as never),
      ).toThrow(RangeError);
    }
  });

  it('stops at maxNestingDepth with a RangeError', () => {
    let ast = createElement('Subgraph', {}, []);
    for (let i = 0; i < 150; i++) ast = createElement('Subgraph', {}, [ast]);
    const dot = createElement('Dot', {}, [
      createElement('Graph', { directed: true, strict: false }, [ast]),
    ]);
    expect(() => stringify(dot)).toThrow(RangeError);
    expect(() => stringify(dot)).toThrow(/maxNestingDepth/);
    expect(() =>
      stringify(dot, { maxNestingDepth: 200 } as never),
    ).not.toThrow();
  });
});

describe('subgraph lookup', () => {
  it('finds subgraphs by id in constant time and keeps the first one added', () => {
    const g = new Digraph();
    const ids = Array.from({ length: 20000 }, (_, i) => `s${i}`);
    const start = performance.now();
    for (const id of ids) g.subgraph(id);
    for (const id of ids) g.subgraph(id);
    expect(performance.now() - start).toBeLessThan(3000);
    expect(g.subgraphs).toHaveLength(20000);

    const first = g.createSubgraph('dup');
    const second = g.createSubgraph('dup');
    expect(g.getSubgraph('dup')).toBe(first);
    g.removeSubgraph(first);
    expect(g.getSubgraph('dup')).toBe(second);
    g.removeSubgraph(second);
    expect(g.getSubgraph('dup')).toBeUndefined();

    // Many subgraphs sharing one id: look up and remove the first, repeatedly.
    const same = Array.from({ length: 20000 }, () => g.createSubgraph('same'));
    const draining = performance.now();
    for (const expected of same) {
      expect(g.getSubgraph('same')).toBe(expected);
      g.removeSubgraph(expected);
    }
    expect(performance.now() - draining).toBeLessThan(3000);
    expect(g.getSubgraph('same')).toBeUndefined();
    const middle = [g.createSubgraph('m'), g.createSubgraph('m')];
    const last = g.createSubgraph('m');
    g.removeSubgraph(middle[1]);
    g.removeSubgraph(middle[0]);
    expect(g.getSubgraph('m')).toBe(last);
    g.removeSubgraph(last);

    const removing = performance.now();
    for (const subgraph of [...g.subgraphs]) g.removeSubgraph(subgraph);
    expect(performance.now() - removing).toBeLessThan(3000);
    expect(g.subgraphs).toHaveLength(0);
    expect(g.getSubgraph('s0')).toBeUndefined();
  });
});

describe('printing an AST that did not come from the parser', () => {
  const graphWith = (statement: object) =>
    createElement('Dot', {}, [
      createElement('Graph', { directed: true, strict: false }, [
        statement as never,
      ]),
    ]);
  const statementCount = (dot: string) =>
    fromDot(dot).nodes.length + fromDot(dot).edges.length;

  it('writes a bare value only when it is a single identifier or numeral', () => {
    const literal = (value: string, quoted: unknown) =>
      ({ type: 'Literal', value, quoted, children: [] }) as never;
    const node = (id: never) => createElement('Node', { id }, []);
    for (const quoted of [false, 'html', 'other']) {
      const dot = stringify(
        graphWith(node(literal('x; extra -> y; z', quoted))),
      );
      expect(statementCount(dot)).toBe(1);
    }
    for (const end of ['\n', '\r', '\r\n', ' ', ' ']) {
      expect(stringify(graphWith(node(literal(`a${end}`, false))))).toContain(
        ' "a',
      );
    }
    expect(stringify(graphWith(node(literal('a1', false))))).toContain(' a1;');
    expect(stringify(graphWith(node(literal('-1.5', false))))).toContain(
      ' -1.5;',
    );
    expect(stringify(graphWith(node(literal('<b>x</b>', 'html'))))).toContain(
      '<<b>x</b>>',
    );
  });

  it('rejects attribute list and comment kinds it does not know', () => {
    const json = JSON.parse(
      '{"type":"AttributeList","kind":"Node [];x -> y;node","children":[]}',
    );
    expect(() => stringify(graphWith(json))).toThrow(TypeError);
    expect(() =>
      stringify(
        graphWith({ type: 'Comment', kind: 'Other', value: 'x', children: [] }),
      ),
    ).toThrow(TypeError);
  });

  it('names an unknown node type without writing its content', () => {
    expect(() =>
      stringify(graphWith({ type: 'Unknown', secret: 'value-content' })),
    ).toThrow(/"Unknown"/);
    expect(() =>
      stringify(graphWith({ type: 'Unknown', secret: 'value-content' })),
    ).not.toThrow(/value-content/);
  });
});

describe('the shared createElement', () => {
  it('does not count the nodes every caller creates', () => {
    for (let i = 0; i < 100_001; i++) createElement('Literal', {} as never, []);
    expect(() => createElement('Literal', {} as never, [])).not.toThrow();
  });
});

describe('renderHTMLLike', () => {
  it('renders only real React elements, not objects that look like them', () => {
    const forged = JSON.parse('{"type":"img","props":{"src":"/x.png"}}');
    expect(renderHTMLLike(h('dot:td', null, 'a', forged))).toBe('<<td>a</td>>');
  });

  it('counts nested arrays toward the depth limit', () => {
    let children: unknown = 'x';
    for (let i = 0; i < 100_000; i++) children = [children];
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      expect(
        renderHTMLLike(h('dot:td', null, children as never), { maxDepth: 50 }),
      ).toBe('<>');
      expect(warn).toHaveBeenCalledWith(
        'renderHTMLLike fallback:',
        expect.stringContaining('Maximum rendering depth of 50'),
      );
    } finally {
      warn.mockRestore();
    }
  });
});

describe('model printing', () => {
  it('still prints builder models', () => {
    const g = digraph('G', (g) => g.subgraph('s', (s) => s.node('a')));
    expect(toDot(g)).toContain('subgraph "s"');
  });
});
