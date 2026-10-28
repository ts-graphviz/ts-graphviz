import { describe, expect, test } from 'vitest';
import { Builder } from './builder.js';
import { createElement, createElementFactory } from './create-element.js';
import { ASTNodeCountExceededError } from './errors.js';

describe('createElement', () => {
  test('node shapes: leaves have no children, groups have refs, no null location', () => {
    const literal = createElement('Literal', { value: 'a', kind: 'bare' }, []);
    expect(literal).toStrictEqual({
      type: 'Literal',
      value: 'a',
      kind: 'bare',
    });
    expect('location' in literal).toBe(false);

    const ref = createElement('NodeRef', { id: literal }, []);
    expect('children' in ref).toBe(false);

    const group = createElement('NodeRefList', {}, [ref]);
    expect(group).toStrictEqual({ type: 'NodeRefList', refs: [ref] });

    const node = createElement('Node', { id: literal }, []);
    expect(node).toStrictEqual({ type: 'Node', id: literal, children: [] });
  });

  test('children and refs in props are ignored; the third argument wins', () => {
    const literal = createElement('Literal', { value: 'a', kind: 'bare' });
    const ref = createElement('NodeRef', { id: literal });
    const leaf = createElement('Literal', {
      value: 'a',
      kind: 'bare',
      children: [ref],
    } as never);
    expect('children' in leaf).toBe(false);
    const group = createElement(
      'NodeRefList',
      { children: [ref], refs: [] } as never,
      [ref],
    );
    expect(group).toStrictEqual({ type: 'NodeRefList', refs: [ref] });
  });

  test('a Builder with a locationFunction gives each node the current location', () => {
    const location = {
      start: { offset: 0, line: 1, column: 1 },
      end: { offset: 3, line: 1, column: 3 },
    };
    const builder = new Builder({ locationFunction: () => location });
    const literal = builder.createElement('Literal', {
      value: 'a',
      kind: 'bare',
    });
    const node = builder.createElement('Node', { id: literal }, []);
    expect(node).toStrictEqual({
      type: 'Node',
      id: { type: 'Literal', value: 'a', kind: 'bare', location },
      children: [],
      location,
    });
  });

  test('Dot', () => {
    const ast = createElement('Dot', {}, []);
    expect(ast).toMatchSnapshot();
  });

  test('Graph', () => {
    const ast = createElement('Graph', {
      strict: false,
      directed: true,
    });
    expect(ast).toMatchSnapshot();
  });

  test('Node', () => {
    const ast = createElement('Node', {
      id: createElement('Literal', {
        value: 'node_id',
        kind: 'bare',
      }),
    });
    expect(ast).toMatchSnapshot();
  });

  test('Edge', () => {
    const ast = createElement('Edge', {
      targets: [
        createElement('NodeRef', {
          id: createElement('Literal', {
            value: 'a',
            kind: 'quoted',
          }),
        }),
        createElement('NodeRef', {
          id: createElement('Literal', {
            value: 'b',
            kind: 'quoted',
          }),
        }),
      ],
    });
    expect(ast).toMatchSnapshot();
  });

  test('NodeRef', () => {
    const ast = createElement('NodeRef', {
      id: createElement('Literal', {
        value: 'b',
        kind: 'quoted',
      }),
    });
    expect(ast).toMatchSnapshot();
  });

  test('NodeRefList', () => {
    const ast = createElement('NodeRefList', {}, [
      createElement('NodeRef', {
        id: createElement('Literal', {
          value: 'a',
          kind: 'quoted',
        }),
      }),
      createElement('NodeRef', {
        id: createElement('Literal', {
          value: 'b',
          kind: 'quoted',
        }),
      }),
    ]);
    expect(ast).toMatchSnapshot();
  });

  test('Subgraph', () => {
    const ast = createElement('Subgraph', {}, []);
    expect(ast).toMatchSnapshot();
  });

  test('Literal', () => {
    const ast = createElement('Literal', {
      value: 'literal value',
      kind: 'quoted',
    });
    expect(ast).toMatchSnapshot();
  });

  test('Coment', () => {
    const ast = createElement('Comment', {
      kind: 'Macro',
      value: 'This is comment',
    });
    expect(ast).toMatchSnapshot();
  });

  test('Attribute', () => {
    const ast = createElement('Attribute', {
      key: createElement('Literal', {
        value: 'color',
        kind: 'bare',
      }),
      value: createElement('Literal', {
        value: 'red',
        kind: 'bare',
      }),
    });
    expect(ast).toMatchSnapshot();
  });
});

// issue #1624
describe('the shared createElement', { tags: ['SM-1'] }, () => {
  test('does not stop after 100,000 nodes in one process', () => {
    expect(() => {
      for (let i = 0; i < 100_001; i++) {
        createElement('Literal', { value: 'a', kind: 'bare' }, []);
      }
    }).not.toThrow();
  });
});

describe('createElementFactory', () => {
  test('returns an independent createElement function', () => {
    const createElement1 = createElementFactory();
    const createElement2 = createElementFactory();

    // Each factory produces its own counter
    for (let i = 0; i < 10; i++) {
      createElement1('Literal', { value: `a${i}`, kind: 'bare' }, []);
    }

    // createElement2 should not be affected by createElement1's count
    expect(() =>
      createElement2('Literal', { value: 'b', kind: 'bare' }, []),
    ).not.toThrow();
  });

  test('respects maxASTNodes option', () => {
    const createElement = createElementFactory({ maxASTNodes: 3 });

    createElement('Literal', { value: 'a', kind: 'bare' }, []);
    createElement('Literal', { value: 'b', kind: 'bare' }, []);
    createElement('Literal', { value: 'c', kind: 'bare' }, []);

    expect(() =>
      createElement('Literal', { value: 'd', kind: 'bare' }, []),
    ).toThrow(ASTNodeCountExceededError);
  });

  test('maxASTNodes=0 disables the limit', () => {
    const createElement = createElementFactory({ maxASTNodes: 0 });

    // Should not throw even with many nodes
    for (let i = 0; i < 1000; i++) {
      createElement('Literal', { value: `v${i}`, kind: 'bare' }, []);
    }
  });

  test('independent counters do not accumulate across factories', () => {
    // Simulate the fix: each call creates a fresh builder
    for (let i = 0; i < 200; i++) {
      const createElement = createElementFactory({ maxASTNodes: 1000 });
      for (let j = 0; j < 10; j++) {
        createElement('Literal', { value: `v${j}`, kind: 'bare' }, []);
      }
    }
    // Total nodes created = 2000, but no single factory exceeded 1000
  });
});
